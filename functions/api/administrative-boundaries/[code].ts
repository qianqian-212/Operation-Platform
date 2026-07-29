const upstreamBoundaryBaseUrl = "https://geo.datav.aliyun.com/areas_v3/bound";
const edgeCacheTtlSeconds = 7 * 24 * 60 * 60;
const browserCacheTtlSeconds = 24 * 60 * 60;

interface AdministrativeBoundaryFunctionContext {
  readonly params: Record<string, string | string[]>;
  readonly request: Request;
  waitUntil(promise: Promise<unknown>): void;
}

declare const caches: {
  readonly default: Cache;
};

function jsonError(message: string, status: number) {
  return Response.json(
    { error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export async function onRequestGet(
  context: AdministrativeBoundaryFunctionContext,
) {
  const rawCode = context.params.code;
  const code = Array.isArray(rawCode) ? rawCode[0] : rawCode;
  if (!code || !/^\d{6,9}$/.test(code)) {
    return jsonError("无效行政区代码", 400);
  }

  const cacheKey = new Request(context.request.url, { method: "GET" });
  const cached = await caches.default.match(cacheKey);
  if (cached) return cached;

  let upstream: Response;
  try {
    upstream = await fetch(`${upstreamBoundaryBaseUrl}/${code}_full.json`, {
      headers: { Accept: "application/json" },
      signal: context.request.signal,
    });
  } catch {
    return jsonError("行政区边界上游暂不可用", 502);
  }

  if (upstream.status === 404) {
    return jsonError(`行政区 ${code} 暂无下级边界数据`, 404);
  }
  if (!upstream.ok) {
    return jsonError(`行政区边界上游请求失败：${upstream.status}`, 502);
  }

  const response = new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json; charset=utf-8",
      "Cache-Control": [
        "public",
        `max-age=${browserCacheTtlSeconds}`,
        `s-maxage=${edgeCacheTtlSeconds}`,
        "stale-while-revalidate=86400",
      ].join(", "),
      "X-Content-Type-Options": "nosniff",
    },
  });
  context.waitUntil(caches.default.put(cacheKey, response.clone()));
  return response;
}
