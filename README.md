**Important links: 

Demo video: https://youtu.be/J9d1FgAEI2A

Demo site: carpf.vercel.app

Ika testnet faucet: https://faucet.ika.xyz/

Sui testnet faucet: https://faucet.sui.io/

(you are recommended to open the positions on hyperliquid mainnet!!)
```
# CARP

A unified decentralized trading terminal for perpetual futures across multiple markets. Trade from a single interface using dWallets (MPC-based distributed wallets) on the Sui blockchain with Hyperliquid as the execution layer.

## Project Structure

```
nexus/
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── page.tsx                      # Landing page
│   │   ├── layout.tsx                    # Root layout with dAppKit provider
│   │   ├── trade/page.tsx                # Trading terminal
│   │   ├── portfolio/page.tsx            # Portfolio & wallet management
│   │   ├── dapp-kit.ts                   # Sui dAppKit configuration
│   │   ├── DAppKitClientProvider.tsx      # Sui wallet provider wrapper
│   │   └── globals.css                   # Global styles
│   ├── components/
│   │   ├── TradePageContent.tsx           # Trading UI (orders, positions, history)
│   │   ├── OnChainPortfolio.tsx           # dWallet management & registry
│   │   ├── ConnectWalletButton.tsx        # Sui wallet connection
│   │   ├── CreateDWalletModal.tsx         # dWallet creation flow
│   │   ├── DWalletStateModal.tsx          # dWallet activation UI
│   │   ├── tradingview-widget.tsx         # TradingView charts
│   │   ├── Toast.tsx                      # Toast notifications
│   │   ├── Hero.tsx                       # Landing hero section
│   │   ├── Navbar.tsx                     # Navigation bar
│   │   └── CTA.tsx                        # Call-to-action section
│   └── lib/
│       ├── dwallet.ts                     # dWallet lifecycle (create, activate, presign, sign)
│       ├── hyperliquid.ts                 # Hyperliquid EVM chain interactions
│       └── types/
│           └── portfolio.ts               # TypeScript interfaces
├── nexus_contracts/                       # Sui Move smart contracts
│   ├── sources/
│   │   └── nexus_wallet_management.move   # WalletRegistry & dWallet tracking
│   ├── Move.toml                          # Move package config
│   └── build/                             # Compiled contracts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
└── postcss.config.mjs
```

## Tech Stack

| Category | Technologies |
|----------|-------------|
| Framework | Next.js 14.2, React 18, TypeScript 5 |
| Styling | Tailwind CSS 3.4, Framer Motion |
| Blockchain | Sui (via @mysten/sui), Ika dWallet SDK, ethers.js |
| Wallet | @mysten/dapp-kit-react (Sui wallet integration) |
| Charts | TradingView Lightweight Charts, Recharts |
| UI | Lucide React icons, react-resizable-panels |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with feature showcase and CTA |
| `/trade` | Trading terminal with order entry, order book, positions, and live prices |
| `/portfolio` | Portfolio dashboard with net worth, asset allocation, dWallet management |

## Core Modules

### `src/lib/dwallet.ts` — dWallet Lifecycle

Handles the full MPC wallet lifecycle on the Ika network:

1. **Create** — Derive encryption keys from password + salt, run Distributed Key Generation (DKG), register on Sui
2. **Activate** — Accept encrypted secret key shares, transition to "Active" state
3. **Presign** — Pre-compute MPC signature shares for faster order signing
4. **Sign** — Approve message hashes via dWallet, poll for 65-byte signature (r||s||v)

### `src/lib/hyperliquid.ts` — Trading Integration

Interacts with HyperEVM (chain ID 999) for perpetual futures trading:

- USDC deposits (EVM to HyperCore bridge)
- Order placement via CoreWriter contract
- Balance queries across EVM, HyperCore perps, and spot
- Supported markets: BTC-PERP, ETH-PERP, SOL-PERP, ARB-PERP

### `nexus_contracts/` — On-Chain Registry

Sui Move module (`nexus_wallet_management`) that maintains a shared `WalletRegistry` object tracking all user dWallets, session IDs, public outputs, and presign capabilities.

## Environment Variables

```
NEXT_PUBLIC_SHINAMI_RPC_URL          # Sui RPC endpoint (Shinami)
NEXT_PUBLIC_HYPERLIQUID_RPC_URL      # HyperEVM RPC endpoint
NEXT_PUBLIC_NEXUS_SALT               # Password derivation salt
NEXT_PUBLIC_NEXUS_CONTRACT_ADDRESS   # Sui contract package ID
NEXT_PUBLIC_NEXUS_REGISTRY_ADDRESS   # WalletRegistry object ID
NEXT_PUBLIC_TESTNET_IKA_COIN_TYPE    # IKA token type
```

## Getting Started

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Fill in the required environment variables

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser with a Sui wallet extension installed.

## Build

```bash
npm run build
npm start
```
