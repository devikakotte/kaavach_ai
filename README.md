# Kaavach AI

### AI-Powered Parametric Insurance for India’s Urban Gig Workers

---

## Problem

Urban delivery workers (Zepto, Blinkit, Instamart) face unpredictable income loss due to:

- Heavy rainfall disrupting mobility  
- High AQI making work unsafe  
- Extreme heat reducing working hours  
- Sudden local disruptions like curfews and strikes  

These workers are paid weekly and operate in high-risk environments, yet traditional insurance systems are:

- slow and claim-heavy  
- dependent on manual verification  
- not aligned with short income cycles  

There is no real-time financial protection system for their income volatility.

---

## Solution

Kaavach AI is a **parametric insurance platform** that provides instant, automated income protection.

Instead of manual claims, payouts are triggered automatically based on real-world conditions.

The system:
- calculates weekly premiums dynamically  
- predicts risk using environmental signals  
- triggers payouts when disruption thresholds are exceeded  
- provides transparent decision logic for both workers and insurers  

---

## Who is the User?

### Primary User: Delivery Worker

- works in urban zones with high uncertainty  
- earns on a weekly basis  
- highly sensitive to income disruptions  
- needs instant and simple protection  

### Secondary User: Insurer

- needs scalable risk modeling  
- must prevent fraudulent claims  
- wants real-time exposure monitoring  
- requires automated decision systems  

Kaavach AI bridges both sides with a shared intelligent system.

---

## What it Does

1. Worker enters:
   - city and zone  
   - platform and shift  
   - weekly income  
   - environmental conditions  

2. AI computes:
   - risk score  
   - weekly premium  

3. If disruption thresholds are crossed:
   - claim is automatically triggered  
   - payout is calculated instantly  

4. System also provides:
   - fraud detection  
   - explanation layer  
   - insurer decision snapshot  

---

## How the AI Works

Kaavach AI uses a **multi-factor risk scoring model** based on:

- Zone Risk (urban disruption probability)  
- Shift Exposure (time-based vulnerability)  
- Environmental Severity:
  - rainfall  
  - AQI  
  - temperature  
- Disruption Signals:
  - curfew  
  - strike  
  - zone closure  

---

## Intelligent Adaptation & Collective Defense

Kaavach AI goes beyond static parametric insurance by introducing a self-adaptive intelligence layer that evolves with real-world usage patterns.

### Adaptive Premium Engine

Unlike fixed pricing models, Kaavach AI continuously adjusts weekly premiums based on:

- historical claim behavior of the worker  
- zone-level disruption trends  
- environmental risk patterns over time  

For example:
- workers in safer zones or with fewer claims receive reduced premiums  
- high-risk zones or repeated claims dynamically increase pricing  

This creates a feedback-driven system that improves sustainability over time.

---

### Collective Fraud Detection (Cluster Intelligence)

Traditional systems evaluate fraud at an individual level.

Kaavach AI detects **coordinated fraud attacks** by analyzing cluster-level patterns:

- multiple claims from the same zone within short time intervals  
- identical disruption signals across multiple users  
- synchronized claim timing patterns  

This enables detection of large-scale fraud rings (e.g., GPS spoofing attacks) rather than just isolated bad actors.

---

### Smart Claim Decision Pipeline

Kaavach AI follows a staged decision workflow:

1. Parametric Trigger Detection  
2. Claim Creation  
3. Fraud Risk Evaluation  
4. Final Decision (Approve / Hold / Flag)  

This ensures:
- instant payouts for genuine users  
- controlled risk exposure for insurers  
- fair handling of edge cases  

---

### Why This Makes Kaavach AI Unique

- Moves from rule-based to adaptive pricing  
- Detects fraud at **system level**, not just user level  
- Balances automation with trust  
- Designed for real-world scale, not just prototype scenarios  


### Why Parametric Insurance?

Traditional insurance requires claim verification, which is slow and costly.

Kaavach AI uses a parametric model where payouts are triggered automatically based on measurable conditions such as rainfall, AQI, and disruptions.

This makes the system:
- faster (no claim processing delay)
- scalable (handles thousands of workers)
- transparent (rule-based decisions)
- cost-efficient for insurers
### Risk Score Logic

The system computes a weighted score:

- higher environmental severity → higher risk  
- peak shift exposure → higher vulnerability  
- disruption presence → direct trigger factor  

### Premium Calculation

Weekly premium is derived from:

- base risk score  
- worker income  
- disruption probability  

### Claim Triggering

A payout is triggered when:
- environmental thresholds are exceeded  
- AND disruption overlaps with working window  

This removes the need for manual claims.

---

## System Architecture

### Frontend
- React (Vite)
- Structured onboarding UI
- Real-time output dashboard

### Backend
- FastAPI (Python)
- Risk scoring engine
- Premium calculation logic
- Claim triggering system
- Fraud detection layer

### Communication
- REST API using Axios

### Deployment
- Frontend: Vercel  
- Backend: Render  

---

## Key Features

- Dynamic weekly premium pricing  
- AI-based risk scoring  
- Parametric claim triggering  
- Fraud detection logic  
- Transparent explanation layer  
- Insurer decision snapshot  
- Fully deployed full-stack system  

---

## Challenges

- Designing a realistic risk scoring model using limited inputs  
- Balancing simplicity with meaningful AI logic  
- Representing both worker-side and insurer-side views  
- Ensuring smooth frontend-backend integration  
- Deploying a stable full-stack prototype  

---

## What We Learned

- Parametric insurance reduces claim friction drastically  
- Multi-signal risk scoring improves decision reliability  
- Fraud detection must be integrated from day one  
- Real-world systems require both speed and trust  
- Deployment is critical for demonstrating product maturity  

---

## Adversarial Defense & Anti-Spoofing Strategy

### Market Crash Context

In a high-risk scenario, coordinated fraud rings may exploit GPS spoofing to simulate presence in disrupted zones and trigger mass payouts.

Kaavach AI is designed to **not trust GPS alone**, but instead use a multi-layer fraud intelligence system.

---

### 1. Differentiation: Genuine vs Spoofed Worker

A genuine worker shows:
- consistency with historical zone and shift  
- realistic movement patterns  
- alignment with disruption timing  
- plausible earning profile  

A spoofed actor shows:
- sudden high-risk zone appearance  
- impossible movement jumps  
- repeated synchronized claims  
- mismatch with historical behavior  

Kaavach AI assigns a **Fraud Risk Score** instead of relying on a single signal.

---

### 2. Data Beyond GPS

The system evaluates:

#### Geo-behavioral signals
- operating zone history  
- route continuity  
- shift alignment  

#### Temporal signals
- claim timing vs shift  
- burst claim patterns  

#### Environmental signals
- rainfall, AQI, temperature  
- disruption timing overlap  

#### Behavioral signals
- claim frequency  
- income vs payout mismatch  

#### Cluster detection
- multiple similar claims in same zone  
- synchronized timing across accounts  
- pattern similarity across users  

This allows detection of **coordinated fraud rings**, not just individuals.

---

### 3. UX Balance: Fairness for Honest Workers

Kaavach AI avoids harsh rejection systems.

Instead:

- **Low risk** → instant payout  
- **Medium risk** → delayed + soft verification  
- **High risk** → flagged for review  

This ensures:
- genuine workers are not penalized  
- fraud is slowed and analyzed  

---

### Defense Architecture

1. Disruption validation  
2. Worker consistency check  
3. Anomaly scoring  
4. Cluster fraud detection  
5. Decision routing  

---

### Why This Matters

Parametric systems must be:
- fast for users  
- secure for insurers  

Kaavach AI ensures both by combining automation with intelligent fraud defense.

---

## Future Scope

- Real-time weather and AQI APIs  
- Live GPS validation integration  
- Device fingerprinting  
- Advanced ML fraud detection models  
- Insurer analytics dashboard  
- Real payout integrations  

---

## Tech Stack

React, Vite, FastAPI, Python, Axios, Render, Vercel

---

## Live Demo

https://kaavachai.vercel.app/

---

## GitHub Repository

https://github.com/devikakotte/kaavach_ai

---

## Conclusion

Kaavach AI transforms insurance from a reactive claim process into a proactive, automated protection system designed for the realities of India’s gig economy.

It combines:
- AI-driven risk modeling  
- instant payouts  
- fraud resilience  

to create a scalable and practical solution for income protection.