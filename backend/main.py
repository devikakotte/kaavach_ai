from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Kaavach AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class WorkerInput(BaseModel):
    name: str
    city: str
    zone: str
    platform: str
    shift: str
    weekly_income: int
    rainfall: int
    aqi: int
    temperature: int
    disruption: str


def calculate_zone_risk(city: str, zone: str) -> float:
    high_risk_zones = {
        "Hyderabad": ["Kukatpally", "Madhapur"],
        "Bengaluru": ["Marathahalli", "Whitefield"],
        "Mumbai": ["Kurla", "Andheri"],
    }
    if city in high_risk_zones and zone in high_risk_zones[city]:
        return 0.9
    return 0.4


def calculate_shift_exposure(shift: str) -> float:
    shift_scores = {
        "Morning (6AM-12PM)": 0.3,
        "Afternoon (12PM-6PM)": 0.5,
        "Evening (6PM-12AM)": 0.8,
    }
    return shift_scores.get(shift, 0.5)


def calculate_disruption_forecast(rainfall: int, aqi: int, temperature: int, disruption: str) -> float:
    score = 0.0

    if rainfall > 70:
        score += 0.35
    elif rainfall > 40:
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


@app.get("/")
def root():
    return {"message": "Kaavach AI backend is running"}


@app.post("/assess")
def assess_worker(data: WorkerInput):
    zone_risk = calculate_zone_risk(data.city, data.zone)
    shift_exposure = calculate_shift_exposure(data.shift)
    disruption_forecast = calculate_disruption_forecast(
        data.rainfall, data.aqi, data.temperature, data.disruption
    )

    premium = round(
        39 + (18 * zone_risk) + (12 * shift_exposure) + (16 * disruption_forecast),
        2,
    )

    risk_score = round(
        (
            (data.rainfall / 100) * 25
            + (min(data.aqi, 500) / 500) * 25
            + (min(data.temperature, 50) / 50) * 15
            + zone_risk * 20
            + shift_exposure * 15
        ),
        2,
    )

    triggered = (
        data.rainfall > 70
        or data.aqi > 300
        or data.temperature > 40
        or data.disruption != "None"
    )

    disruption_hours = 4 if triggered else 0
    hourly_rate = max(data.weekly_income / 42, 60)
    payout = round(hourly_rate * disruption_hours * 0.8, 2) if triggered else 0

    fraud_flag = False
    fraud_reason = "No suspicious activity detected."

    if data.weekly_income < 1500 and triggered and data.shift == "Morning (6AM-12PM)":
        fraud_flag = True
        fraud_reason = "Unusual claim pattern for declared income and shift."

    risk_level = "Low"
    if risk_score >= 70:
        risk_level = "High"
    elif risk_score >= 45:
        risk_level = "Medium"

    return {
        "worker_name": data.name,
        "premium_per_week": premium,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "triggered": triggered,
        "payout": payout,
        "fraud_flag": fraud_flag,
        "fraud_reason": fraud_reason,
        "zone_risk": zone_risk,
        "shift_exposure": shift_exposure,
        "disruption_forecast": disruption_forecast,
        "protected_hours": disruption_hours,
    }