"use client";

import { useEffect, useRef, memo } from "react";

interface TradingViewWidgetProps {
  symbol?: string;
}

function TradingViewWidgetInner({ symbol = "BINANCE:BTCUSDT" }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
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
    });

    containerRef.current.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol]);

  return (
    <div className="tradingview-widget-container h-full w-full" ref={containerRef}>
      <div className="tradingview-widget-container__widget h-full w-full" />
    </div>
  );
}

export const TradingViewWidget = memo(TradingViewWidgetInner);
