"use client";

import dynamic from "next/dynamic";

const TradePageContent = dynamic(
  () => import("@/components/TradePageContent"),
  { ssr: false },
);

export default function TradePage() {
  return <TradePageContent />;
}
