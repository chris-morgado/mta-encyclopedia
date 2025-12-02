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
 * Implementation: there will be a map. The key is a piece of stringified geometry, and the value is an array of features that all have that geometry.
 * 
 * 2: For each group of shared-geometry routes:
 *  a) If all routes have the same color, merge into one 'trunk' line with no offset
 *  b) If multiple colors (2+), create offset lines PER COLOR (not per route)
 */




function preprocessRoutes(raw: RouteGeoJson): RouteGeoJson {
	const routeGeoMap = new Map<string, RouteFeature[]>();
                        //  ^ {stringified geometry : features} 

    // making the map:                        
    for (const feature of raw.features) {
        /* each feature is a route
            feature:
            geometry: coords
            properties: route info (color, title, etc...)
        **/
       	if (!feature.geometry || feature.geometry.type !== "LineString"){
            continue;
        } else {
            const routeGeoMapKey = stringifyGeometry(feature.geometry.coordinates);
    
            if (!routeGeoMap.has(routeGeoMapKey)) {
                routeGeoMap.set(routeGeoMapKey, []);
            }
            routeGeoMap.get(routeGeoMapKey)!.push(feature);
        }

    }

	return {
		...raw,
        features: raw.features,
	};
}

function stringifyGeometry(geomtery: number[][]): string {
    return JSON.stringify(geomtery);
}
