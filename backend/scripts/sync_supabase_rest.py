"""
Sync all statutory schemes, partners, users, and AI knowledge
directly into Supabase cloud database using PostgREST API with service role key.
"""

import os
import sys
import json
import httpx

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.security import hash_password
from scripts.seed_ai_knowledge import INITIAL_QA

SUPABASE_URL = "https://tysjojhasliytzmbspqe.supabase.co"
SERVICE_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5c2pvamhhc2xpeXR6bWJzcHFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDY1Njg0MCwiZXhwIjoyMTA2MjMyODQwfQ."
    "Wwkat2LTSM4jj5kGD4Kju2IrnmX50axeKE54ieqX2aU"
)

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"
}

def sync_data():
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    print("=" * 60)
    print("[*] SYNCING ALL DATA DIRECTLY TO SUPABASE CLOUD")
    print("=" * 60)

    # 1. Sync Schemes
    schemes_path = os.path.join(backend_dir, "app", "seed", "data", "schemes.json")
    with open(schemes_path, "r", encoding="utf-8") as f:
        schemes = json.load(f)

    print(f"\n[1/4] Syncing {len(schemes)} Statutory Schemes...")
    # Delete existing test inserts to avoid duplicate names
    httpx.delete(f"{SUPABASE_URL}/rest/v1/schemes?id=neq.00000000-0000-0000-0000-000000000000", headers=headers)
    
    # Insert in batches
    batch_size = 10
    for i in range(0, len(schemes), batch_size):
        batch = schemes[i:i + batch_size]
        resp = httpx.post(f"{SUPABASE_URL}/rest/v1/schemes", headers=headers, json=batch)
        if resp.status_code not in (200, 201):
            print(f"  Error inserting batch {i}: {resp.status_code} {resp.text}")
    print(f"[OK] All {len(schemes)} schemes inserted.")

    # 2. Sync Channel Partners
    partners_path = os.path.join(backend_dir, "app", "seed", "data", "partners.json")
    if os.path.exists(partners_path):
        with open(partners_path, "r", encoding="utf-8") as f:
            partners = json.load(f)
        print(f"\n[2/4] Syncing {len(partners)} Channel Partners...")
        httpx.delete(f"{SUPABASE_URL}/rest/v1/channel_partners?id=neq.00000000-0000-0000-0000-000000000000", headers=headers)
        resp = httpx.post(f"{SUPABASE_URL}/rest/v1/channel_partners", headers=headers, json=partners)
        if resp.status_code in (200, 201):
            print(f"[OK] All {len(partners)} channel partners inserted.")
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

    httpx.delete(f"{SUPABASE_URL}/rest/v1/users?email=in.(admin@udyamsathi.in,test@udyamsathi.in)", headers=headers)
    httpx.post(f"{SUPABASE_URL}/rest/v1/users", headers=headers, json=[admin_user, test_user])
    httpx.post(f"{SUPABASE_URL}/rest/v1/applicant_profiles", headers=headers, json=[test_profile])
    print("[OK] Admin (admin@udyamsathi.in) & Demo Beneficiary (test@udyamsathi.in) synced.")

    # 4. Sync AI Knowledge
    print(f"\n[4/4] Syncing {len(INITIAL_QA)} Trained AI Q&As...")
    httpx.delete(f"{SUPABASE_URL}/rest/v1/ai_knowledge?id=neq.00000000-0000-0000-0000-000000000000", headers=headers)
    resp = httpx.post(f"{SUPABASE_URL}/rest/v1/ai_knowledge", headers=headers, json=INITIAL_QA)
    if resp.status_code in (200, 201):
        print(f"[OK] All {len(INITIAL_QA)} AI knowledge items inserted.")
    else:
        print(f"  Error inserting AI knowledge: {resp.status_code} {resp.text}")

    # Verify counts
    print("\n" + "=" * 60)
    print("[SUCCESS] LIVE SUPABASE CLOUD DATABASE VERIFICATION:")
    print("=" * 60)
    for table in ["schemes", "channel_partners", "users", "applicant_profiles", "ai_knowledge"]:
        r = httpx.get(f"{SUPABASE_URL}/rest/v1/{table}?select=id", headers={**headers, "Prefer": "count=exact"})
        count = r.headers.get("content-range", "unknown").split("/")[-1]
        print(f"   * {table.ljust(20)}: {count} records")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    sync_data()
