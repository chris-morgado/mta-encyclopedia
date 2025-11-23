import { useEffect, useRef } from "react";
import * as maptilersdk from "@maptiler/sdk";
import type { FeatureCollection, Feature } from "geojson";

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
			center: [-73.82, 40.73],	// center more on Queens
			zoom: 10,
			projection: "globe",
		});

		map.on("load", async () => {
			const subwayData = await fetch("/data/mta-subway.geojson").then(res => res.json());

			map.addSource("subway-lines", {
				type: "geojson",
				data: subwayData,
			});

			map.addLayer({
				id: "subway-lines",
				type: "line",
				source: "subway-lines",
				paint: {
					"line-color": "#c90000ff",
					"line-width": 2,
				},
			});

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

		});

		new maptilersdk.Marker()
			.setLngLat([-74.006, 40.7128])
			.addTo(map);

		mapInstance.current = map;

		return () => {
			map.remove();
			mapInstance.current = null;
		};
	}, []);

	return <div ref={mapContainer} className="map-root" />;
}
