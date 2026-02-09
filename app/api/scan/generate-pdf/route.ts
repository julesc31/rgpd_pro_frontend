/**
 * Proxy: le front appelle /api/scan/generate-pdf (même origine),
 * Next relaie vers le backend (port 8000) qui génère le PDF via generate_pdf.py.
 */
import { NextRequest, NextResponse } from "next/server";

// En Docker: API_INTERNAL_URL (http://api:8000). Sinon NEXT_PUBLIC_API_URL ou localhost
const BACKEND =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND}/scan/generate-pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.arrayBuffer();
    if (!res.ok) {
      const raw = new TextDecoder().decode(data);
      let detail = `Backend ${res.status}`;
      try {
        const err = JSON.parse(raw) as { detail?: string | Array<{ msg?: string }> };
        if (err.detail) {
          detail =
            typeof err.detail === "string"
              ? err.detail
              : (err.detail as Array<{ msg?: string }>)[0]?.msg ?? raw.slice(0, 200) ?? detail;
        } else if (raw.trim()) {
          detail = raw.slice(0, 300);
        }
      } catch {
        if (raw.trim()) detail = raw.slice(0, 300);
      }
      return NextResponse.json(
        { detail: detail.trim() },
        { status: res.status }
      );
    }
    const domain =
      (body?.metadata?.company as string) ||
      (body?.metadata?.domain as string) ||
      "report";
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rapport-rgpd-${domain}.pdf"`,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        detail: `Impossible de joindre l'API (${BACKEND}). Démarrez le serveur Python sur le port 8000. ${msg}`,
      },
      { status: 502 }
    );
  }
}
