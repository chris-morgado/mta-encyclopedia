import type { StopProps } from "../types/stop";

export function StopPopup({ stop }: { stop: StopProps }) {
	return (
		<div className="relative">
			{/* Popup card */}
			<div className="bg-[#050509] text-slate-100 rounded-xl shadow-xl px-3 py-2 min-w-[220px] max-w-[260px] text-xs
                            relative
                            after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2
                            after:-bottom-2
                            after:border-l-8 after:border-r-8 after:border-t-8 after:border-l-transparent after:border-r-transparent
                            after:border-t-[#050509]">

                {/* Header */}
                <div className="mb-1">
                    <h3 className="m-0 text-sm font-semibold text-slate-50">
                        {stop.stop_name}
                    </h3>
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
                                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                                    style={{
                                        backgroundColor: r.route_color,
                                        color: r.route_text_color || "#FFFFFF",
                                    }}
                                >
                                    <span className="font-bold text-sm">
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
