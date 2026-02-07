export interface ChainInfo {
  id: string;
  name: string;
  color: string;
}

export interface Asset {
  symbol: string;
  name: string;
  chain: ChainInfo;
  balance: number;
  value: number;
  price: number;
  change24h: number;
  allocation: number;
}

export interface PerformanceDataPoint {
  date: string;
  value: number;
}

export interface Activity {
  id: string;
  type: "swap" | "bridge" | "send" | "receive";
  description: string;
  fromAsset: string;
  toAsset: string;
  fromChain: string;
  toChain: string;
  value: number;
  timestamp: string;
  status: "completed" | "pending" | "failed";
}

export interface WalletInfo {
  address: string;
  chain: "solana" | "evm";
  label: string;
  connected: boolean;
}

export interface PortfolioData {
  netWorth: number;
  change24h: number;
  change24hPercent: number;
  assets: Asset[];
  performance: PerformanceDataPoint[];
  activities: Activity[];
  wallets: WalletInfo[];
}
