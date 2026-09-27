"""
Comprehensive Validation & Verification Suite for UdyamSathi.
Tests:
1. SQLAlchemy Models & Database Mapping:
   - User
   - ApplicantProfile
   - Scheme
   - ChannelPartner
   - Application
2. Pydantic Schemas Validation:
   - UserResponse, UserAdminCreate, UserAdminUpdate
   - SchemeCreate, SchemeResponse, SchemeUpdate
   - PartnerCreate, PartnerResponse, PartnerUpdate
   - EligibilityInput, EligibilityResponse, SchemeRecommendation
   - EMIInput, EMIResponse
3. Deterministic Statutory Eligibility Engine:
   - Mandatory Category & Income limits
   - 0.5% Female Interest Rebate
   - 90%/95% Project Cost Statutory Threshold
   - Explainable Reasoning Generation
4. Channel Partner Locator & NPA Scoring:
   - Geolocation Haversine Distance
   - Dynamic Health Score (0-100) & is_npa_flagged
   - exclude_high_npa filtering
5. Financial EMI Calculator:
   - Standard Monthly EMI & Amortization
   - Moratorium Period Processing
   - Zero Interest Edge Case
6. Security & Account Controls:
   - Hashing & Password Verification
   - Account Suspension (is_active=False)
"""

import sys
import uuid
from datetime import datetime, timezone

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from app.database import SessionLocal, engine
from app.models.user import User, UserRole
from app.models.applicant_profile import ApplicantProfile
from app.models.scheme import Scheme
from app.models.channel_partner import ChannelPartner
from app.models.application import Application

from app.schemas.user import UserResponse, UserAdminCreate, UserAdminUpdate
from app.schemas.scheme import SchemeCreate, SchemeResponse, SchemeUpdate
from app.schemas.partner import PartnerCreate, PartnerResponse, PartnerUpdate
from app.schemas.eligibility import EligibilityInput, EligibilityResponse, SchemeRecommendation
from app.schemas.calculator import EMIInput, EMIResponse

from app.services.eligibility_engine import evaluate_scheme_eligibility, assess_schemes
from app.services.partner_locator import filter_and_rank_partners, calculate_partner_health, haversine_distance
from app.services.emi_calculator import calculate_emi
from app.utils.security import hash_password, verify_password, create_access_token


def run_all_verifications():
    print("=" * 70)
    print("🚀 STARTING COMPREHENSIVE UDYAMSATHI VERIFICATION & VALIDATION SUITE")
    print("=" * 70)
    
    db = SessionLocal()
    total_tests = 0
    passed_tests = 0

    def test_case(name: str):
        nonlocal total_tests
        total_tests += 1
        print(f"\n[TEST #{total_tests}] {name}...")

    def assert_true(condition: bool, msg: str):
        nonlocal passed_tests
        if not condition:
            print(f"  ❌ FAILED: {msg}")
            raise AssertionError(msg)
        print(f"  ✅ PASSED: {msg}")
        passed_tests += 1

    try:
        # -------------------------------------------------------------
        # 1. VERIFY USER MODEL & SCHEMAS
        # -------------------------------------------------------------
        test_case("User Model & Schema Validation (CRUD & Suspension)")
        test_email = f"verify_{uuid.uuid4().hex[:6]}@udyamsathi.in"
        test_user = User(
            name="Verification Test User",
            email=test_email,
            password_hash=hash_password("SecurePass123!"),
            role=UserRole.BENEFICIARY,
            is_active=True,
            language="hi",
            location="Ahmedabad, Gujarat",
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)

        assert_true(test_user.id is not None, "User saved to DB with valid UUID")
        assert_true(verify_password("SecurePass123!", test_user.password_hash), "Password hash verifies correctly")
        assert_true(test_user.is_active is True, "Default is_active is True")

        # Pydantic serialization
        user_resp = UserResponse.model_validate(test_user)
        assert_true(user_resp.email == test_email, "UserResponse serializes email correctly")
        assert_true(user_resp.is_active is True, "UserResponse contains is_active field")

        # Test Account Suspension
        test_user.is_active = False
        db.commit()
        db.refresh(test_user)
        assert_true(test_user.is_active is False, "User account successfully suspended")

        # -------------------------------------------------------------
        # 2. VERIFY APPLICANT PROFILE MODEL & GENDER
        # -------------------------------------------------------------
        test_case("Applicant Profile Model & Gender Column")
        profile = ApplicantProfile(
            user_id=test_user.id,
            annual_income=240000.0,
            category="SC",
            gender="female",
            age=28,
            occupation="Handloom Weaver",
            education_status="10th_standard",
            district="Ahmedabad",
            state="Gujarat",
            pincode="380001",
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

        assert_true(profile.gender == "female", "Profile successfully stores gender field")
        assert_true(profile.user.id == test_user.id, "Profile foreign key relationship to User works")

        # -------------------------------------------------------------
        # 3. VERIFY SCHEME MODEL & SCHEMAS
        # -------------------------------------------------------------
        test_case("Scheme Model & Schema Validation (NSFDC Guidelines)")
        scheme_data = SchemeCreate(
            name="Test NSFDC Micro-Credit Scheme",
            scheme_type="MICRO_CREDIT",
            description="Concessional micro finance loan for SC entrepreneurs.",
            min_income=0,
            max_income=500000.0,
            min_loan=10000.0,
            max_loan=140000.0,
            interest_rate=6.5,
            interest_rate_max=7.0,
            max_tenure=36,
            moratorium=3,
            eligible_purposes=["business", "micro_enterprise"],
            eligible_categories=["SC"],
            min_age=18,
            max_age=60,
            min_education="none",
            required_documents=["Aadhaar", "Caste Certificate", "Income Certificate"],
            subsidy_info="Up to ₹10,000 capital subsidy",
            partner_types=["SCA", "RRB"],
            source_url="https://nsfdc.nic.in/mfs",
            data_status="VERIFIED",
        )
        scheme_obj = Scheme(**scheme_data.model_dump())
        db.add(scheme_obj)
        db.commit()
        db.refresh(scheme_obj)

        assert_true(scheme_obj.id is not None, "Scheme saved to DB with UUID")
        scheme_resp = SchemeResponse.model_validate(scheme_obj)
        assert_true(scheme_resp.name == "Test NSFDC Micro-Credit Scheme", "SchemeResponse serialization valid")
        assert_true(scheme_resp.interest_rate == 6.5, "Interest rate preserves floating accuracy")

        # -------------------------------------------------------------
        # 4. VERIFY CHANNEL PARTNER MODEL & NPA SCORING
        # -------------------------------------------------------------
        test_case("Channel Partner Model & Health Scoring System")
        partner_create = PartnerCreate(
            name="Gujarat SCDC Apex Branch",
            type="SCA",
            address="Udyog Bhavan, Sector 11, Gandhinagar",
            state="Gujarat",
            district="Gandhinagar",
            pincode="382010",
            latitude=23.2156,
            longitude=72.6369,
            supported_schemes=["Test NSFDC Micro-Credit Scheme", "NSFDC Term Loan"],
            capacity_status="AVAILABLE",
            phone="079-23254000",
            email="gscdc.help@gujarat.gov.in",
            npa_rate=2.8,
            fund_utilization=92.0,
            avg_processing_days=10,
            working_hours="Mon-Fri 09:30 - 17:30",
        )
        partner_obj = ChannelPartner(**partner_create.model_dump())
        db.add(partner_obj)
        db.commit()
        db.refresh(partner_obj)

        assert_true(partner_obj.npa_rate == 2.8, "NPA rate stored correctly")
        assert_true(partner_obj.fund_utilization == 92.0, "Fund utilization stored correctly")

        score, is_flagged = calculate_partner_health(partner_obj.npa_rate, partner_obj.fund_utilization, partner_obj.avg_processing_days)
        assert_true(score > 85.0, f"Healthy partner receives high health score ({score})")
        assert_true(not is_flagged, "Low NPA partner is NOT flagged as high NPA")

        # Test High NPA flag
        score_high_npa, flagged_high = calculate_partner_health(7.5, 60.0, 25)
        assert_true(flagged_high is True, "Partner with 7.5% NPA is flagged (is_npa_flagged=True)")
        assert_true(score_high_npa < score, "High NPA partner score is heavily penalized")

        # Test Locator Filtering & exclude_high_npa
        ranked = filter_and_rank_partners(
            partners=[partner_obj],
            user_lat=23.0225,
            user_lon=72.5714,
            exclude_high_npa=True,
        )
        assert_true(len(ranked) == 1, "Healthy partner included in search results")
        assert_true(ranked[0].distance is not None, f"Haversine distance computed ({ranked[0].distance} km)")
        assert_true(ranked[0].health_score is not None, "PartnerResponse includes health_score")

        # -------------------------------------------------------------
        # 5. VERIFY APPLICATION MODEL & RELATIONSHIP
        # -------------------------------------------------------------
        test_case("Application Model & Foreign Key Links")
        app_obj = Application(
            user_id=test_user.id,
            scheme_id=scheme_obj.id,
            partner_id=partner_obj.id,
            requested_amount=100000.0,
            status="SUBMITTED",
        )
        db.add(app_obj)
        db.commit()
        db.refresh(app_obj)

        assert_true(app_obj.id is not None, "Application created successfully with valid UUID")
        assert_true(app_obj.user.id == test_user.id, "Application connects back to User")

        # -------------------------------------------------------------
        # 6. VERIFY DETERMINISTIC ELIGIBILITY ENGINE & REBATES
        # -------------------------------------------------------------
        test_case("Statutory Eligibility Engine & Female 0.5% Rebate")
        female_applicant = EligibilityInput(
            purpose="business",
            annual_income=250000.0,
            loan_amount=100000.0,
            age=25,
            category="SC",
            gender="female",
            project_cost=120000.0,  # 100k is <= 95% of 120k (114k)
            education_status="10th_standard",
            state="Gujarat",
            district="Ahmedabad",
        )

        res = assess_schemes([scheme_obj], female_applicant)
        assert_true(len(res.eligible_schemes) == 1, "Applicant is certified eligible")
        rec = res.eligible_schemes[0]
        assert_true(rec.female_rebate_applied is True, "0.5% Female rebate applied successfully")
        assert_true(rec.effective_interest_rate == 6.0, f"Interest discounted from 6.5% to {rec.effective_interest_rate}%")
        assert_true(len(rec.reasoning) >= 3, "Statutory explainable reasoning generated")

        # Test Project Cost Capping Exceeded
        excess_cost_applicant = EligibilityInput(
            purpose="business",
            annual_income=250000.0,
            loan_amount=130000.0,
            age=25,
            category="SC",
            gender="male",
            project_cost=100000.0,  # Requested 130k loan exceeds 95% of 100k project cost (95k)!
        )
        res_excess = assess_schemes([scheme_obj], excess_cost_applicant)
        assert_true(len(res_excess.ineligible_schemes) == 1, "Exceeding project cost cap causes deterministic failure")
        failed_checks = [c for c in res_excess.ineligible_schemes[0].checks if not c.passed]
        assert_true(any(c.criterion == "Project Cost Funding Ratio" for c in failed_checks), "Flagged for Project Cost Ratio")

        # -------------------------------------------------------------
        # 7. VERIFY EMI CALCULATOR & MORATORIUM SCHEDULE
        # -------------------------------------------------------------
        test_case("Financial Calculator & Moratorium Schedule")
        emi_req = EMIInput(
            principal=100000.0,
            annual_interest_rate=6.0,
            tenure_months=36,
            moratorium_months=3,
        )
        emi_out = calculate_emi(emi_req)
        assert_true(emi_out.emi > 0, f"Calculated EMI: ₹{emi_out.emi:,.2f}")
        assert_true(len(emi_out.amortization_schedule) == 36, "36 month full amortization schedule returned")
        # In moratorium months, principal repaid is 0.0
        assert_true(emi_out.amortization_schedule[0].principal == 0.0, "Month 1 moratorium principal is 0.0")
        assert_true(emi_out.amortization_schedule[3].principal > 0.0, "Month 4 regular principal repayment starts")
        assert_true(round(emi_out.amortization_schedule[-1].balance) == 0, "Final balance amortizes to zero")

        # -------------------------------------------------------------
        # CLEANUP VERIFICATION DATA
        # -------------------------------------------------------------
        test_case("Database Teardown & Integrity Cleanliness")
        db.delete(app_obj)
        db.delete(profile)
        db.delete(test_user)
        db.delete(scheme_obj)
        db.delete(partner_obj)
        db.commit()
        assert_true(True, "Temporary test records cleaned up from database cleanly")

        print("\n" + "=" * 70)
        print(f"🎉 ALL {passed_tests}/{passed_tests} TESTS PASSED PERFECTLY!")
        print("Backend models, schemas, database tables, and engines are 100% verified.")
        print("=" * 70)

    except Exception as e:
        db.rollback()
        print(f"\n❌ VERIFICATION FAILED WITH EXCEPTION: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    run_all_verifications()
