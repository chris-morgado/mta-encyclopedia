import { useEffect, useRef, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import { createRoot } from "react-dom/client";
import { StopPopup } from "../components/StopPopup";
import type { StopProps } from "../types/stop";
import type { Root } from "react-dom/client";
import { fetchStopsGeoJson } from "../data/stops";
import { fetchRoutesGeoJson } from "../data/routes";

const MAP_ID = "019ab24d-c7c5-7f0a-a22d-0a5b92404e5c"; // https://cloud.maptiler.com/maps/
const API_KEY = import.meta.env.VITE_MAPTILER_KEY;
const MAP_STYLE = `https://api.maptiler.com/maps/${MAP_ID}/style.json?key=${API_KEY}`;

export default function MtaeMap() {
	const mapContainer = useRef<HTMLDivElement | null>(null);
	const mapInstance = useRef<maptilersdk.Map | null>(null);
	const popupRef = useRef<maptilersdk.Popup | null>(null);
	const popupRootRef = useRef<Root | null>(null);
	const popupContainerRef = useRef<HTMLDivElement | null>(null);
	const mapLoaded = useRef(false);

	// UI state for settings
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [showBoroughBorders, setShowBoroughBorders] = useState(false);

	useEffect(() => {
		if (!mapContainer.current || mapInstance.current) return;

		const map = new maptilersdk.Map({
			container: mapContainer.current,
			style: MAP_STYLE,
			center: [-74.006, 40.7128],
			zoom: 10,
			projection: "globe",
		});

		map.on("load", async () => {
			mapLoaded.current = true;

			const routeData = await fetchRoutesGeoJson();
			const stopData = await fetchStopsGeoJson();

			// --- Subway routes ---
			map.addSource("subway-lines", {
				type: "geojson",
				data: routeData,
			});

			map.addLayer({
				id: "subway-colored-lines",
				type: "line",
				source: "subway-lines",
				paint: {
					"line-width": [
						"interpolate",
						["linear"],
						["zoom"],
						4, 0,
						6, 1,
						16, 3,
						20, 7
					],
					"line-color": [
						"case",
						["has", "trunk_color"],
						["get", "trunk_color"],
						["get", "route_color"]
					],
					"line-offset": [
						"interpolate",
						["linear"],
						["zoom"],
						8, 0,
						14, ["*", ["get", "offset_index"], 2],
						18, ["*", ["get", "offset_index"], 4]
					]
				}
			});

			// --- Subway stops ---
			map.addSource("subway-stops", {
				type: "geojson",
				data: stopData
			});

			map.addLayer({
				id: "subway-stops-layer",
				type: "circle",
				source: "subway-stops",
				paint: {
					"circle-radius": [
						"interpolate",
						["linear"],
						["zoom"],
						8, 0,
						10, 2,
						16, 5,
						20, 10
					],
					"circle-color": "#ffffff",
					"circle-stroke-width": [
						"interpolate",
						["linear"],
						["zoom"],
						6, 0,
						10, 1.0,
						16, 1.5,
						20, 2.5
					],
					"circle-stroke-color": "#000000"
				}
			});

			const boroughData: any = await fetch(
				"https://raw.githubusercontent.com/dwillis/nyc-maps/master/boroughs.geojson"
			).then(res => res.json());

			const boroughGeoJson: any = {
				type: "FeatureCollection",
				features: boroughData.features
			};

			map.addSource("boroughs", {
				type: "geojson",
				data: boroughGeoJson,
			});

			map.addLayer({
				id: "bk-outline",
				type: "line",
				source: "boroughs",
				layout: {
					visibility: "none", 
				},
				paint: {
					"line-color": "#ffffffff",
					"line-width": 2,
				},
			});

			map.addLayer({
				id: "bk-outline",
				type: "fill",
				source: "boroughs",
				layout: {
					visibility: "none", 
				},
				paint: {
					"fill-color": "#ff0000ff",
					"fill-opacity": 1.0,
				},
			});

			// --- Stop popup interactions ---
			map.on("mouseenter", "subway-stops-layer", () => {
				map.getCanvas().style.cursor = "pointer";
			});

			map.on("mouseleave", "subway-stops-layer", () => {
				map.getCanvas().style.cursor = "";
			});

			map.on("click", "subway-stops-layer", (e) => {
				const feature = e.features?.[0];
				if (!feature) return;

				const props = feature.properties as any;
				let routes: StopProps["routes"];
				try {
					routes = typeof props.routes === "string"
						? JSON.parse(props.routes)
						: props.routes;
				} catch {
					routes = undefined;
				}

				const stop: StopProps = {
					stop_id: props.stop_id,
					stop_name: props.stop_name,
					routes,
					platform_ids: props.platform_ids
				};
				const coordinates = (feature.geometry as any).coordinates as [number, number];

				if (!popupContainerRef.current) {
					popupContainerRef.current = document.createElement("div");
					popupRootRef.current = createRoot(popupContainerRef.current);
				}

				popupRootRef.current!.render(<StopPopup stop={stop} />);

				if (!popupRef.current) {
					popupRef.current = new maptilersdk.Popup({
						closeOnClick: true,
						offset: 8
					});
				}

				popupRef.current
					.setLngLat(coordinates)
					.setDOMContent(popupContainerRef.current)
					.addTo(map);
			});
		});

		mapInstance.current = map;

		return () => {
			if (popupRef.current) {
				popupRef.current.remove();
				popupRef.current = null;
			}
			if (popupRootRef.current) {
				popupRootRef.current.unmount();
				popupRootRef.current = null;
				popupContainerRef.current = null;
			}
			map.remove();
			mapInstance.current = null;
			mapLoaded.current = false;
		};
	}, []);

	useEffect(() => {
		const map = mapInstance.current;
		if (!map || !mapLoaded.current) return;

		const visibility = showBoroughBorders ? "visible" : "none";
		["bk-outline", "queens-outline"].forEach((id) => {
			if (map.getLayer(id)) {
				map.setLayoutProperty(id, "visibility", visibility);
			}
		});
	}, [showBoroughBorders]);

	return (
		<div className="relative h-full w-full">
			{/* Map container */}
			<div ref={mapContainer} className="map-root h-full w-full" />

			{/* Map settings UI (overlay) */}
			<div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-col gap-2">
				<button
					type="button"
					onClick={() => setSettingsOpen((v) => !v)}
					className="
						pointer-events-auto flex items-center justify-center
						h-10 w-10 rounded-full
						bg-neutral-900/95 text-neutral-50
						shadow-lg shadow-black/40 border border-neutral-700/70
						hover:bg-neutral-800 active:scale-95
						transition-transform transition-colors duration-150
					"
					aria-label="Map settings"
				>
					<span className="text-lg">🗺️</span>
				</button>
				<button
					type="button"
					onClick={() => setSettingsOpen((v) => !v)}
					className="
						pointer-events-auto flex items-center justify-center
						h-10 w-10 rounded-full
						bg-neutral-900/95 text-neutral-50
						shadow-lg shadow-black/40 border border-neutral-700/70
						hover:bg-neutral-800 active:scale-95
						transition-transform transition-colors duration-150
					"
					aria-label="Map settings"
				>
					<span className="text-lg">⚙️</span>
				</button>

				{/* Expanded settings panel */}
				{settingsOpen && (
					<div
						className="
							pointer-events-auto mt-1
							min-w-[220px]
							rounded-2xl bg-neutral-900/95 text-neutral-100
							border border-neutral-700/70
							shadow-xl shadow-black/50
							px-3 py-2.5 text-xs
						"
					>
						<div className="mb-2 flex items-center justify-between">
							<span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
								Map settings
							</span>
							<button
								type="button"
								onClick={() => setSettingsOpen(false)}
								className="text-[11px] text-neutral-400 hover:text-neutral-200"
							>
								Close
							</button>
						</div>

						<div className="space-y-2">
							<label className="flex items-center justify-between gap-3">
								<span className="text-[12px] text-neutral-200">
									Borough borders
								</span>
								<input
									type="checkbox"
									className="h-4 w-4 cursor-pointer accent-neutral-300"
									checked={showBoroughBorders}
									onChange={(e) => setShowBoroughBorders(e.target.checked)}
								/>
							</label>

							{/* place for future toggles */}
							{/* <label className="flex items-center justify-between gap-3">
								<span className="text-[12px] text-neutral-200">
									Something else
								</span>
								<input type="checkbox" className="h-4 w-4 cursor-pointer accent-neutral-300" />
							</label> */}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}