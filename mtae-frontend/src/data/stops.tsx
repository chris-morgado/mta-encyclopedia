import type { StopProps } from "../types/stop";

export type StopFeature = GeoJSON.Feature<GeoJSON.Point, any>;
export type StopGeoJson = GeoJSON.FeatureCollection<GeoJSON.Point, any>;

const STOPS_URL = "/data/mta-stops.geojson";

export async function fetchStopsGeoJson(): Promise<StopGeoJson> {
	const res = await fetch(STOPS_URL);
	if (!res.ok) throw new Error("Failed to load stops GeoJSON");
	const raw = await res.json();
	return preprocessStops(raw);
}

function preprocessStops(raw: StopGeoJson): StopGeoJson {
	const stationMap = new Map<string, StopFeature[]>();
	
	for (const feature of raw.features) {
		const parentStation = feature.properties?.parent_station || feature.properties?.stop_id;
		
		if (!stationMap.has(parentStation)) {
			stationMap.set(parentStation, []);
		}
		stationMap.get(parentStation)!.push(feature);
	}
	
	const groupedFeatures: StopFeature[] = [];
	
	for (const [parentStation, platforms] of stationMap.entries()) {
		const mainPlatform = platforms[0];
		
		const routeMap = new Map<string, any>();
		const platformIds: string[] = [];
		
		for (const platform of platforms) {
			platformIds.push(platform.properties.stop_id);
			const routes: StopProps["routes"] = platform.properties.routes;
			if (routes && Array.isArray(routes)) {
				for (const route of routes) {
					routeMap.set(route.route_short_name, route);
				}
			}
		}
		
		groupedFeatures.push({
			type: "Feature",
			geometry: mainPlatform.geometry,
			properties: {
				stop_id: parentStation,
				stop_name: mainPlatform.properties.stop_name,
				routes: routeMap.size > 0 ? Array.from(routeMap.values()) : undefined,
				platform_ids: JSON.stringify(platformIds),
			}
		});
	}
	
	return {
		type: "FeatureCollection",
		features: groupedFeatures
	};
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
	
	let platformIds: string[] | undefined;
	try {
		platformIds =
			typeof props.platform_ids === "string"
				? JSON.parse(props.platform_ids)
				: props.platform_ids;
	} catch {
		platformIds = undefined;
	}

	return {
		stop_id: props.stop_id,
		stop_name: props.stop_name,
		routes,
		platform_ids: platformIds
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
