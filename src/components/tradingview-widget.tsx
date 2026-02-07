"use client";

import { useEffect, useMemo, memo } from "react";

interface TradingViewWidgetProps {
  symbol?: string;
}

function TradingViewWidgetInner({ symbol = "BINANCE:BTCUSDT" }: TradingViewWidgetProps) {
  // Suppress WebSocket 1006 errors thrown by Brave's requestRelay.js
  // content script. The extension monitors all network activity (including
  // iframes) and throws in the parent page context when connections close
  // abnormally. This is a Brave bug, not an app error.
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (
        event.message?.includes("websocket error 1006") ||
        event.filename?.includes("chrome-extension://")
      ) {
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString?.() ?? "";
      if (reason.includes("websocket error 1006")) {
        event.preventDefault();
        return;
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  const iframeSrc = useMemo(() => {
    const config = {
      autosize: true,
      symbol,
      interval: "60",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "rgba(11, 14, 17, 1)",
      gridColor: "rgba(30, 35, 40, 0.6)",
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
      toolbar_bg: "#0b0e11",
      enable_publishing: false,
      withdateranges: true,
      details: false,
      hotlist: false,
      show_popup_button: false,
      studies: ["STD;RSI"],
      overrides: {
        "paneProperties.background": "#0b0e11",
        "paneProperties.backgroundType": "solid",
        "mainSeriesProperties.candleStyle.upColor": "#00c076",
        "mainSeriesProperties.candleStyle.downColor": "#ff5353",
        "mainSeriesProperties.candleStyle.wickUpColor": "#00c076",
        "mainSeriesProperties.candleStyle.wickDownColor": "#ff5353",
        "mainSeriesProperties.candleStyle.borderUpColor": "#00c076",
        "mainSeriesProperties.candleStyle.borderDownColor": "#ff5353",
      },
    };

    return `https://www.tradingview-widget.com/embed-widget/advanced-chart/?locale=en#${encodeURIComponent(JSON.stringify(config))}`;
  }, [symbol]);

  return (
    <div className="tradingview-widget-container h-full w-full">
      <iframe
        src={iframeSrc}
        className="h-full w-full"
        style={{ border: "none" }}
        sandbox="allow-scripts allow-same-origin allow-popups"
        allow="clipboard-read; clipboard-write"
        title="TradingView Chart"
      />
    </div>
  );
}

export const TradingViewWidget = memo(TradingViewWidgetInner);
