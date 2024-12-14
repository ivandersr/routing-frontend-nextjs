"use client";

import { ChangeEvent, useEffect, useRef } from "react";
import { useMap } from "../../hooks/useMap";
import { socket } from "@/src/utils/socket-io";

export type MapDriverProps = {
  routeIdElementId: string;
};

export function MapDriver({
  routeIdElementId,
}: MapDriverProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useMap(mapContainerRef);

 
  useEffect(() => {
    if (!map || !routeIdElementId) {
      return;
    }
    const handler = async (event: any) => {
      if (socket.disconnected) {
        socket.connect();
      } else {
        socket.offAny();
      }
  
      // @ts-ignore-next-line
      const routeId = event.target.value;
  
      socket.on(
        `server:new-points/${routeId}:list`,
        async (data: { route_id: string; lat: number; lng: number }) => {
          if (!map.hasRoute(data.route_id)) {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_NEXT_API_URL}/routes/${data.route_id}`
            );
            const route = await response.json();
            map.addRouteWithIcons({
              routeId: data.route_id,
              startMarkerOptions: {
                position: route.directions.routes[0].legs[0].start_location,
              },
              endMarkerOptions: {
                position: route.directions.routes[0].legs[0].end_location,
              },
              carMarkerOptions: {
                position: route.directions.routes[0].legs[0].start_location,
              },
            });
          } else {
            map.moveCar(data.route_id, { lat: data.lat, lng: data.lng });
          }
        }
      );
    }
  
    const selectElement = document.querySelector(`#${routeIdElementId}`) as HTMLSelectElement;
    selectElement.addEventListener("change", handler);
    return () => {
      selectElement.removeEventListener("change", handler);
      socket.disconnect();
    };    
  }, [routeIdElementId, map]);

  return <div className="w-2/3 h-screen" ref={mapContainerRef} />;
}
