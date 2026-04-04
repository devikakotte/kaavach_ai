import { useState } from "react";
import axios from "axios";
import "./index.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function App() {
  const [registrationData, setRegistrationData] = useState({
    name: "",
    city: "Hyderabad",
    zone: "Madhapur",
    platform: "Zepto",
    shift: "Evening (6PM-12AM)",
    weekly_income: 3500,
    preferred_work_days: 6,
    experience_level: "Intermediate",
  });

  const [simulationData, setSimulationData] = useState({
    rainfall: 20,
    aqi: 120,
    temperature: 32,
    disruption: "None",
    previous_claims_count: 0,
    loyalty_discount: 0,
  });

  const [fraudInputs, setFraudInputs] = useState({
    zone_mismatch: false,
    suspicious_frequency: false,
    synthetic_pattern: false,
    unusual_shift_behavior: false,
    payout_income_mismatch: false,
  });

  const [worker, setWorker] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [triggers, setTriggers] = useState([]);
  const [claim, setClaim] = useState(null);
  const [fraudResult, setFraudResult] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  const zoneOptions = {
    Hyderabad: ["Madhapur", "Kukatpally", "Gachibowli", "Ameerpet"],
    Bengaluru: ["Whitefield", "Marathahalli", "Indiranagar", "HSR Layout"],
    Mumbai: ["Andheri", "Kurla", "Powai", "Bandra"],
  };

  const handleRegistrationChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...registrationData, [name]: value };

    if (name === "city") {
      updated.zone = zoneOptions[value][0];
    }

    setRegistrationData(updated);
  };

  const handleSimulationChange = (e) => {
    const { name, value } = e.target;
    setSimulationData({ ...simulationData, [name]: value });
  };

  const handleFraudChange = (e) => {
    const { name, checked } = e.target;
    setFraudInputs({ ...fraudInputs, [name]: checked });
  };

  const registerWorker = async () => {
    setLoading(true);
    try {
      const payload = {
        ...registrationData,
        weekly_income: Number(registrationData.weekly_income),
        preferred_work_days: Number(registrationData.preferred_work_days),
      };

      const response = await axios.post(`${API_URL}/register-worker`, payload);
      setWorker(response.data.worker);
      setPolicy(null);
      setTriggers([]);
      setClaim(null);
      setFraudResult(null);
      alert("Worker registered successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to register worker.");
    } finally {
      setLoading(false);
    }
  };

  const createPolicy = async () => {
    if (!worker) {
      alert("Please register worker first.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        worker_id: worker.worker_id,
        rainfall: Number(simulationData.rainfall),
        aqi: Number(simulationData.aqi),
        temperature: Number(simulationData.temperature),
        disruption: simulationData.disruption,
        previous_claims_count: Number(simulationData.previous_claims_count),
        loyalty_discount: Number(simulationData.loyalty_discount),
      };

      const response = await axios.post(`${API_URL}/create-policy`, payload);
      setPolicy(response.data.policy);
      setClaim(null);
      setFraudResult(null);
      await loadDashboard();
      alert("Weekly policy created successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to create policy.");
    } finally {
      setLoading(false);
    }
  };

  const simulateTriggers = async () => {
    if (!worker) {
      alert("Please register worker first.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        worker_id: worker.worker_id,
        rainfall: Number(simulationData.rainfall),
        aqi: Number(simulationData.aqi),
        temperature: Number(simulationData.temperature),
        disruption: simulationData.disruption,
      };

      const response = await axios.post(`${API_URL}/simulate-triggers`, payload);
      setTriggers(response.data.triggers);
    } catch (error) {
      console.error(error);
      alert("Failed to simulate triggers.");
    } finally {
      setLoading(false);
    }
  };

  const createClaim = async () => {
    if (!worker || !policy) {
      alert("Please register worker and create policy first.");
      return;
    }

    if (triggers.length === 0) {
      alert("Please simulate triggers first so the claim is tied to a visible parametric event.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        worker_id: worker.worker_id,
        policy_id: policy.policy_id,
        rainfall: Number(simulationData.rainfall),
        aqi: Number(simulationData.aqi),
        temperature: Number(simulationData.temperature),
        disruption: simulationData.disruption,
      };

      const response = await axios.post(`${API_URL}/create-claim`, payload);

      if (response.data.claim_created === false) {
        alert("No valid trigger found. Claim was not created.");
        return;
      }

      const createdClaim = response.data.claim;

      setClaim({
        ...createdClaim,
        claim_status: "Pending Fraud Review",
      });

      setFraudResult(null);
      await loadDashboard();
    } catch (error) {
      console.error(error);
      alert("Failed to create claim.");
    } finally {
      setLoading(false);
    }
  };

  const runFraudCheck = async () => {
    if (!claim) {
      alert("Please create a claim first.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        claim_id: claim.claim_id,
        ...fraudInputs,
      };

      const response = await axios.post(`${API_URL}/fraud-check`, payload);
      setFraudResult(response.data);

      setClaim((prev) =>
        prev
          ? {
              ...prev,
              fraud_score: response.data.fraud_score,
              fraud_level: response.data.fraud_level,
              fraud_action: response.data.fraud_action,
              claim_status: response.data.claim_status,
            }
          : prev
      );

      await loadDashboard();
    } catch (error) {
      console.error(error);
      alert("Failed to run fraud check.");
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard-summary`);
      setDashboard(response.data);
    } catch (error) {
      console.error("Dashboard load failed", error);
    }
  };

  const getRiskClass = (riskLevel) => {
    if (riskLevel === "High") return "danger";
    if (riskLevel === "Medium") return "warn";
    return "safe";
  };

  const getClaimStageClass = (status) => {
    if (status === "Approved") return "safe";
    if (status === "Held for Review") return "warn";
    if (status === "Flagged for Manual Review") return "danger";
    if (status === "Pending Fraud Review") return "warn";
    return "neutral";
  };

  const claimTimeline = [
    {
      title: "Parametric Event Triggered",
      active: claim !== null,
    },
    {
      title: "Claim Created",
      active: claim !== null,
    },
    {
      title: "Fraud Review Completed",
      active: fraudResult !== null,
    },
    {
      title: fraudResult ? claim?.claim_status || "Final Decision" : "Final Decision Pending",
      active: fraudResult !== null,
    },
  ];

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="badge">Phase 2 Prototype</p>
          <h1>Kaavach AI</h1>
          <p className="subtitle">
            AI-powered weekly income protection for urban Q-commerce delivery workers.
          </p>
          <p className="persona-tag">
            Persona Focus: Zepto / Blinkit / Instamart delivery partners
          </p>
        </div>
      </header>

      <main className="grid">
        <section className="card">
          <div className="section-header">
            <div>
              <h2>1. Worker Registration</h2>
              <p className="section-subtitle">
                Register a delivery worker and create their operating profile.
              </p>
            </div>
          </div>

          <div className="form-grid">
            <div className="field-group">
              <label>Worker Name</label>
              <input
                name="name"
                value={registrationData.name}
                onChange={handleRegistrationChange}
                placeholder="Enter worker name"
              />
            </div>

            <div className="field-group">
              <label>City</label>
              <select
                name="city"
                value={registrationData.city}
                onChange={handleRegistrationChange}
              >
                <option>Hyderabad</option>
                <option>Bengaluru</option>
                <option>Mumbai</option>
              </select>
            </div>

            <div className="field-group">
              <label>Zone</label>
              <select
                name="zone"
                value={registrationData.zone}
                onChange={handleRegistrationChange}
              >
                {zoneOptions[registrationData.city].map((zone) => (
                  <option key={zone}>{zone}</option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label>Platform</label>
              <select
                name="platform"
                value={registrationData.platform}
                onChange={handleRegistrationChange}
              >
                <option>Zepto</option>
                <option>Blinkit</option>
                <option>Instamart</option>
              </select>
            </div>

            <div className="field-group">
              <label>Shift Window</label>
              <select
                name="shift"
                value={registrationData.shift}
                onChange={handleRegistrationChange}
              >
                <option>Morning (6AM-12PM)</option>
                <option>Afternoon (12PM-6PM)</option>
                <option>Evening (6PM-12AM)</option>
              </select>
            </div>

            <div className="field-group">
              <label>Weekly Income (₹)</label>
              <input
                type="number"
                name="weekly_income"
                value={registrationData.weekly_income}
                onChange={handleRegistrationChange}
                min="1000"
                max="15000"
              />
            </div>

            <div className="field-group">
              <label>Preferred Work Days</label>
              <input
                type="number"
                name="preferred_work_days"
                value={registrationData.preferred_work_days}
                onChange={handleRegistrationChange}
                min="1"
                max="7"
              />
            </div>

            <div className="field-group">
              <label>Experience Level</label>
              <select
                name="experience_level"
                value={registrationData.experience_level}
                onChange={handleRegistrationChange}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Experienced</option>
              </select>
            </div>

            <button className="primary-btn" onClick={registerWorker} disabled={loading}>
              {loading ? "Processing..." : "Register Worker"}
            </button>
          </div>

          {worker && (
            <div className="info-panel">
              <h3>Registered Worker</h3>
              <p><strong>ID:</strong> {worker.worker_id}</p>
              <p><strong>Name:</strong> {worker.name}</p>
              <p><strong>City / Zone:</strong> {worker.city} / {worker.zone}</p>
              <p><strong>Platform:</strong> {worker.platform}</p>
            </div>
          )}
        </section>

        <section className="card">
          <div className="section-header">
            <div>
              <h2>2. Weekly Policy Creation</h2>
              <p className="section-subtitle">
                Create coverage using dynamic weekly pricing and live disruption signals.
              </p>
            </div>
          </div>

          <div className="form-grid">
            <div className="field-group">
              <label>Rainfall Level (0–100)</label>
              <input
                type="number"
                name="rainfall"
                value={simulationData.rainfall}
                onChange={handleSimulationChange}
                min="0"
                max="100"
              />
            </div>

            <div className="field-group">
              <label>Air Quality Index (0–500)</label>
              <input
                type="number"
                name="aqi"
                value={simulationData.aqi}
                onChange={handleSimulationChange}
                min="0"
                max="500"
              />
            </div>

            <div className="field-group">
              <label>Temperature (10–50)</label>
              <input
                type="number"
                name="temperature"
                value={simulationData.temperature}
                onChange={handleSimulationChange}
                min="10"
                max="50"
              />
            </div>

            <div className="field-group">
              <label>Disruption</label>
              <select
                name="disruption"
                value={simulationData.disruption}
                onChange={handleSimulationChange}
              >
                <option>None</option>
                <option>Curfew</option>
                <option>Strike</option>
                <option>Zone Closure</option>
              </select>
            </div>

            <div className="field-group">
              <label>Previous Claims Count</label>
              <input
                type="number"
                name="previous_claims_count"
                value={simulationData.previous_claims_count}
                onChange={handleSimulationChange}
                min="0"
                max="10"
              />
            </div>

            <div className="field-group">
              <label>Loyalty Discount (₹)</label>
              <input
                type="number"
                name="loyalty_discount"
                value={simulationData.loyalty_discount}
                onChange={handleSimulationChange}
                min="0"
                max="15"
              />
            </div>

            <button className="primary-btn" onClick={createPolicy} disabled={loading}>
              Create Weekly Policy
            </button>
          </div>

          {policy && (
            <div className="policy-card">
              <div className="policy-top">
                <span>Active Weekly Policy</span>
                <strong>₹{policy.premium_per_week}</strong>
              </div>
              <div className="policy-grid">
                <div className="mini-metric">
                  <span>Policy ID</span>
                  <strong>{policy.policy_id}</strong>
                </div>
                <div className="mini-metric">
                  <span>Risk Score</span>
                  <strong>{policy.risk_score}</strong>
                </div>
                <div className="mini-metric">
                  <span>Risk Level</span>
                  <strong className={getRiskClass(policy.risk_level)}>{policy.risk_level}</strong>
                </div>
                <div className="mini-metric">
                  <span>Protected Hours</span>
                  <strong>{policy.protected_hours}</strong>
                </div>
              </div>

              <div className="exclusions-box">
                <h4>Policy Exclusions</h4>
                <ul>
                  {policy.exclusions.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        <section className="card">
          <div className="section-header">
            <div>
              <h2>3. Parametric Trigger Monitoring</h2>
              <p className="section-subtitle">
                Detect claim-worthy disruption events before a claim is created.
              </p>
            </div>
          </div>

          <div className="button-row">
            <button className="secondary-btn" onClick={simulateTriggers} disabled={loading}>
              Simulate Triggers
            </button>
          </div>

          {triggers.length > 0 ? (
            <div className="trigger-grid">
              {triggers.map((trigger, index) => (
                <div key={index} className="trigger-card">
                  <span className="trigger-badge">Triggered</span>
                  <h4>{trigger.trigger_type}</h4>
                  <p>{trigger.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="placeholder">
              No trigger simulation yet. Run trigger monitoring to identify rainfall, AQI, heat,
              or local disruption events that can cause income loss.
            </div>
          )}
        </section>

        <section className="card">
          <div className="section-header">
            <div>
              <h2>4. Claims Management</h2>
              <p className="section-subtitle">
                Create a claim after a valid trigger and move it through the workflow.
              </p>
            </div>
          </div>

          <div className="button-row">
            <button className="primary-btn" onClick={createClaim} disabled={loading}>
              Create Claim
            </button>
          </div>

          <div className="claim-timeline">
            {claimTimeline.map((step, index) => (
              <div key={index} className={`timeline-step ${step.active ? "active" : ""}`}>
                <div className="timeline-dot"></div>
                <span>{step.title}</span>
              </div>
            ))}
          </div>

          {claim ? (
            <div className="claim-card">
              <h3>Claim Details</h3>
              <div className="results">
                <div className="result-box">
                  <span>Claim ID</span>
                  <strong>{claim.claim_id}</strong>
                </div>
                <div className="result-box">
                  <span>Payout Amount</span>
                  <strong>₹{claim.payout_amount}</strong>
                </div>
                <div className="result-box">
                  <span>Trigger Count</span>
                  <strong>{claim.trigger_count}</strong>
                </div>
                <div className="result-box">
                  <span>Current Status</span>
                  <strong className={getClaimStageClass(claim.claim_status)}>
                    {claim.claim_status}
                  </strong>
                </div>
              </div>

              <p className="claim-note">
                Claims are automatically triggered by real-world conditions without manual filing.
                The system then performs fraud validation before releasing payouts.
              </p>
            </div>
          ) : (
            <div className="placeholder">
              A claim will appear here after a worker is registered, a weekly policy is created, and
              at least one valid trigger is detected.
            </div>
          )}
        </section>

        <section className="card">
          <div className="section-header">
            <div>
              <h2>5. Fraud Review Gate</h2>
              <p className="section-subtitle">
                Evaluate suspicious delivery-specific behavior before final payout approval.
              </p>
            </div>
          </div>

          <div className="checkbox-grid">
            <label><input type="checkbox" name="zone_mismatch" checked={fraudInputs.zone_mismatch} onChange={handleFraudChange} /> Zone mismatch</label>
            <label><input type="checkbox" name="suspicious_frequency" checked={fraudInputs.suspicious_frequency} onChange={handleFraudChange} /> Suspicious claim frequency</label>
            <label><input type="checkbox" name="synthetic_pattern" checked={fraudInputs.synthetic_pattern} onChange={handleFraudChange} /> Synthetic pattern detected</label>
            <label><input type="checkbox" name="unusual_shift_behavior" checked={fraudInputs.unusual_shift_behavior} onChange={handleFraudChange} /> Unusual shift behavior</label>
            <label><input type="checkbox" name="payout_income_mismatch" checked={fraudInputs.payout_income_mismatch} onChange={handleFraudChange} /> Payout-income mismatch</label>
          </div>

          <button className="primary-btn" onClick={runFraudCheck} disabled={loading}>
            Run Fraud Check
          </button>

          {fraudResult ? (
            <div className="fraud-card">
              <div className="results">
                <div className="result-box">
                  <span>Fraud Score</span>
                  <strong>{fraudResult.fraud_score}</strong>
                </div>
                <div className="result-box">
                  <span>Fraud Level</span>
                  <strong className={getRiskClass(fraudResult.fraud_level)}>
                    {fraudResult.fraud_level}
                  </strong>
                </div>
                <div className="result-box">
                  <span>Action</span>
                  <strong>{fraudResult.fraud_action}</strong>
                </div>
                <div className="result-box">
                  <span>Final Claim Status</span>
                  <strong className={getClaimStageClass(fraudResult.claim_status)}>
                    {fraudResult.claim_status}
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="placeholder">
              Fraud review determines whether the claim is approved instantly, held for review, or
              flagged for manual investigation.
            </div>
          )}
        </section>

        <section className="card full-width">
          <div className="section-header">
            <div>
              <h2>6. Insurer Dashboard</h2>
              <p className="section-subtitle">
                Portfolio view with policy counts, claims, fraud pressure, and actuarial metrics.
              </p>
            </div>
          </div>

          <button className="secondary-btn" onClick={loadDashboard}>
            Refresh Dashboard
          </button>

          {dashboard ? (
            <>
              <div className="dashboard-grid">
                <div className="stat-card">
                  <span>Active Policies</span>
                  <strong>{dashboard.total_active_policies}</strong>
                </div>
                <div className="stat-card">
                  <span>Total Claims</span>
                  <strong>{dashboard.total_claims}</strong>
                </div>
                <div className="stat-card">
                  <span>Flagged Claims</span>
                  <strong>{dashboard.flagged_claims}</strong>
                </div>
                <div className="stat-card">
                  <span>High-Risk Policies</span>
                  <strong>{dashboard.high_risk_policies}</strong>
                </div>
                <div className="stat-card">
                  <span>Avg Weekly Premium</span>
                  <strong>₹{dashboard.average_weekly_premium}</strong>
                </div>
                <div className="stat-card">
                  <span>Total Premiums</span>
                  <strong>₹{dashboard.total_premiums_collected}</strong>
                </div>
                <div className="stat-card">
                  <span>Total Payouts</span>
                  <strong>₹{dashboard.total_payouts}</strong>
                </div>
                <div className="stat-card">
                  <span>Loss Ratio</span>
                  <strong>{dashboard.loss_ratio_percent}%</strong>
                </div>
              </div>

              <p className="dashboard-note">
                Loss Ratio = Total Payouts / Total Premiums Collected. This helps insurers judge
                sustainability of weekly pricing and exposure across zones.
              </p>
              <p className="dashboard-note muted-note">
                This prototype view may show a high ratio in a single stress-case simulation. In a
                production environment, loss ratio is evaluated across the full insured worker pool.
              </p>
            </>
          ) : (
            <div className="placeholder">
              Load dashboard to view active policy metrics, claim volume, fraud pressure, and loss ratio.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;