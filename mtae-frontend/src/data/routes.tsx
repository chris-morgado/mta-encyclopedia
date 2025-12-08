export type RouteFeature = GeoJSON.Feature<GeoJSON.MultiLineString | GeoJSON.LineString, any>;
export type RouteGeoJson = GeoJSON.FeatureCollection<GeoJSON.MultiLineString | GeoJSON.LineString, any>;

const ROUTES_URL = "/data/mta-routes.geojson";

export async function fetchRoutesGeoJson(): Promise<RouteGeoJson> {
    const res = await fetch(ROUTES_URL);
    if (!res.ok) throw new Error("Failed to load routes GeoJSON");
    const raw = await res.json();
    const preprocessedData = preprocessRoutes(raw);
    return preprocessedData;
}

function preprocessRoutes(raw: RouteGeoJson): RouteGeoJson {    
    // ISSUE: Many routes overlap exactly (e.g. E, F, M, R along Queens Blvd)
    // This makes it hard to see them individually on the map. They need to be offset slightly.
    // This preprocessing assigns offsets based on route names (it's not perfect, since stretches like the J and Z don't need to be offsetted, but this shit is hard).
    
    const processedFeatures: RouteFeature[] = [];
    
    const routeNames = raw.features.map(f => f.properties?.route_short_name).filter(Boolean);
    const uniqueRoutes = Array.from(new Set(routeNames)).sort();
    
    for (const feature of raw.features) {
        if (!feature.geometry) continue;
        
        const routeName = feature.properties?.route_short_name;
        const routeIndex = uniqueRoutes.indexOf(routeName);
        
        const offset = (routeIndex % 10) - 4.5; // Spreads routes between -4.5 and 4.5
        
        processedFeatures.push({
            ...feature,
            properties: {
                ...feature.properties,
                offset_index: offset * 0.3 // scale down offset.
            }
        });
    }
    
    return {
        type: "FeatureCollection",
        features: processedFeatures,
    };
}