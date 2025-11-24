import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { StopProps } from "../types/stop";
import { loadStopById } from "../data/stops";

export default function Stop() {
	const { id } = useParams<{ id: string }>();
	const [stop, setStop] = useState<StopProps | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!id) return;

		let cancelled = false;

		(async () => {
			setLoading(true);
			const result = await loadStopById(id);
			if (!cancelled) {
				setStop(result);
				setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [id]);

	if (loading) {
		return (
			<div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
				<p className="text-sm text-slate-300">Loading stop…</p>
			</div>
		);
	}

	if (!stop) {
		return (
			<div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
				<div className="text-center">
					<p className="text-lg font-semibold mb-2">
						Stop not found
					</p>
					<Link
						to="/map"
						className="text-sm underline text-sky-400"
					>
						← Back to map
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6">
			<div className="max-w-3xl mx-auto">
				<header className="mb-6 flex items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-semibold">
							{stop.stop_name}
						</h1>
						{stop.parent_station && (
							<p className="text-sm text-slate-400">
								Parent station: {stop.parent_station}
							</p>
						)}
						<p className="text-xs text-slate-500 mt-1">
							Stop ID: {stop.stop_id}
						</p>
					</div>

					<Link
						to="/map"
						className="text-xs px-3 py-1.5 rounded-full border border-slate-700 hover:bg-slate-800"
					>
						Back to map
					</Link>
				</header>

				<section className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
					<h2 className="text-sm font-semibold mb-3">
						Routes serving this stop
					</h2>

					{stop.routes && stop.routes.length > 0 ? (
						<ul className="flex flex-wrap gap-2">
							{stop.routes.map((route) => (
								<li
									key={route.route_short_name}
									className="px-3 py-1 rounded-full text-xs bg-slate-800 border border-slate-700"
								>
									<span className="font-semibold mr-1">
										{route.route_short_name}
									</span>
									<span className="text-slate-300">
										{route.route_long_name}
									</span>
								</li>
							))}
						</ul>
					) : (
						<p className="text-xs text-slate-400">
							No route data available for this stop.
						</p>
					)}
				</section>
			</div>
		</div>
	);
}
