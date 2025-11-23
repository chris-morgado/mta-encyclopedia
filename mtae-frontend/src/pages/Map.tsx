import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function Map() {
	const maptilerApiKey = import.meta.env.VITE_MAPTILER_KEY;

    return (
        
		<div className="map-root">            
            <MapContainer
                center={[40.7128, -74.006]} // NYC
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
            >
                {/* OpenStreetMap */}
                {/* <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                /> */}

                {/* MapTiler Streets */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & MapTiler'
                    url={`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${maptilerApiKey}`}
                />
                <Marker position={[40.7128, -74.006]}>
                    <Popup>New York City</Popup>
                </Marker>
            </MapContainer>
        </div>
	);
}

