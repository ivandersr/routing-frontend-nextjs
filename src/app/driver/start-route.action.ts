"use server";

export async function startRouteAction(state: any, formData: FormData) {
  const { route_id } = Object.fromEntries(formData);
  if (!route_id) {
    return { error: "Selecione uma rota" };
  }
  const startRouteResp = await fetch(
    `${process.env.NEST_API_URL}/routes/${route_id}/start`,
    {
      method: "POST",
    }
  );
  if (!startRouteResp.ok) {
    return { error: "failed to start route" };
  }

  return { success: true };
}
