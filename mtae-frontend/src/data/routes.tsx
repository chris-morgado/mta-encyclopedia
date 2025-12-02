export type RouteFeature = GeoJSON.Feature<GeoJSON.LineString, any>;
export type RouteGeoJson = GeoJSON.FeatureCollection<GeoJSON.LineString, any>;

const ROUTES_URL = "/data/mta-routes.geojson";

export async function fetchRoutesGeoJson(): Promise<RouteGeoJson> {
    const res = await fetch(ROUTES_URL);
    if (!res.ok) throw new Error("Failed to load routes GeoJSON");
    const raw = await res.json();
    const preprocessedData = preprocessRoutes(raw);
    return raw;
}

/**
 * Methodology:
 * 
 * 1: Find all lines that share multiple routes (same geometry)
 * 2: For each group of shared-geometry routes:
 *  a) If all routes have the same color, merge into one 'trunk' line with no offset
 *  b) If multiple colors (2+), create offset lines PER COLOR (not per route)
 * 
 *  
 */




function preprocessRoutes(raw: RouteGeoJson): RouteGeoJson {
	const geomMap = new Map<string, RouteFeature[]>();

	return {
		...raw,
        features: raw.features,
	};
}
