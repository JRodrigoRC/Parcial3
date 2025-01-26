"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

// Cargar el componente dinámicamente para evitar problemas con el lado del servidor
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
});

// Icono personalizado para los marcadores del mapa
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Coordenada {
  _id: string;
  nombre: string;
  lat: number;
  lon: number;
  creador: string;
  imagen: string;
}

interface MapProps {
  location: { lat: number; lon: number };
  coordenadas: Coordenada[];
}

const RecenterAutomatically = ({ location }: { location: { lat: number; lon: number } }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([location.lat, location.lon]);
  }, [location, map]);
  return null;
};

const CoordenadaMap: React.FC<MapProps> = ({ location, coordenadas = [] }) => {
  const [zoom, setZoom] = useState(13);
  useEffect(() => {
    if (location.lat && location.lon) {
      setZoom(13);
    }
  }, [location]);

  return (
    <MapContainer
      center={[location.lat, location.lon]}
      zoom={zoom}
      style={{ height: "400px", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {coordenadas.map((coordenada) => (
        <Marker key={coordenada._id} position={[coordenada.lat, coordenada.lon]} icon={customIcon}>
          <Popup>
            <strong>{coordenada.nombre}</strong>
            <br />
            {coordenada.creador}
          </Popup>
        </Marker>
      ))}
      <RecenterAutomatically location={location} />
    </MapContainer>
  );
};

export default CoordenadaMap;