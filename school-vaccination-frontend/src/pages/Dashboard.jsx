import { useNavigate } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import "./Dashboard.css";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const navigate = useNavigate();

  const data = {
    totalStudents: 120,
    vaccinatedStudents: 84,
    percentVaccinated: 70,
    upcomingDrives: [
      { _id: 1, vaccineName: "Hepatitis B", date: new Date() },
      { _id: 2, vaccineName: "Polio", date: new Date(Date.now() + 5 * 86400000) }
    ]
  };

  const vaccineStats = [
    { vaccineName: "Hepatitis B", vaccinatedCount: 40 },
    { vaccineName: "Polio", vaccinatedCount: 30 },
    { vaccineName: "COVID-19", vaccinatedCount: 14 },
    { vaccineName: "Typhoid", vaccinatedCount: 10 }
  ];

  const alerts = [
    "⚠️ Less than 50% vaccinated in Class 7"
  ];

  const recentActivity = [
    "COVID-19 drive added for Grades 6 to 8",
    "Ivana was vaccinated against Hepatitis B",
    "Diana registered for upcoming Typhoid drive"
  ];

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <button onClick={handleLogout} className="logout-button">🔒 Logout</button>

        <h1 className="dashboard-title">📊 Vaccination Dashboard</h1>
<p className="dashboard-subtitle">
  <strong><em>
A centralized view of school vaccination coverage, drive schedules, and updates. 
    Stay informed about immunization efforts and key alerts to ensure all students receive timely protection.
  </em></strong>
</p>

        {/* Navigation */}
        <div className="dashboard-buttons">
          <button onClick={() => navigate("/students")} className="students">👨‍🎓 Students</button>
          <button onClick={() => navigate("/drives")} className="drives">💉 Drives</button>
          <button onClick={() => navigate("/reports")} className="reports">📈 Reports</button>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <h2>Total Students</h2>
            <p>{data.totalStudents}</p>
          </div>
          <div className="stat-card">
            <h2>Vaccinated</h2>
            <p>{data.vaccinatedStudents}</p>
          </div>
          <div className="stat-card">
            <h2>Coverage</h2>
            <p>{data.percentVaccinated}%</p>
          </div>
        </div>

        {/* Main Grid: Pie Chart + Alerts + Drives + Activity */}
        <div className="dashboard-grid">
          {/* Pie Chart */}
          <div className="section">
            <h2>🥧 Vaccine Coverage Chart</h2>
            <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "1rem" }}>
    <em>Hover over each segment to see the statistics.</em>
  </p>

            <div className="w-full max-w-md mx-auto">
              <Pie
                data={{
                  labels: vaccineStats.map((v) => v.vaccineName),
                  datasets: [{
                    data: vaccineStats.map((v) => v.vaccinatedCount),
                    backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"],
                    borderColor: "#fff",
                    borderWidth: 2
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "bottom" },
                    tooltip: {
                      callbacks: {
                        label: function (ctx) {
                          const value = ctx.raw;
                          const total = vaccineStats.reduce((acc, v) => acc + v.vaccinatedCount, 0);
                          const percent = total ? ((value / total) * 100).toFixed(1) : 0;
                          return `${ctx.label}: ${value} students (${percent}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Alerts + Drives + Activity */}
          <div className="section">
            <h2>📣 Alert</h2>
            <ul>
              {alerts.map((a, i) => <li key={i}>{a}</li>)}
            </ul>

            <h2 style={{ marginTop: "1.5rem" }}>📅 Upcoming Drives</h2>
            <ul>
              {data.upcomingDrives.map((drive) => (
                <li key={drive._id}>
                  {drive.vaccineName} — {new Date(drive.date).toLocaleDateString()}
                </li>
              ))}
            </ul>

            <h2 style={{ marginTop: "1.5rem" }}>📝 Recent Activity</h2>
            <ul>
              {recentActivity.map((item, i) => (
                <li key={i}>✅ {item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Vaccine Info Section */}
        <div className="section">
          <h2>💡 Vaccine Information</h2>
          <ul>
            <li><strong>Hepatitis B:</strong> Prevents serious liver infections. Administered in schools for early protection starting Grade 5.</li>
            <li><strong>Polio:</strong> Eradication-focused vaccine. Delivered via oral drops during scheduled mass drives.</li>
            <li><strong>COVID-19:</strong> Protects students, staff, and families. Targeted for eligible age groups in accordance with state health mandates.</li>
            <li><strong>Typhoid:</strong> Spread through unsafe food or water. Injectable vaccine available for high-risk classes (Grades 6–8).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
