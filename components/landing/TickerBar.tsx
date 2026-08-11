export default function TickerBar() {
  const tickerContent = "HH GOA 2026 · BUILDER ID GENERATOR · GOA, INDIA · #FrameInGoa · "

  return (
    <div className="sticky top-0 z-50 bg-hh-green-mid py-2 overflow-hidden">
      <div className="ticker-wrapper">
        <div className="ticker-content font-mono-label text-hh-cream text-sm uppercase tracking-widest">
          <span>{tickerContent.repeat(10)}</span>
          <span>{tickerContent.repeat(10)}</span>
        </div>
      </div>

      <style jsx>{`
        .ticker-wrapper {
          overflow: hidden;
          width: 100%;
        }

        .ticker-content {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: ticker-scroll 28s linear infinite;
        }

        .ticker-content:hover,
        .ticker-content:active {
          animation-play-state: paused;
        }

        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}