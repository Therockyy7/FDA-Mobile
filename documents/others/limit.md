# FE Quickstart - Predict Flood Assemble

Tai lieu nay giup FE goi endpoint chinh va bat loi nhanh (nhat la 429 rate limit).

## 1) Endpoint can goi

- *Primary:* POST /api/v1/area/{area_id}/predict-flood-assemble
- *Alias:* POST /api/v1/area/{area_id}/predict/flood-risk-ensemble
- *Rate limit:* 10 request / phut / client_key
  - client_key = <ip>:<api_key_fingerprint>

Khuyen nghi FE dung endpoint primary de dong nhat voi backend docs moi.

---

## 2) Headers khuyen nghi

Gui day du cac header sau de trace nhanh:

Content-Type: application/json
X-Request-ID: <uuid-v4-tu-FE>
X-API-KEY: <api-key-neu-he-thong-yeu-cau>

- X-Request-ID: backend se log theo request nay, rat huu ich khi debug.
- X-API-KEY: neu moi truong cua ban dang bat API key.

---

## 3) Fetch mau (copy-paste duoc ngay)

type PredictAssembleResult = {
  success: boolean;
  message?: string;
  data?: unknown;
};

async function callPredictAssemble(baseUrl: string, areaId: string, apiKey?: string) {
  const requestId = crypto.randomUUID();
  const res = await fetch(`${baseUrl}/api/v1/area/${areaId}/predict-flood-assemble`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Request-ID": requestId,
      ...(apiKey ? { "X-API-KEY": apiKey } : {}),
    },
  });

  let body: PredictAssembleResult | { detail?: string } | null = null;
  try {
    body = await res.json();
  } catch {
    // keep null when body is not JSON
  }

  if (!res.ok) {
    const detail = (body as { detail?: string } | null)?.detail ?? "Unknown error";
    throw {
      status: res.status,
      requestId,
      detail,
      raw: body,
    };
  }

  return {
    requestId,
    data: body as PredictAssembleResult,
  };
}

---

## 4) Error handling nhanh theo status

| Status | Nghia | Hanh dong FE nen lam |
|---|---|---|
| 400 | Input khong hop le (area_id/query) | Show message de user chon lai khu vuc |
| 403 | Thieu/sai API key (neu bat auth) | Nhac login/reload token/API key |
| 404 | Khong tim thay khu vuc | Show "Khu vuc khong ton tai" + cho chon lai |
| 429 | Vuot rate limit 10 req/phut | Backoff + retry co gioi han, disable spam click tam thoi |
| 500 | Loi he thong | Toast loi + cho retry thu cong |

Neu gap 429, uu tien UX:

- khoa nut "Du bao" tam 10-20s,
- hien countdown retry,
- tranh auto-retry vo han.

---

## 5) Retry/backoff de tranh bi throttle

Khuyen nghi:

- Chi retry voi 429, 502, 503, 504
- Toi da 2 lan
- Exponential backoff + jitter

async function withRetry<T>(fn: () => Promise<T>, maxRetry = 2): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt += 1;
      const status = err?.status;
      const retryable = [429, 502, 503, 504].includes(status);
      if (!retryable || attempt > maxRetry) throw err;

      const base = 600 * 2 ** (attempt - 1); // 600ms, 1200ms
      const jitter = Math.floor(Math.random() * 200);
      await new Promise((r) => setTimeout(r, base + jitter));
    }
  }
}

---

## 6) Bat loi nhanh trong 2 phut (checklist)

1. Log ra FE console:
   - requestId
   - url
   - status
   - detail
2. Copy requestId gui BE de tra log server.
3. Neu 429:
   - Kiem tra user co bam lien tuc hay auto-refresh polling.
   - Kiem tra cung 1 public IP co nhieu user dung chung (office/VPN/NAT).
4. Neu 403:
   - Kiem tra header X-API-KEY.
5. Neu 404:
   - Kiem tra area_id map voi data hien co.

---

## 7) UI rule de giam loi

- Debounce action "Predict" >= 600ms
- Disable button khi request dang pending
- Khong goi song song cung endpoint cho cung area_id
- Cache response ngan han (30-60s) neu user mo dong lai cung khu vuc

---

## 😎 Mau map loi -> thong diep UI

function toUserMessage(status?: number) {
  if (status === 429) return "He thong dang nhan nhieu yeu cau. Vui long thu lai sau it giay.";
  if (status === 403) return "Khong co quyen truy cap. Vui long dang nhap lai.";
  if (status === 404) return "Khong tim thay khu vuc. Vui long chon khu vuc khac.";
  if (status && status >= 500) return "He thong tam thoi gian doan. Vui long thu lai.";
  return "Co loi xay ra. Vui long thu lai.";
}
