import type { FacturaPayload, FacturaResponse } from "./types";
import Constants from "expo-constants";

const { API_URL } = Constants.expoConfig?.extra ?? {};
const API_BASE_URL = API_URL;

function withTimeout(ms: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(id) };
}

export async function postFactura(payload: FacturaPayload): Promise<FacturaResponse> {
  if (!API_BASE_URL) {
    return { ok: false, message: "Falta EXPO_PUBLIC_API_BASE_URL en .env" };
  }

  const { signal, cancel } = withTimeout(15000);

  try {
    const res = await fetch(`${API_BASE_URL}/facturas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
      signal,
    });

    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      // si tu API devuelve texto plano en error
    }

    if (!res.ok) {
      return {
        ok: false,
        message: (data && (data.message || data.error)) || `HTTP ${res.status}`,
        details: data ?? text,
      };
    }

    // Si tu API ya responde con { ok:true, ... }
    return (data ?? { ok: true }) as FacturaResponse;
  } catch (e: any) {
    const msg =
      e?.name === "AbortError"
        ? "Timeout: la API no respondió a tiempo"
        : e?.message ?? "Error de red";
    return { ok: false, message: msg, details: String(e) };
  } finally {
    cancel();
  }
}
