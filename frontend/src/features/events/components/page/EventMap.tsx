import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import type { LatLngExpression } from 'leaflet';

interface EventMapProps {
    latitude?: number | null;
    longitude?: number | null;
    onLocationSelect?: (lat: number, lng: number) => void;
    interactive?: boolean;
}

// Component to handle map clicks
const LocationMarker = ({
    initialPos,
    onSelect
}: {
    initialPos: LatLngExpression | null;
    onSelect?: (lat: number, lng: number) => void;
}) => {
    const [position, setPosition] = useState<LatLngExpression | null>(initialPos);
    const map = useMap();

    useEffect(() => {
        if (initialPos) {
            setPosition(initialPos);
            map.flyTo(initialPos, map.getZoom());
        }
    }, [initialPos, map]);

    useMapEvents({
        click(e) {
            if (onSelect) {
                setPosition(e.latlng);
                onSelect(e.latlng.lat, e.latlng.lng);
            }
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
};

// Component to update map center when props change
const MapUpdater = ({ center }: { center: LatLngExpression | null }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 13);
        }
    }, [center, map]);
    return null;
};

export const EventMap = ({ latitude, longitude, onLocationSelect, interactive = false }: EventMapProps) => {
    const defaultCenter: LatLngExpression = [37.7749, -122.4194];

    const center: LatLngExpression | null = (latitude && longitude)
        ? [latitude, longitude]
        : (interactive ? defaultCenter : null);

    if (!center && !interactive) return null;

    return (
        <div className="h-[300px] w-full rounded-md overflow-hidden border z-0 relative">
            <MapContainer
                center={center || defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={interactive}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker
                    initialPos={(latitude && longitude) ? [latitude, longitude] : null}
                    onSelect={onLocationSelect}
                />
                <MapUpdater center={(latitude && longitude) ? [latitude, longitude] : null} />
            </MapContainer>
        </div>
    );
};
