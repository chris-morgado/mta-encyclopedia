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
			center: [-74.006, 40.7128], // NYC [lng, lat]
			zoom: 11,
			projection: "globe",        
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

