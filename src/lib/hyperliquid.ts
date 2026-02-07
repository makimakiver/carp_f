/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from "ethers";
import {
  Curve,
  publicKeyFromDWalletOutput,
  IkaClient,
  getNetworkConfig,
} from "@ika.xyz/sdk";
import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";

/* ================================================================
   HYPERLIQUID CONTRACT ADDRESSES
   ================================================================ */

export const USDC_ADDRESS = "0x2B3370eE501B4a559b57D449569354196457D8Ab";
const USDC = USDC_ADDRESS;
const CORE_DEPOSIT_WALLET = "0x0B80659a4076E9E93C7DbE0f10675A16a3e5C206";
const CORE_WRITER = "0x3333333333333333333333333333333333333333";
const MULTICALL3 = "0xcA11bde05977b3631167028862bE2a173976CA11";

/* ================================================================
   ABIs
   ================================================================ */

const usdcAbi = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
];
const coreDepositAbi = [
  "function deposit(uint256 amount, uint32 destinationDex)",
];
const coreWriterAbi = [
  "function sendRawAction(bytes data) external",
];
const multicall3Abi = [
  "function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[])",
];

/* ================================================================
   ASSET INDEX MAPPING
   ================================================================ */

export const ASSET_INDEX: Record<string, number> = {
  "BTC-PERP": 0,
  "ETH-PERP": 1,
  "SOL-PERP": 4,
  "ARB-PERP": 17,
};

/* ================================================================
   PROVIDER HELPER
   ================================================================ */

/**
 * Create a JsonRpcProvider with a static network to avoid
 * eth_getBlockByNumber("latest") auto-detection that fails on Hyperliquid.
 */
export function createHyperEvmProvider(rpcUrl: string): ethers.JsonRpcProvider {
  const network = new ethers.Network("hyperliquid-testnet", 998n);
  return new ethers.JsonRpcProvider(rpcUrl, network, { staticNetwork: network });
}

/* ================================================================
   HELPERS
   ================================================================ */

/**
 * Parse a decimal string into an integer scaled by 1e8 (no floats).
 * e.g. "94500.25" → 9450025000000n
 */
function parseFixed8(s: string): bigint {
  const [whole, frac = ""] = s.split(".");
  const fracPadded = (frac + "00000000").slice(0, 8);
  const sign = whole?.startsWith("-") ? -1n : 1n;
  const wholeAbs = whole?.replace("-", "");
  return sign * (BigInt(wholeAbs || "0") * 100_000_000n + BigInt(fracPadded || "0"));
}

/**
 * Encode CoreWriter action bytes:
 * version (1 byte) + actionId (3 bytes BE) + abi.encode(fields)
 */
function encodeCoreWriterAction(actionId: number, encodedAction: string): string {
  if (actionId < 0 || actionId > 0xffffff) throw new Error("actionId out of range");
  const header = new Uint8Array(4);
  header[0] = 0x01; // encoding version
  header[1] = (actionId >> 16) & 0xff;
  header[2] = (actionId >> 8) & 0xff;
  header[3] = actionId & 0xff;
  return ethers.hexlify(header) + encodedAction.slice(2);
}

/* ================================================================
   SHARED TX BUILDER
   ================================================================ */

export interface UnsignedTxResult {
  populated: ethers.TransactionRequest;
  unsignedBytes: Uint8Array;
  digest: string;
}

async function buildSingleUnsignedTx(
  provider: ethers.JsonRpcProvider,
  from: string,
  txReq: ethers.TransactionRequest,
): Promise<UnsignedTxResult> {
  const nonce = await provider.getTransactionCount(from);
  const fee = await provider.getFeeData();
  const net = await provider.getNetwork();

  const base: any = {
    ...txReq,
    nonce,
    chainId: net.chainId,
    type: 2,
    maxFeePerGas: fee.maxFeePerGas ?? undefined,
    maxPriorityFeePerGas: fee.maxPriorityFeePerGas ?? undefined,
  };

  const gasLimit = await provider.estimateGas(base);
  const populated = { ...base, gasLimit };

  const { from: _f, ...txData } = populated; // eslint-disable-line @typescript-eslint/no-unused-vars
  const tx = ethers.Transaction.from(txData);
  const unsignedBytes = ethers.getBytes(tx.unsignedSerialized);

  return { populated, unsignedBytes, digest: ethers.keccak256(unsignedBytes) };
}

/* ================================================================
   PUBLIC TX BUILDERS
   ================================================================ */

/**
 * Build unsigned USDC approve transaction.
 * Approves CORE_DEPOSIT_WALLET to spend `amount` USDC.
 */
export async function buildUnsignedApprove(
  provider: ethers.JsonRpcProvider,
  from: string,
  amount: bigint,
): Promise<UnsignedTxResult> {
  const usdcIface = new ethers.Interface(usdcAbi);
  const data = usdcIface.encodeFunctionData("approve", [
    CORE_DEPOSIT_WALLET,
    amount,
  ]);

  return buildSingleUnsignedTx(provider, from, {
    from,
    to: USDC,
    data,
    value: 0n,
  });
}

/**
 * Build unsigned deposit transaction.
 * Deposits `amount` USDC into HyperCore.
 */
export async function buildUnsignedDeposit(
  provider: ethers.JsonRpcProvider,
  from: string,
  amount: bigint,
  destinationDex: number = 0,
): Promise<UnsignedTxResult> {
  const depositIface = new ethers.Interface(coreDepositAbi);
  const data = depositIface.encodeFunctionData("deposit", [
    amount,
    destinationDex,
  ]);

  return buildSingleUnsignedTx(provider, from, {
    from,
    to: CORE_DEPOSIT_WALLET,
    data,
    value: 0n,
  });
}

/**
 * Build unsigned limit order transaction on Hyperliquid.
 *
 * @param asset     Hyperliquid asset index (0=BTC, 1=ETH, etc.)
 * @param isBuy     true for long, false for short
 * @param limitPx   Limit price as decimal string (e.g. "73000" or "73000.50")
 * @param sz        Size as decimal string (e.g. "0.0001")
 * @param reduceOnly  Whether this is a reduce-only order
 * @param tif       Time in force: 1=ALO, 2=IOC, 3=GTC
 * @param cloid     Client order ID (optional)
 */
export async function buildUnsignedPlaceOrder(
  provider: ethers.JsonRpcProvider,
  from: string,
  asset: number,
  isBuy: boolean,
  limitPx: string,
  sz: string,
  reduceOnly: boolean = false,
  tif: number = 3,
  cloid: bigint = 0n,
): Promise<UnsignedTxResult> {
  const ACTION_ID_LIMIT_ORDER = 1;
  const limitPxScaled = parseFixed8(limitPx);
  const szScaled = parseFixed8(sz);

  const coder = ethers.AbiCoder.defaultAbiCoder();
  const encodedAction = coder.encode(
    ["uint32", "bool", "uint64", "uint64", "bool", "uint8", "uint128"],
    [asset, isBuy, limitPxScaled, szScaled, reduceOnly, tif, cloid],
  );

  const actionData = encodeCoreWriterAction(ACTION_ID_LIMIT_ORDER, encodedAction);
  const iface = new ethers.Interface(coreWriterAbi);
  const data = iface.encodeFunctionData("sendRawAction", [actionData]);

  return buildSingleUnsignedTx(provider, from, {
    from,
    to: CORE_WRITER,
    data,
    value: 0n,
  });
}

/* ================================================================
   BROADCAST SIGNED TX
   ================================================================ */

function splitRSV(raw: Uint8Array) {
  if (raw.length === 65) {
    const r = ethers.hexlify(raw.slice(0, 32));
    const s = ethers.hexlify(raw.slice(32, 64));
    const v0 = raw[64]!;
    const v = v0 >= 27 ? v0 : v0 + 27;
    return { r, s, v };
  }
  if (raw.length === 64) {
    const r = ethers.hexlify(raw.slice(0, 32));
    const s = ethers.hexlify(raw.slice(32, 64));
    return { r, s, v: undefined as number | undefined };
  }
  throw new Error(`Unexpected signature length: ${raw.length}`);
}

async function resolveAddress(addr: ethers.AddressLike): Promise<string> {
  if (typeof addr === "string") return ethers.getAddress(addr);
  if (addr instanceof Promise) return ethers.getAddress(await addr);
  return ethers.getAddress(await addr.getAddress());
}

/**
 * Attach the MPC signature to the unsigned EVM tx and broadcast.
 * Returns the transaction hash.
 */
export async function broadcastSignedTx(
  provider: ethers.JsonRpcProvider,
  populatedTx: ethers.TransactionRequest,
  unsignedBytes: Uint8Array,
  rawSig: Uint8Array,
  expectedFrom?: string,
): Promise<string> {
  const digest = ethers.keccak256(unsignedBytes);
  const rsv = splitRSV(rawSig);
  const r = rsv.r;
  const s = rsv.s;
  let v = rsv.v;

  // If v not supplied, recover by trying both candidates
  if (v === undefined) {
    for (const cand of [27, 28]) {
      try {
        const recovered = ethers.recoverAddress(digest, { r, s, v: cand });
        if (!expectedFrom || recovered.toLowerCase() === expectedFrom.toLowerCase()) {
          v = cand;
          break;
        }
      } catch {
        /* try next */
      }
    }
    if (v === undefined) throw new Error("Could not determine v from signature");
  }

  const txData: ethers.TransactionLike = { signature: { r, s, v } };

  if (populatedTx.to) txData.to = await resolveAddress(populatedTx.to);
  if (populatedTx.from) txData.from = await resolveAddress(populatedTx.from);
  if (populatedTx.nonce != null) txData.nonce = populatedTx.nonce;
  if (populatedTx.gasLimit != null) txData.gasLimit = populatedTx.gasLimit;
  if (populatedTx.data != null) txData.data = populatedTx.data;
  if (populatedTx.value != null) txData.value = populatedTx.value;
  if (populatedTx.chainId != null) txData.chainId = populatedTx.chainId;
  if (populatedTx.type != null) txData.type = populatedTx.type;
  if (populatedTx.maxFeePerGas != null) txData.maxFeePerGas = populatedTx.maxFeePerGas;
  if (populatedTx.maxPriorityFeePerGas != null) txData.maxPriorityFeePerGas = populatedTx.maxPriorityFeePerGas;
  if (populatedTx.accessList != null) txData.accessList = populatedTx.accessList;

  const signed = ethers.Transaction.from(txData);
  return await provider.send("eth_sendRawTransaction", [signed.serialized]);
}

/* ================================================================
   EVM ADDRESS DERIVATION FROM dWALLET
   ================================================================ */

/**
 * Derive the Ethereum address controlled by a dWallet.
 * Fetches the dWallet's public_output from the Ika network and computes
 * the ETH address: keccak256(uncompressed_pubkey)[-20:]
 */
export async function deriveEvmAddress(dWalletObjectId: string): Promise<string> {
  const rpcClient = new SuiJsonRpcClient({
    url: process.env.NEXT_PUBLIC_SHINAMI_RPC_URL!,
    network: "testnet",
  });

  const ikaClient = new IkaClient({
    suiClient: rpcClient as any,
    config: getNetworkConfig("testnet"),
  });
  await ikaClient.initialize();

  const dWallet = await ikaClient.getDWalletInParticularState(
    dWalletObjectId,
    "Active",
    { timeout: 30000, interval: 3000 },
  );

  const publicOutput = (dWallet as any).state?.Active?.public_output;
  if (!publicOutput) throw new Error("dWallet missing public_output");

  const dWalletPublicOutput =
    publicOutput instanceof Uint8Array
      ? publicOutput
      : new Uint8Array(publicOutput);

  const publicKey = await publicKeyFromDWalletOutput(
    Curve.SECP256K1,
    dWalletPublicOutput,
  );

  let uncompressedPubKey: Uint8Array;
  if (publicKey.length === 33) {
    const decompressed = ethers.SigningKey.computePublicKey(publicKey, false);
    uncompressedPubKey = ethers.getBytes(decompressed).slice(1);
  } else if (publicKey.length === 65) {
    uncompressedPubKey = publicKey.slice(1);
  } else if (publicKey.length === 64) {
    uncompressedPubKey = publicKey;
  } else {
    throw new Error(`Unexpected public key length: ${publicKey.length}`);
  }

  const addressBytes = ethers
    .getBytes(ethers.keccak256(ethers.hexlify(uncompressedPubKey)))
    .slice(-20);
  return ethers.getAddress(ethers.hexlify(addressBytes));
}

/* ================================================================
   BALANCE QUERIES
   ================================================================ */

/**
 * Fetch HYPE (native) and USDC balances for an address on Hyperliquid EVM.
 */
export async function getEvmBalances(
  rpcUrl: string,
  address: string,
): Promise<{ hype: string; usdc: string }> {
  const provider = createHyperEvmProvider(rpcUrl);
  const usdcContract = new ethers.Contract(USDC, usdcAbi, provider);

  const [hypeBal, usdcBal] = await Promise.all([
    provider.getBalance(address),
    usdcContract.balanceOf(address),
  ]);

  return {
    hype: ethers.formatEther(hypeBal),
    usdc: ethers.formatUnits(usdcBal, 6),
  };
}

/**
 * Fetch the Hypercore (perps) account balance from the Hyperliquid info API.
 * Returns the available trading balance (withdrawable + margin).
 */
export async function getHypercoreBalance(
  address: string,
  isTestnet = true,
): Promise<{ accountValue: string; withdrawable: string; marginUsed: string }> {
  const baseUrl = isTestnet
    ? "https://api.hyperliquid-testnet.xyz"
    : "https://api.hyperliquid.xyz";

  const res = await fetch(`${baseUrl}/info`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "clearinghouseState",
      user: address,
    }),
  });

  if (!res.ok) {
    throw new Error(`Hyperliquid info API error: ${res.status}`);
  }

  const data = await res.json();
  console.log("[PerpBalance] Raw API response for", address, ":", JSON.stringify(data, null, 2));

  // The API may return marginSummary or crossMarginSummary depending on account type
  const marginSummary = data?.crossMarginSummary ?? data?.marginSummary;

  const accountValue = marginSummary?.accountValue ?? "0";
  const totalMarginUsed = marginSummary?.totalMarginUsed ?? "0";
  const withdrawable = (parseFloat(accountValue) - parseFloat(totalMarginUsed)).toFixed(2);

  console.log("[PerpBalance] Parsed → accountValue:", accountValue, "marginUsed:", totalMarginUsed, "withdrawable:", withdrawable);

  return {
    accountValue,
    withdrawable,
    marginUsed: totalMarginUsed,
  };
}

/**
 * Fetch the spot account balance from the Hyperliquid info API.
 */
export async function getSpotBalance(
  address: string,
  isTestnet = true,
): Promise<{ totalUsdValue: string; balances: { coin: string; hold: string; total: string }[] }> {
  const baseUrl = isTestnet
    ? "https://api.hyperliquid-testnet.xyz"
    : "https://api.hyperliquid.xyz";

  const res = await fetch(`${baseUrl}/info`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "spotClearinghouseState",
      user: address,
    }),
  });

  if (!res.ok) {
    throw new Error(`Hyperliquid spot API error: ${res.status}`);
  }

  const data = await res.json();
  console.log("[SpotBalance] Raw API response for", address, ":", JSON.stringify(data, null, 2));

  const balances = (data?.balances ?? []).map((b: any) => ({
    coin: b.coin ?? "",
    hold: b.hold ?? "0",
    total: b.total ?? "0",
  }));

  // Sum up total USD value (USDC balance is 1:1)
  let totalUsdValue = 0;
  for (const b of balances) {
    if (b.coin === "USDC") {
      totalUsdValue += parseFloat(b.total);
    }
  }

  return {
    totalUsdValue: totalUsdValue.toFixed(2),
    balances,
  };
}
