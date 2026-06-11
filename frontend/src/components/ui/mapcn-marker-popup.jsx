import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export function Map({
  center = [-63.1812, -17.7833],
  zoom = 12,
  markers = [],
  onMarkerClick,
  className = ""
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng] = useState(center[0]);
  const [lat] = useState(center[1]);
  const markerRefs = useRef([]);

  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [lng, lat],
      zoom: zoom
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
  }, [lng, lat, zoom]);

  // Update markers when markers prop changes
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markerRefs.current.forEach(marker => marker.remove());
    markerRefs.current = [];

    // Add new markers
    markers.forEach(markerData => {
      const { id, coordinates, title, description, color = '#0d9f6e' } = markerData;
      
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
        `<div class="p-2">
          <h3 class="font-bold text-gray-900">${title}</h3>
          ${description ? `<p class="text-sm text-gray-600 mt-1">${description}</p>` : ''}
        </div>`
      );

      const marker = new maplibregl.Marker({ color })
        .setLngLat(coordinates)
        .setPopup(popup)
        .addTo(map.current);

      marker.getElement().addEventListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(markerData);
        }
      });

      markerRefs.current.push(marker);
    });
  }, [markers, onMarkerClick]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapContainer} className="absolute inset-0 rounded-xl" />
    </div>
  );
}
