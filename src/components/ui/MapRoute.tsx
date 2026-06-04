"use client";

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export interface MapLocation {
  id?: string;
  name: string;
  lat: number;
  lng: number;
}

interface MapRouteProps {
  locations: MapLocation[];
  className?: string;
}

export default function MapRoute({ locations, className = '' }: MapRouteProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current) return;

    if (!map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        center: [91.8832, 25.5744], // Default to Shillong
        zoom: 10,
        interactive: true,
      });

      map.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
      
      map.current.on('load', () => {
        setMapLoaded(true);
      });
    }

    return () => {
      // In strict mode this might unmount and remount, so we must clean up
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Handle Updates
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    const currentMap = map.current;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (!locations || locations.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    
    locations.forEach((loc, index) => {
      bounds.extend([loc.lng, loc.lat]);
      
      // Marker DOM Element
      const el = document.createElement('div');
      el.className = 'map-marker relative flex items-center justify-center w-8 h-8';
      el.innerHTML = `
        <div class="absolute inset-0 bg-primary/20 rounded-full animate-ping delay-${index * 100}"></div>
        <div class="relative w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold border-2 border-background shadow-md backdrop-blur-sm z-10 transition-transform hover:scale-125 hover:z-20 cursor-pointer">
          ${index + 1}
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([loc.lng, loc.lat])
        .setPopup(new maplibregl.Popup({ offset: 15, closeButton: false, className: 'rounded-xl overflow-hidden shadow-xl' }).setHTML(`
          <div class="font-sans px-3 py-2">
            <p class="font-bold text-sm m-0">${loc.name}</p>
          </div>
        `))
        .addTo(currentMap);
        
      // Show popup on hover
      el.addEventListener('mouseenter', () => marker.togglePopup());
      el.addEventListener('mouseleave', () => marker.togglePopup());
        
      markersRef.current.push(marker);
    });

    if (locations.length > 1) {
      currentMap.fitBounds(bounds, { padding: { top: 60, bottom: 60, left: 60, right: 60 }, maxZoom: 14, duration: 1500 });
      
      const coordinates = locations.map(l => [l.lng, l.lat]);
      const orsKey = process.env.NEXT_PUBLIC_ORS_KEY;
      
      if (!orsKey) {
        console.warn('MapRoute: NEXT_PUBLIC_ORS_KEY is missing');
        return;
      }

      // Fetch route from OpenRouteService
      fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': orsKey,
        },
        body: JSON.stringify({ 
          coordinates,
          radiuses: locations.map(() => 2000) // 2km search radius for mountain spots
        })
      })
      .then(async res => {
         if (!res.ok) {
           const errData = await res.json().catch(() => ({}));
           console.warn('ORS Routing semi-failure:', errData);
           // Fallback to straight line
           return {
             type: 'FeatureCollection',
             features: [{
               type: 'Feature',
               geometry: { type: 'LineString', coordinates: coordinates },
               properties: { fallback: true }
             }]
           };
         }
         return res.json();
      })
      .then(data => {
         if (currentMap.getSource('route')) {
            (currentMap.getSource('route') as maplibregl.GeoJSONSource).setData(data);
         } else {
            currentMap.addSource('route', {
               type: 'geojson',
               data: data
            });
            // Glow/Outline layer
            currentMap.addLayer({
               id: 'route-outline',
               type: 'line',
               source: 'route',
               layout: { 'line-join': 'round', 'line-cap': 'round' },
               paint: { 
                 'line-color': 'hsl(var(--primary))', 
                 'line-width': 8, 
                 'line-opacity': 0.2,
                 'line-blur': 4
               }
            });
            // Core line layer
            currentMap.addLayer({
               id: 'route-line',
               type: 'line',
               source: 'route',
               layout: { 'line-join': 'round', 'line-cap': 'round' },
               paint: { 
                 'line-color': 'hsl(var(--primary))', 
                 'line-width': 3,
                 'line-dasharray': [2, 2] 
               }
            });
         }
      })
      .catch(err => {
         console.error("Routing error:", err);
         // Final fallback: solid straight line
         const fallbackData = {
           type: 'FeatureCollection',
           features: [{
             type: 'Feature',
             geometry: { type: 'LineString', coordinates: coordinates },
             properties: {}
           }]
         };
         if (currentMap.getSource('route')) {
           (currentMap.getSource('route') as maplibregl.GeoJSONSource).setData(fallbackData as any);
         }
      });
    } else if (locations.length === 1) {
       currentMap.flyTo({ center: [locations[0].lng, locations[0].lat], zoom: 12, duration: 1500 });
       // Clear line if exists
       if (currentMap.getSource('route')) {
           (currentMap.getSource('route') as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features: [] } as any);
       }
    }
  }, [locations, mapLoaded]);

  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden bg-muted/50 ${className}`}>
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-xl text-sm backdrop-blur-md z-10 flex items-center justify-between gap-4 shadow-lg animate-in slide-in-from-top-4 fade-in">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="opacity-70 hover:opacity-100 hover:bg-destructive-foreground/10 h-6 w-6 rounded-md flex items-center justify-center transition-colors pb-0.5">&times;</button>
        </div>
      )}
    </div>
  );
}
