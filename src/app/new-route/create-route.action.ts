"use server";

import { getCurrentPosition } from "@/src/hooks/geolocation";
import { Loader } from "@googlemaps/js-api-loader";
import { revalidateTag } from "next/cache";

export async function createRouteAction(state: any, formData: FormData) {
  const { sourceId, destinationId } = Object.fromEntries(formData);
  const directionsResp = await fetch(
    `${process.env.NEST_API_URL}/directions?originId=${sourceId}&destinationId=${destinationId}`,
    {
      // cache: "force-cache",
      // next: {
      //   revalidate: 10,
      // },
    }
  );
  if (!directionsResp.ok) {
    return { error: "failed to fetch directions data" };
  }

  const directionsData = await directionsResp.json();
  const startAddress = directionsData.routes[0].legs[0].start_address;
  const endAddress = directionsData.routes[0].legs[0].end_address;
  const createRouteResp = await fetch(`${process.env.NEST_API_URL}/routes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `${startAddress} - ${endAddress}`,
      source_id: sourceId,
      destination_id: destinationId,
    }),
  });

  if (!createRouteResp.ok) {
    return { error: "failed to create route" };
  }

  revalidateTag("routes");

  return { success: true };
}
