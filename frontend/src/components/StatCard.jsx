// src/components/StatCard.jsx

const StatCard = ({ title, value, icon, accentColor = "#f59e0b" }) => {
  return (
    <>
      <style>{`
        .ss-stat {
          background: #ffffff;
          border: 1px solid #dbeafe;
          border-radius: 14px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: default;
          transition: all 0.25s ease;
          box-shadow: 0 1px 3px rgba(12,45,74,0.06);
        }
        .ss-stat:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(7,89,133,0.15);
          border-color: #f59e0b;
        }
        .ss-stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }
        .ss-stat:hover .ss-stat-icon {
          transform: scale(1.1) rotate(-6deg);
        }
      `}</style>

      <div className="ss-stat">
        <div
          className="ss-stat-icon"
          style={{
            backgroundColor: accentColor + "1f",
            border: `1px solid ${accentColor}55`,
          }}
        >
          <span style={{ fontSize: "22px", color: accentColor, display: "flex" }}>{icon}</span>
        </div>

        <div style={styles.text}>
          <span style={styles.value}>{value}</span>
          <span style={styles.title}>{title}</span>
        </div>
      </div>
    </>
  );
};

const styles = {
  text: { display: "flex", flexDirection: "column", gap: "4px" },
  value: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#0c2d4a",
    lineHeight: "1",
  },
  title: {
    fontSize: "13px",
    color: "#5a7a96",
    fontWeight: "500",
    letterSpacing: "0.2px",
  },
};

export default StatCard;
