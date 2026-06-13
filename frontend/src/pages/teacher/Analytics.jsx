// src/pages/teacher/Analytics.jsx
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  getTeacherGlobalStats,
  getQuizPerformanceBreakdown
} from "../../services/analyticsService";

const TeacherAnalytics = () => {
  const [globalStats, setGlobalStats]   = useState(null);
  const [breakdown, setBreakdown]       = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const load = async () => {
      const [gs, bd] = await Promise.all([
        getTeacherGlobalStats(),
        getQuizPerformanceBreakdown(),
      ]);
      setGlobalStats(gs.data);
      setBreakdown(bd.data);
      setLoading(false);
    };
    load();
  }, []);

  // Class Insights
  const best   = breakdown.length ? breakdown.reduce((a, b) => a.avgScore > b.avgScore ? a : b) : null;
  const lowest = breakdown.length ? breakdown.reduce((a, b) => a.avgScore < b.avgScore ? a : b) : null;
  const totalAttempts = breakdown.reduce((s, q) => s + (q.count || 0), 0);

  if (loading) return (
    <div style={styles.center}>
      <div style={styles.spinner} />
    </div>
  );

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Class Analytics</h1>

      {/* ── Section 1: Summary Cards ── */}
      <div style={styles.cardRow}>
        <div style={styles.card}>
          <span style={styles.cardLabel}>Avg Attendance</span>
          <span style={styles.cardValue}>
            {globalStats?.avg_attendance ? `${Math.round(globalStats.avg_attendance)}%` : "—"}
          </span>
        </div>
        <div style={styles.card}>
          <span style={styles.cardLabel}>Avg Quiz Score</span>
          <span style={styles.cardValue}>
            {globalStats?.avg_quiz_score ? `${Math.round(globalStats.avg_quiz_score)}%` : "—"}
          </span>
        </div>
      </div>

      {/* ── Section 2: Bar Chart ── */}
      <div style={styles.chartBox}>
        <h2 style={styles.chartTitle}>Quiz Performance Breakdown</h2>
        {breakdown.length === 0 ? (
          <p style={styles.empty}>No quiz data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={breakdown} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a52" />
              <XAxis
                dataKey="quiz"
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
                formatter={v => [`${v}%`, "Avg Score"]}
              />
              <Bar dataKey="avgScore" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Section 3: Class Insights ── */}
      <div style={styles.chartBox}>
        <h2 style={styles.chartTitle}>Class Insights</h2>
        {breakdown.length === 0 ? (
          <p style={styles.empty}>No insights available yet.</p>
        ) : (
          <div style={styles.insightRow}>
            <div style={styles.insightCard}>
              <span style={styles.insightIcon}>🏆</span>
              <span style={styles.insightLabel}>Best Quiz</span>
              <span style={styles.insightName}>{best?.quiz}</span>
              <span style={styles.insightScore}>{best?.avgScore}%</span>
            </div>
            <div style={styles.insightCard}>
              <span style={styles.insightIcon}>📉</span>
              <span style={styles.insightLabel}>Lowest Quiz</span>
              <span style={styles.insightName}>{lowest?.quiz}</span>
              <span style={styles.insightScore}>{lowest?.avgScore}%</span>
            </div>
            <div style={styles.insightCard}>
              <span style={styles.insightIcon}>📝</span>
              <span style={styles.insightLabel}>Total Attempts</span>
              <span style={styles.insightScore}>{totalAttempts}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page:         { padding: "24px", maxWidth: "860px", margin: "0 auto" },
  heading:      { fontSize: "22px", fontWeight: "700", color: "#f0f9ff", marginBottom: "24px" },
  cardRow:      { display: "flex", gap: "16px", marginBottom: "28px", flexWrap: "wrap" },
  card:         { flex: 1, minWidth: "140px", background: "#0c4a6e", border: "1px solid #1e3a52", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "8px" },
  cardLabel:    { fontSize: "13px", color: "#b8d4ea", fontWeight: "500" },
  cardValue:    { fontSize: "28px", fontWeight: "700", color: "#f59e0b" },
  chartBox:     { background: "#0c4a6e", border: "1px solid #1e3a52", borderRadius: "12px", padding: "20px", marginBottom: "24px" },
  chartTitle:   { fontSize: "15px", fontWeight: "600", color: "#f0f9ff", marginBottom: "16px" },
  empty:        { color: "#5a7a96", fontSize: "14px", textAlign: "center", padding: "40px 0" },
  center:       { display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" },
  spinner:      { width: "36px", height: "36px", border: "3px solid #1e3a52", borderTop: "3px solid #f59e0b", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  insightRow:   { display: "flex", gap: "16px", flexWrap: "wrap" },
  insightCard:  { flex: 1, minWidth: "140px", background: "#0a3a57", border: "1px solid #1e3a52", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" },
  insightIcon:  { fontSize: "24px" },
  insightLabel: { fontSize: "12px", color: "#b8d4ea", fontWeight: "500" },
  insightName:  { fontSize: "13px", color: "#f0f9ff", fontWeight: "600", textAlign: "center" },
  insightScore: { fontSize: "22px", fontWeight: "700", color: "#f59e0b" },
};

export default TeacherAnalytics;