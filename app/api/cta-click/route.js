/**
 * POST /api/cta-click
 * body: { slug: string, productId: string }
 *
 * Supabase RPC increment_cta_clicks 호출 (fire-and-forget 형태)
 * 실패해도 200 응답 — UX에 영향 없음
 */

export async function POST(req) {
  try {
    const { slug, productId } = await req.json();

    if (!slug) {
      return new Response(JSON.stringify({ error: "slug required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      // 환경변수 미설정 시 조용히 성공 처리
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const rpcUrl = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/rpc/increment_cta_clicks`;

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_slug: slug }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[CTA-CLICK] RPC 실패 (${response.status}): ${body}`);
      // 실패해도 500 대신 200 — 클라이언트 UX 보호
      return new Response(JSON.stringify({ ok: false, error: "rpc failed" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[CTA-CLICK] 예외:", err);
    return new Response(JSON.stringify({ ok: false }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
