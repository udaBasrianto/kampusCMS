import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin } from "lucide-react";

// Fix for default Leaflet icon paths in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LeafletMapProps {
  locationString: string;
  mapCoordinates?: string;
}

// Komponen untuk otomatis memindahkan map center ketika koordinat berubah
function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, 15);
  }, [map, position]);
  return null;
}

export function LeafletMap({ locationString, mapCoordinates }: LeafletMapProps) {
  // Koordinat default (misal: area kampus / Padang)
  const defaultPosition: [number, number] = [-0.8971, 100.3507];
  
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Jika koordinat eksak diberikan, langsung gunakan
    if (mapCoordinates && mapCoordinates.includes(",")) {
      const parts = mapCoordinates.split(",");
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lng)) {
        setPosition([lat, lng]);
        setIsLoading(false);
        return;
      }
    }

    if (!locationString) {
      setIsLoading(false);
      return;
    }

    const fetchCoordinates = async () => {
      try {
        // Menggunakan Nominatim API (gratis) untuk geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationString + " Padang")}&format=json&limit=1`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          // Jika tidak ditemukan dengan tambahan "Padang", coba string asli
          const fallbackResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationString)}&format=json&limit=1`
          );
          const fallbackData = await fallbackResponse.json();
          if (fallbackData && fallbackData.length > 0) {
            setPosition([parseFloat(fallbackData[0].lat), parseFloat(fallbackData[0].lon)]);
          } else {
            setPosition(defaultPosition); // Fallback ke koordinat default
          }
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        setPosition(defaultPosition);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoordinates();
  }, [locationString, mapCoordinates]);

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-xl border border-border bg-muted">
        <div className="flex flex-col items-center text-muted-foreground gap-2">
          <MapPin className="h-6 w-6 animate-pulse" />
          <span className="text-sm">Memuat Peta...</span>
        </div>
      </div>
    );
  }

  const renderPosition = position || defaultPosition;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm z-0 relative h-64 sm:h-80 w-full">
      <MapContainer
        center={renderPosition}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={renderPosition}>
          <Popup>
            <div className="font-semibold">{locationString}</div>
            <div className="text-xs text-muted-foreground">Lokasi Event</div>
          </Popup>
        </Marker>
        <RecenterMap position={renderPosition} />
      </MapContainer>
    </div>
  );
}
