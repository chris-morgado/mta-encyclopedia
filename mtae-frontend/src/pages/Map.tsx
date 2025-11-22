import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function Map() {
	return (
		<div className="map-root">            
            <MapContainer
                center={[40.7128, -74.006]} // NYC
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[40.7128, -74.006]}>
                    <Popup>New York City</Popup>
                </Marker>
            </MapContainer>
        </div>
	);
}

