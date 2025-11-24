export type RouteFeature = GeoJSON.Feature<GeoJSON.LineString, any>;
export type RouteGeoJson = GeoJSON.FeatureCollection<GeoJSON.LineString, any>;

const ROUTES_URL = "/data/mta-routes.geojson";

export async function fetchRoutesGeoJson(): Promise<RouteGeoJson> {
    const res = await fetch(ROUTES_URL);
    if (!res.ok) throw new Error("Failed to load routes GeoJSON");
    return res.json();
}