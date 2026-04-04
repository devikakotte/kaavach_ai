from datetime import datetime, timedelta
from typing import Dict, List
from uuid import uuid4

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Kaavach AI Phase 2 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

workers_db: Dict[str, dict] = {}
policies_db: Dict[str, dict] = {}
claims_db: Dict[str, dict] = {}


class WorkerRegistration(BaseModel):
    name: str
    city: str
    zone: str
    platform: str
    shift: str
    weekly_income: int
    preferred_work_days: int
    experience_level: str


class PolicyCreationRequest(BaseModel):
    worker_id: str
    rainfall: int
    aqi: int
    temperature: int
    disruption: str
    previous_claims_count: int = 0
    loyalty_discount: float = 0.0


class TriggerSimulationRequest(BaseModel):
    worker_id: str
    rainfall: int
    aqi: int
    temperature: int
    disruption: str


class ClaimCreationRequest(BaseModel):
    worker_id: str
    policy_id: str
    rainfall: int
    aqi: int
    temperature: int
    disruption: str


class FraudCheckRequest(BaseModel):
    claim_id: str
    zone_mismatch: bool = False
    suspicious_frequency: bool = False
    synthetic_pattern: bool = False
    unusual_shift_behavior: bool = False
    payout_income_mismatch: bool = False


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(value, high))


def normalize_inputs(rainfall: int, aqi: int, temperature: int):
    rainfall = int(clamp(rainfall, 0, 100))
    aqi = int(clamp(aqi, 0, 500))
    temperature = int(clamp(temperature, 10, 50))
    return rainfall, aqi, temperature


def calculate_zone_risk(city: str, zone: str) -> float:
    high_risk_zones = {
        "Hyderabad": ["Kukatpally", "Madhapur"],
        "Bengaluru": ["Whitefield", "Marathahalli"],
        "Mumbai": ["Kurla", "Andheri"],
    }
    medium_risk_zones = {
        "Hyderabad": ["Gachibowli", "Ameerpet"],
        "Bengaluru": ["Indiranagar", "HSR Layout"],
        "Mumbai": ["Powai", "Bandra"],
    }

    if city in high_risk_zones and zone in high_risk_zones[city]:
        return 0.9
    if city in medium_risk_zones and zone in medium_risk_zones[city]:
        return 0.65
    return 0.4


def calculate_shift_exposure(shift: str) -> float:
    shift_scores = {
        "Morning (6AM-12PM)": 0.3,
        "Afternoon (12PM-6PM)": 0.5,
        "Evening (6PM-12AM)": 0.8,
    }
    return shift_scores.get(shift, 0.5)


def calculate_experience_modifier(experience_level: str) -> float:
    mapping = {
        "Beginner": 0.15,
        "Intermediate": 0.08,
        "Experienced": 0.0,
    }
    return mapping.get(experience_level, 0.05)


def calculate_disruption_forecast(rainfall: int, aqi: int, temperature: int, disruption: str) -> float:
    rainfall, aqi, temperature = normalize_inputs(rainfall, aqi, temperature)

    score = 0.0

    if rainfall > 70:
        score += 0.35
    elif rainfall > 50:
        score += 0.2

    if aqi > 300:
        score += 0.3
    elif aqi > 200:
        score += 0.15

    if temperature > 40:
        score += 0.2
    elif temperature > 35:
        score += 0.1

    if disruption != "None":
        score += 0.25

    return min(score, 1.0)


def calculate_risk_score(
    rainfall: int,
    aqi: int,
    temperature: int,
    zone_risk: float,
    shift_exposure: float,
    experience_modifier: float,
) -> float:
    rainfall, aqi, temperature = normalize_inputs(rainfall, aqi, temperature)

    return round(
        (
            (rainfall / 100) * 22
            + (aqi / 500) * 24
            + (temperature / 50) * 14
            + zone_risk * 20
            + shift_exposure * 12
            + experience_modifier * 8
        ),
        2,
    )


def get_risk_level(risk_score: float) -> str:
    if risk_score >= 70:
        return "High"
    if risk_score >= 45:
        return "Medium"
    return "Low"


def calculate_weekly_premium(
    zone_risk: float,
    shift_exposure: float,
    disruption_forecast: float,
    previous_claims_count: int,
    loyalty_discount: float,
    experience_modifier: float,
) -> float:
    base_premium = 39
    zone_factor = 18 * zone_risk
    shift_factor = 12 * shift_exposure
    forecast_factor = 16 * disruption_forecast
    claim_adjustment = min(previous_claims_count * 2.5, 10)
    experience_factor = 10 * experience_modifier

    raw_premium = (
        base_premium
        + zone_factor
        + shift_factor
        + forecast_factor
        + claim_adjustment
        + experience_factor
    )

    effective_discount = min(loyalty_discount, raw_premium * 0.15)
    premium = raw_premium - effective_discount
    return round(max(premium, 35), 2)


def simulate_triggers(rainfall: int, aqi: int, temperature: int, disruption: str) -> List[dict]:
    rainfall, aqi, temperature = normalize_inputs(rainfall, aqi, temperature)
    triggers = []

    if rainfall > 50:
        triggers.append(
            {
                "trigger_type": "Heavy Rainfall",
                "status": "Triggered",
                "reason": "Rainfall exceeded safe delivery threshold.",
            }
        )

    if aqi > 200:
        triggers.append(
            {
                "trigger_type": "Severe AQI",
                "status": "Triggered",
                "reason": "AQI crossed unsafe threshold during active work window.",
            }
        )

    if temperature > 40:
        triggers.append(
            {
                "trigger_type": "Extreme Heat",
                "status": "Triggered",
                "reason": "Temperature exceeded safe outdoor delivery threshold.",
            }
        )

    if disruption != "None":
        triggers.append(
            {
                "trigger_type": "Local Disruption",
                "status": "Triggered",
                "reason": f"{disruption} affected access to delivery area.",
            }
        )

    return triggers


def calculate_payout(weekly_income: int, trigger_count: int, protected_hours: int) -> float:
    if trigger_count == 0:
        return 0.0

    hourly_rate = max(weekly_income / 42, 60)
    disruption_hours = min(2 + trigger_count, protected_hours)
    payout = hourly_rate * disruption_hours * 0.75
    return round(payout, 2)


def calculate_fraud_score(
    claim: dict,
    zone_mismatch: bool,
    suspicious_frequency: bool,
    synthetic_pattern: bool,
    unusual_shift_behavior: bool,
    payout_income_mismatch: bool,
) -> tuple[int, str, str]:
    score = 0

    if zone_mismatch:
        score += 25
    if suspicious_frequency:
        score += 20
    if synthetic_pattern:
        score += 25
    if unusual_shift_behavior:
        score += 15
    if payout_income_mismatch:
        score += 15

    if claim["trigger_count"] >= 3:
        score += 10

    score = min(score, 100)

    if score >= 65:
        return score, "High", "Review"
    if score >= 35:
        return score, "Medium", "Hold"
    return score, "Low", "Approve"


def calculate_dashboard_summary() -> dict:
    total_active_policies = len(policies_db)
    total_claims = len(claims_db)
    flagged_claims = sum(
        1 for claim in claims_db.values() if claim.get("fraud_action") in ["Hold", "Review"]
    )
    total_premium = sum(policy["premium_per_week"] for policy in policies_db.values())
    total_payout = sum(claim["payout_amount"] for claim in claims_db.values())

    avg_premium = round(total_premium / total_active_policies, 2) if total_active_policies else 0
    loss_ratio = round((total_payout / total_premium) * 100, 2) if total_premium > 0 else 0

    high_risk_policies = sum(
        1 for policy in policies_db.values() if policy["risk_level"] == "High"
    )

    return {
        "total_active_policies": total_active_policies,
        "total_claims": total_claims,
        "flagged_claims": flagged_claims,
        "average_weekly_premium": avg_premium,
        "total_payouts": round(total_payout, 2),
        "total_premiums_collected": round(total_premium, 2),
        "loss_ratio_percent": loss_ratio,
        "high_risk_policies": high_risk_policies,
    }


@app.get("/")
def root():
    return {"message": "Kaavach AI Phase 2 backend is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/register-worker")
def register_worker(data: WorkerRegistration):
    worker_id = f"WRK-{uuid4().hex[:8].upper()}"

    worker_record = {
        "worker_id": worker_id,
        "name": data.name,
        "city": data.city,
        "zone": data.zone,
        "platform": data.platform,
        "shift": data.shift,
        "weekly_income": int(clamp(data.weekly_income, 1000, 15000)),
        "preferred_work_days": int(clamp(data.preferred_work_days, 1, 7)),
        "experience_level": data.experience_level,
        "registered_at": datetime.utcnow().isoformat(),
    }

    workers_db[worker_id] = worker_record

    return {
        "message": "Worker registered successfully",
        "worker": worker_record,
    }


@app.post("/create-policy")
def create_policy(data: PolicyCreationRequest):
    worker = workers_db.get(data.worker_id)
    if not worker:
        return {"error": "Worker not found"}

    rainfall, aqi, temperature = normalize_inputs(data.rainfall, data.aqi, data.temperature)
    loyalty_discount = float(clamp(data.loyalty_discount, 0, 15))
    previous_claims_count = int(clamp(data.previous_claims_count, 0, 10))

    zone_risk = calculate_zone_risk(worker["city"], worker["zone"])
    shift_exposure = calculate_shift_exposure(worker["shift"])
    experience_modifier = calculate_experience_modifier(worker["experience_level"])
    disruption_forecast = calculate_disruption_forecast(
        rainfall, aqi, temperature, data.disruption
    )

    risk_score = calculate_risk_score(
        rainfall,
        aqi,
        temperature,
        zone_risk,
        shift_exposure,
        experience_modifier,
    )

    risk_level = get_risk_level(risk_score)

    premium = calculate_weekly_premium(
        zone_risk,
        shift_exposure,
        disruption_forecast,
        previous_claims_count,
        loyalty_discount,
        experience_modifier,
    )

    policy_id = f"POL-{uuid4().hex[:8].upper()}"
    created_at = datetime.utcnow()
    valid_until = created_at + timedelta(days=7)

    exclusions = [
        "No health or medical coverage",
        "No life insurance coverage",
        "No accident or injury coverage",
        "No vehicle repair or maintenance coverage",
        "No war, terrorism, or civil conflict coverage",
        "No pandemic or systemic national shutdown coverage",
    ]

    protected_hours = 6 if risk_level == "High" else 4 if risk_level == "Medium" else 3

    policy_record = {
        "policy_id": policy_id,
        "worker_id": data.worker_id,
        "premium_per_week": premium,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "zone_risk": zone_risk,
        "shift_exposure": shift_exposure,
        "disruption_forecast": disruption_forecast,
        "protected_hours": protected_hours,
        "status": "Active",
        "created_at": created_at.isoformat(),
        "valid_until": valid_until.isoformat(),
        "exclusions": exclusions,
    }

    policies_db[policy_id] = policy_record

    return {
        "message": "Policy created successfully",
        "policy": policy_record,
    }


@app.post("/simulate-triggers")
def simulate_trigger_events(data: TriggerSimulationRequest):
    worker = workers_db.get(data.worker_id)
    if not worker:
        return {"error": "Worker not found"}

    triggers = simulate_triggers(
        data.rainfall, data.aqi, data.temperature, data.disruption
    )

    return {
        "worker_id": data.worker_id,
        "trigger_count": len(triggers),
        "triggers": triggers,
    }


@app.post("/create-claim")
def create_claim(data: ClaimCreationRequest):
    worker = workers_db.get(data.worker_id)
    policy = policies_db.get(data.policy_id)

    if not worker:
        return {"error": "Worker not found"}
    if not policy:
        return {"error": "Policy not found"}

    triggers = simulate_triggers(
        data.rainfall, data.aqi, data.temperature, data.disruption
    )
    trigger_count = len(triggers)

    if trigger_count == 0:
        return {
            "message": "No valid parametric trigger detected. Claim not created.",
            "claim_created": False,
        }

    payout_amount = calculate_payout(
        weekly_income=worker["weekly_income"],
        trigger_count=trigger_count,
        protected_hours=policy["protected_hours"],
    )

    claim_id = f"CLM-{uuid4().hex[:8].upper()}"

    claim_record = {
        "claim_id": claim_id,
        "worker_id": data.worker_id,
        "policy_id": data.policy_id,
        "trigger_count": trigger_count,
        "triggers": triggers,
        "payout_amount": payout_amount,
        "claim_status": "Triggered",
        "fraud_score": None,
        "fraud_level": None,
        "fraud_action": None,
        "created_at": datetime.utcnow().isoformat(),
    }

    claims_db[claim_id] = claim_record

    return {
        "message": "Claim created successfully",
        "claim": claim_record,
    }


@app.post("/fraud-check")
def fraud_check(data: FraudCheckRequest):
    claim = claims_db.get(data.claim_id)
    if not claim:
        return {"error": "Claim not found"}

    fraud_score, fraud_level, fraud_action = calculate_fraud_score(
        claim=claim,
        zone_mismatch=data.zone_mismatch,
        suspicious_frequency=data.suspicious_frequency,
        synthetic_pattern=data.synthetic_pattern,
        unusual_shift_behavior=data.unusual_shift_behavior,
        payout_income_mismatch=data.payout_income_mismatch,
    )

    if fraud_action == "Approve":
        claim_status = "Approved"
    elif fraud_action == "Hold":
        claim_status = "Held for Review"
    else:
        claim_status = "Flagged for Manual Review"

    claim["fraud_score"] = fraud_score
    claim["fraud_level"] = fraud_level
    claim["fraud_action"] = fraud_action
    claim["claim_status"] = claim_status

    return {
        "message": "Fraud check completed",
        "claim_id": data.claim_id,
        "fraud_score": fraud_score,
        "fraud_level": fraud_level,
        "fraud_action": fraud_action,
        "claim_status": claim_status,
    }


@app.get("/dashboard-summary")
def dashboard_summary():
    return calculate_dashboard_summary()


@app.get("/workers")
def get_workers():
    return {"workers": list(workers_db.values())}


@app.get("/policies")
def get_policies():
    return {"policies": list(policies_db.values())}


@app.get("/claims")
def get_claims():
    return {"claims": list(claims_db.values())}

@app.get("/health")
def health_check():
    return {"status": "ok"}