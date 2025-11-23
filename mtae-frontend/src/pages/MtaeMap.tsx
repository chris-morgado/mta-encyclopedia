import { useEffect, useRef } from "react";
import * as maptilersdk from "@maptiler/sdk";

const MAP_ID = "019ab24d-c7c5-7f0a-a22d-0a5b92404e5c"; // https://cloud.maptiler.com/maps/
const API_KEY = import.meta.env.VITE_MAPTILER_KEY;
const MAP_STYLE = `https://api.maptiler.com/maps/${MAP_ID}/style.json?key=${API_KEY}`;

export default function MtaeMap() {
	const mapContainer = useRef<HTMLDivElement | null>(null);
	const mapInstance = useRef<maptilersdk.Map | null>(null);
	const popupRef = useRef<maptilersdk.Popup | null>(null);

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
}
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
					"line-width": [
						"interpolate",
						["linear"],
						["zoom"],
						4, 0,
						6, 1,  
						10, 3,   
						16, 5 
					],
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
					"circle-radius": [
						"interpolate",
						["linear"],
						["zoom"],
						8, 0,  // at zoom 8 (far away), disappear
						10, 3,   
						12, 4,   // at zoom 12, radius 4
						14, 5,  
						16, 7   // at zoom 7, radius 10
					],
					"circle-color": "#ffffff",
					"circle-stroke-width": [
						"interpolate",
						["linear"],
						["zoom"],
						6, 0,  
						10, 1.0,   
						16, 1.5   
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

				const stop_name = props.stop_name;
				const stop_id = props.stop_id;
				const parent_station = props.parent_station;
				const routes = props.routes; 
				const agency_name = props.agency_name;

				if (popupRef.current) {
					// only 1 pop up can be open at a time, this closes the previous 
					popupRef.current.remove();
				}

				const coordinates = (feature.geometry as any).coordinates;

				const html = `
					<div style="font-family: system-ui, sans-serif; font-size: 12px;">
						<h3 style="margin: 0 0 4px; font-size: 14px;">${stop_name}</h3>
						<div><strong>Stop ID:</strong> ${stop_id}</div>
						<div><strong>Parent station:</strong> ${parent_station || "-"}</div>
						<div><strong>Routes:</strong> ${routes || "-"}</div>
						<div><strong>Agency:</strong> ${agency_name}</div>
					</div>
				`;

				const popup = new maptilersdk.Popup({
					closeButton: true,
					closeOnClick: true,
					offset: 8
				})
					.setLngLat(coordinates as [number, number])
					.setHTML(html)
					.addTo(map);

				popupRef.current = popup;
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