"""
유지할 슬러그 목록 외 모든 가이드 + 섹션 삭제 스크립트.
GitHub Actions workflow_dispatch 또는 로컬에서 실행.
"""
import os, sys, json
import urllib.request
import urllib.parse

KEEP_SLUGS = {
    "20260413-office-neck-shoulder-back-pain-guide",
    "20260325-office-neck-pain-guide",
    "20260329-smartphone-neck-pain-office-workers",
    "20260327-office-myofascial-neck-shoulder-pain",
    "20260410-office-low-back-pain-sitting-guide",
    "20260415-office-lower-back-pain-stretching-guide",
    "20260401-office-chair-syndrome-low-back-pain",
    "20260414-wrist-pain-smartphone-pc-guide",
    "20260401-office-wrist-carpal-tunnel-guide",
    "20260403-office-wrist-numbness-relief-guide",
    "20260326-dequervain-wrist-pain-office-workers",
    "20260417-eye-fatigue-sleep-quality-screen-work",
    "20260405-spring-eye-fatigue-office-worker-guide",
    "20260415-chronic-fatigue-sleep-stress-office-workers",
    "20260412-office-stress-fatigue-management-guide",
}

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SERVICE_KEY  = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_URL or not SERVICE_KEY:
    print("ERROR: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 환경변수 필요")
    sys.exit(1)

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
}

def request(method, path, data=None):
    url = f"{SUPABASE_URL}{path}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, r.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

# 1) 전체 슬러그 + id 조회
print("전체 가이드 조회 중...")
status, body = request("GET", "/rest/v1/guides?select=id,slug&limit=500")
if status != 200:
    print(f"조회 실패: {status} {body}")
    sys.exit(1)

all_guides = json.loads(body)
to_delete  = [g for g in all_guides if g["slug"] not in KEEP_SLUGS]

print(f"전체: {len(all_guides)}개 / 유지: {len(KEEP_SLUGS)}개 / 삭제 대상: {len(to_delete)}개\n")
if not to_delete:
    print("삭제할 가이드가 없습니다.")
    sys.exit(0)

for g in to_delete:
    print(f"  삭제 예정: {g['slug']}")

print()

dry_run = os.getenv("DRY_RUN", "false").lower() == "true"
if dry_run:
    print("DRY_RUN=true — 실제 삭제 안 함.")
    sys.exit(0)

# 2) 섹션 먼저 삭제 (FK 제약)
for g in to_delete:
    gid = g["id"]
    status, body = request("DELETE", f"/rest/v1/guide_sections?guide_id=eq.{gid}")
    print(f"  섹션 삭제 [{g['slug']}]: {status}")

# 3) 가이드 삭제
for g in to_delete:
    slug_enc = urllib.parse.quote(g["slug"], safe="")
    status, body = request("DELETE", f"/rest/v1/guides?slug=eq.{slug_enc}")
    print(f"  가이드 삭제 [{g['slug']}]: {status}")

print(f"\n완료: {len(to_delete)}개 삭제됨.")
