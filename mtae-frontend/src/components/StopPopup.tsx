import { useState } from "react";
import type { StopProps } from "../types/stop";

interface StopPopupComponentProps {
  stop: StopProps;
  isAuthenticated: boolean;
  isFavorited: boolean;
  isFull: boolean;
  onToggleFavorite: (stopId: string) => void;
}

export function StopPopup({
  stop,
  isAuthenticated,
  isFavorited,
  isFull,
  onToggleFavorite,
}: StopPopupComponentProps) {
  const [favorited, setFavorited] = useState(Boolean(isFavorited));

  const handleClick = () => {
    window.location.href = `/stop/${stop.stop_id}`;
  };

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // don't trigger card navigation
    if (!favorited && isFull) return; // already at 5, will not add new favorite
    setFavorited((v) => !v);
    onToggleFavorite(stop.stop_id);
  };

  const starDisabled = !favorited && isFull;

  console.log(`Rendering popup for ${stop.stop_name} (favorited: ${favorited}, full: ${isFull})`);
  console.log(`Props - isAuthenticated: ${isAuthenticated}, isFavorited: ${isFavorited}, isFull: ${isFull}`);
  console.log(`State - favorited: ${favorited}, starDisabled: ${starDisabled}`);
  return (
    <div className="relative">
      {/* Popup card */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        className="
          cursor-pointer select-none
          bg-gradient-to-br from-zinc-900/95 via-neutral-900 to-zinc-950
          text-zinc-100 rounded-2xl border border-zinc-700/70
          shadow-xl shadow-black/50 px-3.5 py-2.5
          min-w-[220px] max-w-[260px] text-xs
          relative
          transition-all duration-200 ease-out
          hover:-translate-y-0.5
          hover:shadow-2xl
          hover:border-zinc-500/70
          active:scale-[0.97]
          active:opacity-80
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-zinc-500/70
          focus-visible:ring-offset-2
          focus-visible:ring-offset-zinc-900
          after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2
          after:-bottom-2
          after:border-l-8 after:border-r-8 after:border-t-8
          after:border-l-transparent after:border-r-transparent
          after:border-t-zinc-900/95
        "
      >
        {/* Header (stop name + star) */}
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <h3 className="m-0 text-sm font-semibold text-slate-50 leading-snug">
            {stop.stop_name}
          </h3>

          {/* Star (only shown when logged in, disable when over 5) */}
          {isAuthenticated && (
            <button
              type="button"
              onClick={handleStarClick}
              title={
                starDisabled
                  ? "You already have 5 favorites"
                  : favorited
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
              className={`
                flex-shrink-0 text-base leading-none mt-0.5
                transition-transform duration-100
                ${starDisabled
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:scale-125 active:scale-95 cursor-pointer"
                }
                ${favorited ? "text-yellow-400" : "text-slate-400"}
              `}
            >
              {favorited ? "★" : "☆"}
            </button>
          )}
        </div>

        {/* Stop ID */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400">Stop ID</span>
          <span className="text-[11px] font-medium text-slate-100">
            {stop.stop_id}
          </span>
        </div>

        {/* Routes */}
        {stop.routes && stop.routes.length > 0 && (
          <div className="mt-2">
            <span className="text-[11px] text-slate-400">Routes</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {stop.routes.map((r) => (
                <div
                  key={r.route_short_name}
                  className="
                    inline-flex items-center gap-1 rounded-full
                    px-2 py-0.5 text-[11px] font-semibold
                    shadow-sm shadow-black/30
                    backdrop-blur-[1px]
                  "
                  style={{
                    backgroundColor: r.route_color,
                    color: r.route_text_color || "#FFFFFF",
                  }}
                >
                  <span className="font-bold text-sm leading-none">
                    {r.route_short_name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
