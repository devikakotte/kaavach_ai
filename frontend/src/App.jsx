import { useState } from "react";
import axios from "axios";
import "./index.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    city: "Hyderabad",
    zone: "Madhapur",
    platform: "Zepto",
    shift: "Evening (6PM-12AM)",
    weekly_income: 3500,
    rainfall: 20,
    aqi: 120,
    temperature: 32,
    disruption: "None",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const zoneOptions = {
    Hyderabad: ["Madhapur", "Kukatpally", "Gachibowli", "Ameerpet"],
    Bengaluru: ["Whitefield", "Marathahalli", "Indiranagar", "HSR Layout"],
    Mumbai: ["Andheri", "Kurla", "Powai", "Bandra"],
  };

  const getRiskBadgeClass = (riskLevel) => {
    if (riskLevel === "High") return "badge-risk danger";
    if (riskLevel === "Medium") return "badge-risk warn";
    return "badge-risk safe";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };

    if (name === "city") {
      updated.zone = zoneOptions[value][0];
    }

    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const payload = {
        ...formData,
        weekly_income: Number(formData.weekly_income),
        rainfall: Number(formData.rainfall),
        aqi: Number(formData.aqi),
        temperature: Number(formData.temperature),
      };

      const response = await axios.post(`${API_URL}/assess`, payload);
      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("Failed to connect to backend. Make sure the backend is running or deployed correctly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="badge">Phase 1 Prototype</p>
          <h1>Kaavach AI</h1>
          <p className="subtitle">
            Weekly income protection for India’s urban delivery workers through
            AI-powered parametric insurance.
          </p>
        </div>
      </header>

      <main className="grid">
        <section className="card">
          <div className="section-header">
            <div>
              <h2>Worker Onboarding</h2>
              <p className="section-subtitle">
                Enter worker, zone, shift, and live disruption conditions.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-grid">
            <h3 className="section-title">Basic Details</h3>

            <div className="field-group">
              <label>Worker Name</label>
              <input
                name="name"
                placeholder="Enter worker name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field-group">
              <label>City</label>
              <select name="city" value={formData.city} onChange={handleChange}>
                <option>Hyderabad</option>
                <option>Bengaluru</option>
                <option>Mumbai</option>
              </select>
            </div>

            <div className="field-group">
              <label>Zone</label>
              <select name="zone" value={formData.zone} onChange={handleChange}>
                {zoneOptions[formData.city].map((zone) => (
                  <option key={zone}>{zone}</option>
                ))}
              </select>
            </div>

            <h3 className="section-title">Work Profile</h3>

            <div className="field-group">
              <label>Platform</label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
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
                value={formData.shift}
                onChange={handleChange}
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
                placeholder="Enter weekly income"
                value={formData.weekly_income}
                onChange={handleChange}
                min="1000"
                max="15000"
              />
            </div>

            <h3 className="section-title">External Conditions</h3>

            <div className="field-group">
              <label>Rainfall Level (0–100)</label>
              <input
                type="number"
                name="rainfall"
                placeholder="0 to 100"
                value={formData.rainfall}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </div>

            <div className="field-group">
              <label>Air Quality Index (0–500)</label>
              <input
                type="number"
                name="aqi"
                placeholder="0 to 500"
                value={formData.aqi}
                onChange={handleChange}
                min="0"
                max="500"
              />
            </div>

            <div className="field-group">
              <label>Temperature (10°C–50°C)</label>
              <input
                type="number"
                name="temperature"
                placeholder="10 to 50"
                value={formData.temperature}
                onChange={handleChange}
                min="10"
                max="50"
              />
            </div>

            <div className="field-group">
              <label>Local Disruption</label>
              <select
                name="disruption"
                value={formData.disruption}
                onChange={handleChange}
              >
                <option>None</option>
                <option>Curfew</option>
                <option>Strike</option>
                <option>Zone Closure</option>
              </select>
            </div>

            <button type="submit" className="primary-btn">
              {loading ? "Running AI Assessment..." : "Run AI Assessment"}
            </button>
          </form>
        </section>

        <section className="card">
          <div className="section-header">
            <div>
              <h2>AI Output Dashboard</h2>
              <p className="section-subtitle">
                Dynamic pricing, risk scoring, payout trigger, and fraud analysis.
              </p>
            </div>
          </div>

          {!result && (
            <div className="placeholder">
              Run an assessment to view the worker’s weekly premium, risk level,
              trigger decision, payout estimate, and fraud status.
            </div>
          )}

          {result && (
            <>
              <div className="premium-highlight">
                <span>Weekly Premium</span>
                <h3>₹{result.premium_per_week}</h3>
                <p>Calculated using zone risk, shift exposure, and disruption forecast.</p>
              </div>

              <div className="risk-score-panel">
                <div className="risk-score-top">
                  <span>Risk Score</span>
                  <strong>{result.risk_score}</strong>
                </div>

                <div className="risk-bar">
                  <div
                    className="risk-fill"
                    style={{ width: `${Math.min(result.risk_score, 100)}%` }}
                  ></div>
                </div>

                <div className="risk-meta">
                  <span className={getRiskBadgeClass(result.risk_level)}>
                    {result.risk_level} Risk
                  </span>
                </div>
              </div>

              <div className="results">
                <div className="result-box">
                  <span>Worker</span>
                  <strong>{result.worker_name}</strong>
                </div>

                <div className="result-box">
                  <span>Auto Claim Triggered</span>
                  <strong>{result.triggered ? "Yes" : "No"}</strong>
                </div>

                <div className="result-box">
                  <span>Simulated Payout</span>
                  <strong>₹{result.payout}</strong>
                </div>

                <div className="result-box">
                  <span>Protected Hours</span>
                  <strong>{result.protected_hours}</strong>
                </div>

                <div className="result-box">
                  <span>Fraud Status</span>
                  <strong className={result.fraud_flag ? "text-danger" : "text-safe"}>
                    {result.fraud_flag ? "Flagged" : "Clear"}
                  </strong>
                </div>

                <div className="result-box">
                  <span>Decision Logic</span>
                  <strong>{result.triggered ? "Event Threshold Crossed" : "No Trigger Event"}</strong>
                </div>
              </div>

              <div className="explain-panel">
                <h3>AI Explanation Layer</h3>
                <div className="explain-grid">
                  <div className="mini-metric">
                    <span>Zone Risk</span>
                    <strong>{result.zone_risk}</strong>
                  </div>
                  <div className="mini-metric">
                    <span>Shift Exposure</span>
                    <strong>{result.shift_exposure}</strong>
                  </div>
                  <div className="mini-metric">
                    <span>Disruption Forecast</span>
                    <strong>{result.disruption_forecast}</strong>
                  </div>
                </div>
                <p className="fraud-note">
                  <strong>Fraud Analysis:</strong> {result.fraud_reason}
                </p>
              </div>
            </>
          )}
        </section>

        <section className="card full-width">
          <div className="section-header">
            <div>
              <h2>Insurer Decision Snapshot</h2>
              <p className="section-subtitle">
                A current-assessment view showing how an insurer would interpret this worker’s case.
              </p>
            </div>
          </div>

          {!result && (
            <div className="placeholder">
              Once you run an assessment, this section will summarize the current policy decision
              from the insurer’s perspective.
            </div>
          )}

          {result && (
            <div className="dashboard-grid">
              <div className="stat-card">
                <span>City</span>
                <strong>{formData.city}</strong>
              </div>
              <div className="stat-card">
                <span>Zone</span>
                <strong>{formData.zone}</strong>
              </div>
              <div className="stat-card">
                <span>Disruption Type</span>
                <strong>{formData.disruption}</strong>
              </div>
              <div className="stat-card">
                <span>Platform</span>
                <strong>{formData.platform}</strong>
              </div>
              <div className="stat-card">
                <span>Policy Premium</span>
                <strong>₹{result.premium_per_week}</strong>
              </div>
              <div className="stat-card">
                <span>Risk Classification</span>
                <strong>{result.risk_level}</strong>
              </div>
              <div className="stat-card">
                <span>Claim Decision</span>
                <strong>{result.triggered ? "Approved by Trigger" : "No Payout"}</strong>
              </div>
              <div className="stat-card">
                <span>Fraud Review</span>
                <strong>{result.fraud_flag ? "Needs Review" : "No Alert"}</strong>
              </div>
            </div>
          )}

          {result && (
            <p className="dashboard-note">
              This snapshot is derived from the current worker input and AI assessment output.
              In later phases, this will expand into a full insurer dashboard with multi-worker,
              multi-zone analytics.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;