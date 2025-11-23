import { useEffect, useRef } from "react";
import * as maptilersdk from "@maptiler/sdk";

const MAP_ID = "019ab24d-c7c5-7f0a-a22d-0a5b92404e5c"; // https://cloud.maptiler.com/maps/
const API_KEY = import.meta.env.VITE_MAPTILER_KEY;
const MAP_STYLE = `https://api.maptiler.com/maps/${MAP_ID}/style.json?key=${API_KEY}`;

export default function MtaeMap() {
	const mapContainer = useRef<HTMLDivElement | null>(null);
	const mapInstance = useRef<maptilersdk.Map | null>(null);

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
		Stops: 
		**/
		map.on("load", async () => {
			const routeData = await fetch("/data/mta-routes.geojson").then(res => res.json());

			const allRoutes = Array.from(
				new Set(
					routeData.features
						.map((f: any) => (f.properties?.route_short_name || f.properties?.route_id) + " " + (f.properties?.route_color || "??"))
						.filter(Boolean)
				)
			).sort();

			console.log("Subway routes:", allRoutes);

			map.addSource("subway-lines", {
				type: "geojson",
				data: routeData,
			});

			map.addLayer({
				id: "subway-colored-lines",
				type: "line",
				source: "subway-lines",
				paint: {
					"line-width": 3,
					"line-color": [
						"case",
						["has", "route_color"],
						["get", "route_color"], "#000000" // fallback is black
					]
				}
			});

			const stopData = await fetch("/data/mta-stops.geojson").then(res => res.json());
			console.log("Line example:", routeData.features[0].properties);
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
					"circle-radius": 3,
					"circle-color": "#ffffff",
					"circle-stroke-width": 1.5,
					"circle-stroke-color": "#000000"
				}
			});

		});

		mapInstance.current = map;

		return () => {
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