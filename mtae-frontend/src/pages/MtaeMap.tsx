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
		"type":"FeatureCollection",
		"features":[
			{
				"type":"Feature",
				"properties":{
					"agency_name":"MTA New York City Transit",
					"route_id":"A",
					"agency_id":"MTA NYCT",
					"route_short_name":"A",
					"route_long_name":"8 Avenue Express",
					"route_desc":"Trains operate between Inwood-207 St, Manhattan and Far Rockaway-Mott Av, Queens at all times. Also, from about 6 AM until about midnight, additional trains operate between Inwood-207 St and Ozone Park-Lefferts Blvd (trains typically alternate between Ozone Park and Far Rockaway). During weekday morning rush hours, special trains operate from Rockaway Park-Beach 116 St, Queens, toward Manhattan. These trains make local stops in Queens between Rockaway Park and Broad Channel. Similarly, in the evening, rush hour special trains leave Manhattan operating toward Rockaway Park-Beach 116 St.",
					"route_type":1,
					"route_url":"https://www.mta.info/schedules/subway/a-train",
					"route_color":"#0062CF",
					"route_text_color":"#FFFFFF",
					"route_sort_order":1
				},
				"geometry":{
					"type":"MultiLineString",
					"coordinates":[
					[
						[
							-73.828374,
							40.685666
						],
				...
		**/
		map.on("load", async () => {
			const subwayData = await fetch("/data/mta-subway.geojson").then(res => res.json());

			const allRoutes = Array.from(
				new Set(
					subwayData.features
						.map((f: any) => (f.properties?.route_short_name || f.properties?.route_id) + " " + (f.properties?.route_color || "??"))
						.filter(Boolean)
				)
			).sort();

			console.log("Subway routes:", allRoutes);

			map.addSource("subway-lines", {
				type: "geojson",
				data: subwayData,
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