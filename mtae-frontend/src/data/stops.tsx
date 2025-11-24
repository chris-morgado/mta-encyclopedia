import type { StopProps } from "../types/stop";

export type StopFeature = GeoJSON.Feature<GeoJSON.Point, any>;
export type StopGeoJson = GeoJSON.FeatureCollection<GeoJSON.Point, any>;

const STOPS_URL = "/data/mta-stops.geojson";

export async function fetchStopsGeoJson(): Promise<StopGeoJson> {
	const res = await fetch(STOPS_URL);
	if (!res.ok) throw new Error("Failed to load stops GeoJSON");
	return res.json();
}

export function parseStopFeature(feature: StopFeature): StopProps {
	const props = feature.properties;

	let routes: StopProps["routes"];
	try {
		routes =
			typeof props.routes === "string"
				? JSON.parse(props.routes)
				: props.routes;
	} catch {
		routes = undefined;
	}

	return {
		stop_id: props.stop_id,
		stop_name: props.stop_name,
		parent_station: props.parent_station,
		routes,
	};
}

export async function loadAllStops(): Promise<StopProps[]> {
	const geo: StopGeoJson = await fetch("/data/mta-stops.geojson").then((res) =>
		res.json()
	);

	return geo.features.map(parseStopFeature);
}

export async function loadStopById(id: string): Promise<StopProps | null> {
	const geo: StopGeoJson = await fetch("/data/mta-stops.geojson").then((res) =>
		res.json()
	);

	const feature = geo.features.find(
		(f) => f.properties?.stop_id === id
	);

	return feature ? parseStopFeature(feature) : null;
}
