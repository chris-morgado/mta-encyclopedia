import { useEffect, useRef } from "react";
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

	useEffect(() => {
		if (!mapContainer.current || mapInstance.current) return;

		const map = new maptilersdk.Map({
			container: mapContainer.current,
			style: MAP_STYLE,
			center: [-74.006, 40.7128],
			zoom: 10,
			projection: "globe",
		});

		/* Looks like this when its pulled
		Routes: route_id,agency_id,route_short_name,route_long_name,route_desc,route_type,route_url,route_color,route_text_color,route_sort_order,geometry
		Stops: "stop_id""stop_name""parent_station""routes""agency_name"

		**/
		map.on("load", async () => {
			const routeData = await fetchRoutesGeoJson();
			const stopData = await fetchStopsGeoJson();
			
			// for debugging routes
			console.log("All routes:", routeData.features.map(f => ({
				name: f.properties?.route_short_name,
				type: f.geometry?.type,
				coordCount: f.geometry?.type === 'LineString' 
					? f.geometry.coordinates.length 
					: f.geometry?.coordinates?.reduce((sum, line) => sum + line.length, 0),
				geometries: f.geometry
			})));

			// for debugging stops
			console.log("All stops:", stopData.features.map(f => ({
				name: f.properties.stop_name,
				routes: f.properties.routes,
				type: f.geometry?.type
			})))
			
			console.log("Route example:", routeData);

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

			console.log("Stop example:", stopData.features[0].properties);

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
						8, 0,  // at zoom 8 (far away), disappear
						10, 2, // at zoom 10, radius 2
						16, 5,   // at zoom 7, radius 10
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
					parent_station: props.parent_station,
					routes,
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
		};
	}, []);

	return <div ref={mapContainer} className="map-root" />;
}


/*
Borough code:
			const boroughData: FeatureCollection = await fetch(
				"https://raw.githubusercontent.com/dwillis/nyc-maps/master/boroughs.geojson"
			).then(res => res.json());

			const queensData: FeatureCollection = {
				type: "FeatureCollection",
				features: boroughData.features.filter(
					(f: Feature) => (f.properties as any)?.BoroName === "Queens"
				),
			};

			const bkData: FeatureCollection = {
				type: "FeatureCollection",
				features: boroughData.features.filter(
					(f: Feature) => (f.properties as any)?.BoroName === "Brooklyn"
				),
			};

			map.addSource("queens", {
				type: "geojson",
				data: queensData,
			});

			map.addSource("brooklyn", {
				type: "geojson",
				data: bkData,
			});

			// map.addLayer({
			// 	id: "queens-fill",
			// 	type: "fill",
			// 	source: "queens",
			// 	paint: {
			// 		"fill-color": "#ff00aa",
			// 		"fill-opacity": 0.4,
			// 	},
			// });

			map.addLayer({
				id: "bk-outline",
				type: "line",
				source: "brooklyn",
				paint: {
					"line-color": "#2600ffff",
					"line-width": 2,
				},
			});
			map.addLayer({
				id: "queens-outline",
				type: "line",
				source: "queens",
				paint: {
					"line-color": "#ff00aa",
					"line-width": 2,
				},
			});
**/