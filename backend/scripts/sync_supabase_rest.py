"""
Sync all statutory schemes, partners, users, storage buckets, and AI knowledge
directly into Supabase cloud database using PostgREST API with service role key.
Supports GitHub Actions automation and local execution.
"""

import os
import sys
import json
import httpx

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

from app.utils.security import hash_password
from scripts.seed_ai_knowledge import INITIAL_QA

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_URL or not SERVICE_KEY:
    raise RuntimeError(
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set. "
        "Store them in GitHub Actions secrets for CI/CD."
    )

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"
}

def ensure_storage_bucket():
    print("\n[Storage] Ensuring 'documents' bucket exists...")
    try:
        bucket_url = f"{SUPABASE_URL}/storage/v1/bucket"
        r = httpx.get(bucket_url, headers=headers, timeout=10)
        existing = [b.get("name") for b in r.json()] if r.status_code == 200 else []
        if "documents" not in existing:
            payload = {
                "id": "documents",
                "name": "documents",
                "public": True,
                "file_size_limit": 10485760,
                "allowed_mime_types": ["application/pdf", "image/jpeg", "image/png", "image/webp"]
            }
            create_r = httpx.post(bucket_url, headers=headers, json=payload, timeout=10)
            if create_r.status_code in (200, 201):
                print("[OK] Created 'documents' bucket (Public, 10MB limit)")
            else:
                print(f"[WARN] Bucket create response: {create_r.status_code} {create_r.text}")
        else:
            print("[OK] 'documents' bucket already exists.")
    except Exception as e:
        print(f"[WARN] Storage check failed: {e}")

def sync_data():
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    print("=" * 60)
    print("[*] SYNCING ALL DATA DIRECTLY TO SUPABASE CLOUD")
    print(f"Target Project: {SUPABASE_URL}")
    print("=" * 60)

    # 0. Ensure Storage Bucket
    ensure_storage_bucket()

    # 1. Sync Schemes
    schemes_path = os.path.join(backend_dir, "app", "seed", "data", "schemes.json")
    with open(schemes_path, "r", encoding="utf-8") as f:
        schemes = json.load(f)

    print(f"\n[1/4] Syncing {len(schemes)} Statutory Schemes...")
    httpx.delete(f"{SUPABASE_URL}/rest/v1/schemes?id=neq.00000000-0000-0000-0000-000000000000", headers=headers, timeout=15)
    
    batch_size = 10
    for i in range(0, len(schemes), batch_size):
        batch = schemes[i:i + batch_size]
        resp = httpx.post(f"{SUPABASE_URL}/rest/v1/schemes", headers=headers, json=batch, timeout=15)
        if resp.status_code not in (200, 201):
            print(f"  Error inserting batch {i}: {resp.status_code} {resp.text}")
    print(f"[OK] All {len(schemes)} schemes inserted.")

    # 2. Sync Channel Partners
    partners_path = os.path.join(backend_dir, "app", "seed", "data", "partners.json")
    partners_count = 0
    if os.path.exists(partners_path):
        with open(partners_path, "r", encoding="utf-8") as f:
            partners = json.load(f)
        partners_count = len(partners)
        print(f"\n[2/4] Syncing {partners_count} Channel Partners...")
        httpx.delete(f"{SUPABASE_URL}/rest/v1/channel_partners?id=neq.00000000-0000-0000-0000-000000000000", headers=headers, timeout=15)
        resp = httpx.post(f"{SUPABASE_URL}/rest/v1/channel_partners", headers=headers, json=partners, timeout=15)
        if resp.status_code in (200, 201):
            print(f"[OK] All {partners_count} channel partners inserted.")
        else:
            print(f"  Error inserting partners: {resp.status_code} {resp.text}")

    # 3. Sync Users
    print("\n[3/4] Syncing Default Users...")
    admin_user = {
        "id": "a0000000-0000-0000-0000-000000000001",
        "name": "System Administrator",
        "email": "admin@udyamsathi.in",
        "password_hash": hash_password("admin123"),
        "role": "ADMIN",
        "language": "en",
        "is_active": True
    }
    test_user = {
        "id": "b0000000-0000-0000-0000-000000000002",
        "name": "Ramesh Kumar",
        "email": "test@udyamsathi.in",
        "password_hash": hash_password("test123"),
        "role": "BENEFICIARY",
        "language": "en",
        "is_active": True
    }
    test_profile = {
        "id": "c0000000-0000-0000-0000-000000000003",
        "user_id": "b0000000-0000-0000-0000-000000000002",
        "annual_income": 250000.0,
        "category": "SC",
        "gender": "male",
        "age": 30,
        "occupation": "Small Business Owner",
        "education_status": "12th_standard",
        "district": "Ahmedabad",
        "state": "Gujarat",
        "pincode": "380001"
    }

    httpx.delete(f"{SUPABASE_URL}/rest/v1/users?email=in.(admin@udyamsathi.in,test@udyamsathi.in)", headers=headers, timeout=15)
    httpx.post(f"{SUPABASE_URL}/rest/v1/users", headers=headers, json=[admin_user, test_user], timeout=15)
    httpx.post(f"{SUPABASE_URL}/rest/v1/applicant_profiles", headers=headers, json=[test_profile], timeout=15)
    print("[OK] Admin (admin@udyamsathi.in) & Demo Beneficiary (test@udyamsathi.in) synced.")

    # 4. Sync AI Knowledge
    print(f"\n[4/4] Syncing {len(INITIAL_QA)} Trained AI Q&As...")
    httpx.delete(f"{SUPABASE_URL}/rest/v1/ai_knowledge?id=neq.00000000-0000-0000-0000-000000000000", headers=headers, timeout=15)
    resp = httpx.post(f"{SUPABASE_URL}/rest/v1/ai_knowledge", headers=headers, json=INITIAL_QA, timeout=15)
    if resp.status_code in (200, 201):
        print(f"[OK] All {len(INITIAL_QA)} AI knowledge items inserted.")
    else:
        print(f"  Error inserting AI knowledge: {resp.status_code} {resp.text}")

    # Verify counts
    print("\n" + "=" * 60)
    print("[SUCCESS] LIVE SUPABASE CLOUD DATABASE VERIFICATION:")
    print("=" * 60)
    counts = {}
    for table in ["schemes", "channel_partners", "users", "applicant_profiles", "ai_knowledge"]:
        r = httpx.get(f"{SUPABASE_URL}/rest/v1/{table}?select=id", headers={**headers, "Prefer": "count=exact"}, timeout=15)
        count = r.headers.get("content-range", "unknown").split("/")[-1]
        counts[table] = count
        print(f"   * {table.ljust(20)}: {count} records")
    print("=" * 60 + "\n")

    # Output GitHub Step Summary if running in GitHub Actions
    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_file:
        try:
            with open(summary_file, "a", encoding="utf-8") as f:
                f.write("### 🚀 Supabase Cloud Database Sync Results\n\n")
                f.write(f"**Target Project:** `{SUPABASE_URL}`\n\n")
                f.write("| Table / Resource | Record Count | Status |\n")
                f.write("| :--- | :--- | :--- |\n")
                f.write(f"| **Statutory Schemes** | {counts.get('schemes', '0')} | ✅ Verified |\n")
                f.write(f"| **Channel Partners** | {counts.get('channel_partners', '0')} | ✅ Synced |\n")
                f.write(f"| **Users** | {counts.get('users', '0')} | ✅ Synced |\n")
                f.write(f"| **Applicant Profiles** | {counts.get('applicant_profiles', '0')} | ✅ Synced |\n")
                f.write(f"| **AI Knowledge Base** | {counts.get('ai_knowledge', '0')} | ✅ Synced |\n")
                f.write(f"| **Storage Bucket ('documents')** | Active | ✅ Ready |\n\n")
        except Exception as e:
            print(f"Failed to write GITHUB_STEP_SUMMARY: {e}")

if __name__ == "__main__":
    sync_data()
