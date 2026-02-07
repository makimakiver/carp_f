import {
  getNetworkConfig,
  IkaClient,
  IkaTransaction,
  UserShareEncryptionKeys,
  createRandomSessionIdentifier,
  Curve,
  prepareDKGAsync,
} from "@ika.xyz/sdk";
import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { Transaction } from "@mysten/sui/transactions";
import type { TransactionObjectArgument } from "@mysten/sui/transactions";

/**
 * Constant salt vector mixed with the user's password to derive the rootSeedKey.
 * This provides domain separation so the same password produces different keys
 * across different applications.
 */
const NEXUS_SALT = new Uint8Array([
  78, 69, 88, 85, 83, 95, 68, 87, 65, 76, 76, 69, 84, 95, 83, 65,
  76, 84, 95, 86, 49, 95, 50, 48, 50, 54, 95, 48, 50, 95, 48, 55,
]); // "NEXUS_DWALLET_SALT_V1_2026_02_07"

const TESTNET_IKA_COIN_TYPE =
  "0x1f26bb2f711ff82dcda4d02c77d5123089cb7f8418751474b9fb744ce031526a::ika::IKA";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with backoff on rate-limit errors (429 / -32010).
 * Non-rate-limit errors are thrown immediately.
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  initialDelay: number = 1000,
): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isRateLimit =
        error?.cause?.status === 429 ||
        error?.status === 429 ||
        error?.cause?.code === -32010 ||
        error?.message?.includes("Too many requests");
      if (isRateLimit) {
        const delayMs = initialDelay * Math.pow(2, attempt);
        console.log(
          `Rate limit hit. Retrying in ${delayMs}ms... (attempt ${attempt + 1}/${maxRetries})`,
        );
        await delay(delayMs);
      } else {
        throw error;
      }
    }
  }
  throw lastError!;
}

/**
 * Derive a 32-byte seed from the user password combined with the constant salt.
 * Uses SHA-256 via the Web Crypto API (available in all modern browsers).
 */
async function deriveSeedFromPassword(password: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);

  // Concatenate salt + password
  const combined = new Uint8Array(NEXUS_SALT.length + passwordBytes.length);
  combined.set(NEXUS_SALT, 0);
  combined.set(passwordBytes, NEXUS_SALT.length);

  const hashBuffer = await crypto.subtle.digest("SHA-256", combined);
  return new Uint8Array(hashBuffer);
}

/**
 * Map the user's chain selection to an IKA SDK Curve.
 * EVM chains use secp256k1 (same as Ethereum).
 * Solana uses ed25519.
 */
function chainToCurve(
  chain: "evm" | "solana",
): typeof Curve.SECP256K1 | typeof Curve.ED25519 {
  return chain === "evm" ? Curve.SECP256K1 : Curve.ED25519;
}

export interface CreateDWalletParams {
  password: string;
  chain: "evm" | "solana";
  /** The Sui client from useCurrentClient() — kept for potential future use */
  suiClient: any;
  /** Connected wallet address */
  senderAddress: string;
  /** dAppKit.signAndExecuteTransaction */
  signAndExecuteTransaction: (args: {
    transaction: Transaction;
  }) => Promise<unknown>;
  /** Optional callback to report progress status */
  onStatus?: (message: string) => void;
}

export interface CreateDWalletResult {
  transactionDigest: string;
  sessionId: Uint8Array;
}

/**
 * Creates a dWallet through the Ika network's Distributed Key Generation (DKG) process.
 *
 * Flow:
 * 1. Derive rootSeedKey from password + constant salt
 * 2. Create UserShareEncryptionKeys from the seed
 * 3. Initialize IkaClient (using Shinami RPC for reliability)
 * 4. Build a Sui Transaction with IkaTransaction
 * 5. Fetch user's IKA & SUI coins for fees
 * 6. Register encryption key, prepare DKG, request DKG
 * 7. Transfer dWallet cap to sender
 * 8. Sign & execute via connected wallet
 */
export interface DWalletState {
  objectId: string;
  state: string;
}

/**
 * Fetches the current state of a dWallet from the Ika network.
 */
export async function getDWalletState(
  dWalletObjectId: string,
): Promise<DWalletState> {
  const rpcClient = new SuiJsonRpcClient({
    url: process.env.NEXT_PUBLIC_SHINAMI_RPC_URL!,
    network: "testnet",
  });

  const ikaClient = new IkaClient({
    suiClient: rpcClient as any,
    config: getNetworkConfig("testnet"),
  });
  await retryWithBackoff(() => ikaClient.initialize());

  const dWallet = await retryWithBackoff(() =>
    ikaClient.getDWallet(dWalletObjectId),
  );

  const state = (dWallet as any)?.state?.$kind || "unknown";

  return {
    objectId: dWalletObjectId,
    state,
  };
}

export async function createDWallet({
  password,
  chain,
  suiClient: _suiClient,
  senderAddress,
  signAndExecuteTransaction,
  onStatus,
}: CreateDWalletParams): Promise<CreateDWalletResult> {
  const status = onStatus ?? (() => {});

  // Use Shinami RPC for IKA SDK compatibility (requires SuiJsonRpcClient)
  const rpcClient = new SuiJsonRpcClient({
    url: process.env.NEXT_PUBLIC_SHINAMI_RPC_URL!,
    network: "testnet",
  });

  const curve = chainToCurve(chain);

  // 1. Derive seed from password + salt
  status("Deriving encryption keys from password...");
  const rootSeedKey = await deriveSeedFromPassword(password);

  // 2. Create encryption keys
  const userShareKeys = await UserShareEncryptionKeys.fromRootSeedKey(
    rootSeedKey,
    curve,
  );

  // 3. Initialize IKA client
  status("Connecting to Ika network...");
  const ikaClient = new IkaClient({
    suiClient: rpcClient as any,
    config: getNetworkConfig("testnet"),
  });
  await retryWithBackoff(() => ikaClient.initialize());

  // 4. Build transaction
  status("Building transaction...");
  const tx = new Transaction();
  const ikaTx = new IkaTransaction({
    ikaClient,
    transaction: tx as any,
    userShareEncryptionKeys: userShareKeys,
  });

  // 5. Fetch coins
  status("Checking wallet balances...");
  const rawUserCoins = await retryWithBackoff(() =>
    rpcClient.getAllCoins({ owner: senderAddress }),
  );
  const rawUserIkaCoins = rawUserCoins.data.filter(
    (coin: any) => coin.coinType === TESTNET_IKA_COIN_TYPE,
  );
  const rawUserSuiCoins = rawUserCoins.data.filter(
    (coin: any) => coin.coinType === "0x2::sui::SUI",
  );

  if (!rawUserIkaCoins[0]) {
    throw new Error(
      "No IKA coins found. You need IKA tokens to create a dWallet.",
    );
  }
  if (!rawUserSuiCoins[1]) {
    throw new Error(
      "Insufficient SUI coins. You need at least 2 SUI coin objects for gas.",
    );
  }

  const userIkaCoin = tx.object(rawUserIkaCoins[0].coinObjectId);
  const userSuiCoin = tx.object(rawUserSuiCoins[1].coinObjectId);

  // 6. Session + encryption key registration + DKG prep
  status("Registering encryption key on-chain...");
  const sessionId = createRandomSessionIdentifier();

  await ikaTx.registerEncryptionKey({ curve });

  status("Fetching network encryption key...");
  const dWalletEncryptionKey = await retryWithBackoff(() =>
    ikaClient.getLatestNetworkEncryptionKey(),
  );

  status("Preparing distributed key generation (DKG)...");
  const dkgRequestInput = await retryWithBackoff(() =>
    prepareDKGAsync(ikaClient, curve, userShareKeys, sessionId, senderAddress),
  );

  // Extract userPublicOutput for on-chain storage
  const userPublicOutput = Array.from(
    new Uint8Array((dkgRequestInput as any).userPublicOutput),
  );

  // 7. Request DKG
  status("Requesting dWallet key generation...");
  const [dwalletCap] = await ikaTx.requestDWalletDKG({
    dkgRequestInput,
    sessionIdentifier: ikaTx.registerSessionIdentifier(sessionId),
    dwalletNetworkEncryptionKeyId: dWalletEncryptionKey.id,
    curve,
    ikaCoin: userIkaCoin,
    suiCoin: userSuiCoin,
  });

  // Register dWallet in on-chain registry with session_id and user_public_output
  const sessionIdU64Array = Array.from(sessionId).map((b) => BigInt(b));
  tx.moveCall({
    target: `${process.env.NEXT_PUBLIC_NEXUS_CONTRACT_ADDRESS}::nexus_wallet_management::register_dwallet`,
    arguments: [
      tx.object(process.env.NEXT_PUBLIC_NEXUS_REGISTRY_ADDRESS!),
      tx.pure.string("EVM"),
      tx.pure.string("EVM"),
      dwalletCap,
      tx.pure.vector("u64", sessionIdU64Array),
      tx.pure.vector("u8", userPublicOutput),
    ],
  });
  // 8. Transfer cap to sender
  tx.transferObjects(
    [dwalletCap as TransactionObjectArgument],
    senderAddress,
  );
  tx.setSender(senderAddress);

  // 9. Sign and execute via wallet
  status("Waiting for wallet signature...");
  const result = await signAndExecuteTransaction({ transaction: tx });

  // Extract digest — dapp-kit returns TransactionResultWithEffects which has
  // the digest nested inside the Transaction object
  const txResult = result as any;
  const digest =
    txResult?.digest ?? txResult?.Transaction?.digest ?? "unknown";

  status("dWallet created successfully!");

  return {
    transactionDigest: digest,
    sessionId,
  };
}

/* ================================================================
   ACTIVATE dWALLET
   ================================================================ */

export interface ActivateDWalletParams {
  password: string;
  chain: "evm" | "solana";
  dWalletObjectId: string;
  /** The user's DKG public output, read from the on-chain WalletRegistry */
  userPublicOutput: Uint8Array;
  senderAddress: string;
  signAndExecuteTransaction: (args: {
    transaction: Transaction;
  }) => Promise<unknown>;
  onStatus?: (message: string) => void;
}

/**
 * Activates a dWallet that is in AwaitingKeyHolderSignature state.
 *
 * Flow:
 * 1. Derive encryption keys from password
 * 2. Initialize IkaClient
 * 3. Verify dWallet is in AwaitingKeyHolderSignature state
 * 4. Fetch encrypted user secret key shares from the dWallet
 * 5. Accept the encrypted user share via IkaTransaction
 * 6. Sign & execute via connected wallet
 * 7. Wait for dWallet to become Active
 */
export async function activateDWallet({
  password,
  chain,
  dWalletObjectId,
  userPublicOutput,
  senderAddress,
  signAndExecuteTransaction,
  onStatus,
}: ActivateDWalletParams): Promise<{ transactionDigest: string }> {
  const status = onStatus ?? (() => {});

  const rpcClient = new SuiJsonRpcClient({
    url: process.env.NEXT_PUBLIC_SHINAMI_RPC_URL!,
    network: "testnet",
  });

  const curve = chainToCurve(chain);

  // 1. Derive keys from password
  status("Deriving encryption keys...");
  const rootSeedKey = await deriveSeedFromPassword(password);
  const userShareKeys = await UserShareEncryptionKeys.fromRootSeedKey(
    rootSeedKey,
    curve,
  );

  // 2. Initialize IKA client
  status("Connecting to Ika network...");
  const ikaClient = new IkaClient({
    suiClient: rpcClient as any,
    config: getNetworkConfig("testnet"),
  });
  await retryWithBackoff(() => ikaClient.initialize());

  // 3. Fetch dWallet and check state
  status("Checking dWallet state...");
  const dWalletCurrent = await retryWithBackoff(() =>
    ikaClient.getDWallet(dWalletObjectId),
  );
  const currentState = (dWalletCurrent as any)?.state?.$kind || "unknown";

  if (currentState === "Active") {
    status("dWallet is already active!");
    return { transactionDigest: "already-active" };
  }

  if (currentState !== "AwaitingKeyHolderSignature") {
    status(
      `Waiting for AwaitingKeyHolderSignature state (current: ${currentState})...`,
    );
    await ikaClient.getDWalletInParticularState(
      dWalletObjectId,
      "AwaitingKeyHolderSignature",
      { timeout: 300000, interval: 5000 },
    );
  }

  // 4. Re-fetch dWallet in correct state
  const dWallet = await retryWithBackoff(() =>
    ikaClient.getDWallet(dWalletObjectId),
  );

  // 5. Build activation transaction
  status("Building activation transaction...");
  const tx = new Transaction();
  const ikaTx = new IkaTransaction({
    ikaClient,
    transaction: tx as any,
    userShareEncryptionKeys: userShareKeys,
  });

  // 6. Fetch encrypted user secret key shares
  const encryptedUserSecretKeySharesId = (dWallet as any)
    .encrypted_user_secret_key_shares?.id?.id;
  if (!encryptedUserSecretKeySharesId) {
    throw new Error(
      "encrypted_user_secret_key_shares table not found on dWallet",
    );
  }

  const dynamicFields = await rpcClient.getDynamicFields({
    parentId: encryptedUserSecretKeySharesId,
  });
  if (!dynamicFields.data || dynamicFields.data.length === 0) {
    throw new Error(
      "No encrypted user secret key shares found. The network may not have completed DKG yet.",
    );
  }
  const encryptedUserSecretKeyShareId = dynamicFields.data[0]?.objectId;
  if (!encryptedUserSecretKeyShareId) {
    throw new Error("encryptedUserSecretKeyShareId not found");
  }

  // 7. Accept encrypted user share
  status("Accepting encrypted user share...");
  await ikaTx.acceptEncryptedUserShare({
    dWallet: dWallet as any,
    encryptedUserSecretKeyShareId,
    userPublicOutput,
  });

  tx.setSender(senderAddress);

  // 8. Sign and execute via wallet
  status("Waiting for wallet signature...");
  const result = await signAndExecuteTransaction({ transaction: tx });

  const txResult = result as any;
  const digest =
    txResult?.digest ?? txResult?.Transaction?.digest ?? "unknown";

  // 9. Wait for Active state
  status("Waiting for dWallet to become active...");
  try {
    await ikaClient.getDWalletInParticularState(dWalletObjectId, "Active", {
      timeout: 120000,
      interval: 3000,
    });
    status("dWallet activated successfully!");
  } catch {
    status("Activation submitted. dWallet may still be processing.");
  }

  return { transactionDigest: digest };
}
