// src/pages/student/Analytics.jsx
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import {
  getStudentQuizTrends,
  getStudentAttendance
} from "../../services/analyticsService";

const PIE_COLORS = ["#22c55e", "#ef4444", "#f59e0b"];

const StudentAnalytics = () => {
  const [quizTrends, setQuizTrends]     = useState([]);
  const [attendance, setAttendance]     = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const load = async () => {
      const [qt, att] = await Promise.all([
        getStudentQuizTrends(),
        getStudentAttendance(),
      ]);
      setQuizTrends(qt.data);
      setAttendance(att.data);
      setLoading(false);
    };
    load();
  }, []);

  // Summary calculations
  const totalQuizzes   = quizTrends.length;
  const avgScore       = totalQuizzes
    ? Math.round(quizTrends.reduce((s, q) => s + q.percentage, 0) / totalQuizzes)
    : 0;
  const totalPresent   = attendance.find(a => a.name === "Present")?.value || 0;
  const totalRecords   = attendance.reduce((s, a) => s + a.value, 0);
  const attendancePct  = totalRecords
    ? Math.round((totalPresent / totalRecords) * 100)
    : 0;

  if (loading) return (
    <div style={styles.center}>
      <div style={styles.spinner} />
    </div>
  );

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>My Analytics</h1>

      {/* ── Section 1: Summary Cards ── */}
      <div style={styles.cardRow}>
        <div style={styles.card}>
          <span style={styles.cardLabel}>Attendance</span>
          <span style={styles.cardValue}>{attendancePct}%</span>
        </div>
        <div style={styles.card}>
          <span style={styles.cardLabel}>Quiz Average</span>
          <span style={styles.cardValue}>{avgScore}%</span>
        </div>
        <div style={styles.card}>
          <span style={styles.cardLabel}>Quizzes Taken</span>
          <span style={styles.cardValue}>{totalQuizzes}</span>
        </div>
      </div>

      {/* ── Section 2: Quiz Performance Trend ── */}
      <div style={styles.chartBox}>
        <h2 style={styles.chartTitle}>Quiz Performance Trend</h2>
        {quizTrends.length === 0 ? (
          <p style={styles.empty}>No quiz data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={quizTrends} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a52" />
              <XAxis
                dataKey="quiz_title"
                tick={{ fill: "#b8d4ea", fontSize: 12 }}
                angle={-35}
                textAnchor="end"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#b8d4ea", fontSize: 12 }}
                tickFormatter={v => `${v}%`}
              />
              <Tooltip
                contentStyle={{ background: "#0c4a6e", border: "none", borderRadius: 8 }}
                labelStyle={{ color: "#f59e0b" }}
                formatter={v => [`${v}%`, "Score"]}
              />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ fill: "#f59e0b", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Section 3: Attendance Pie Chart ── */}
      <div style={styles.chartBox}>
        <h2 style={styles.chartTitle}>Attendance Breakdown</h2>
        {totalRecords === 0 ? (
          <p style={styles.empty}>No attendance data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={attendance}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
                labelLine={{ stroke: "#b8d4ea" }}
              >
                {attendance.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ color: "#b8d4ea", fontSize: 13 }} />
              <Tooltip
                contentStyle={{ background: "#0c4a6e", border: "none", borderRadius: 8 }}
                formatter={v => [v, "Count"]}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

const styles = {
  page:       { padding: "24px", maxWidth: "860px", margin: "0 auto" },
  heading:    { fontSize: "22px", fontWeight: "700", color: "#f0f9ff", marginBottom: "24px" },
  cardRow:    { display: "flex", gap: "16px", marginBottom: "28px", flexWrap: "wrap" },
  card:       { flex: 1, minWidth: "140px", background: "#0c4a6e", border: "1px solid #1e3a52", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "8px" },
  cardLabel:  { fontSize: "13px", color: "#b8d4ea", fontWeight: "500" },
  cardValue:  { fontSize: "28px", fontWeight: "700", color: "#f59e0b" },
  chartBox:   { background: "#0c4a6e", border: "1px solid #1e3a52", borderRadius: "12px", padding: "20px", marginBottom: "24px" },
  chartTitle: { fontSize: "15px", fontWeight: "600", color: "#f0f9ff", marginBottom: "16px" },
  empty:      { color: "#5a7a96", fontSize: "14px", textAlign: "center", padding: "40px 0" },
  center:     { display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" },
  spinner:    { width: "36px", height: "36px", border: "3px solid #1e3a52", borderTop: "3px solid #f59e0b", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
};

export default StudentAnalytics;