// src/components/teacher/TeacherSidebar.jsx
import { NavLink } from "react-router-dom";

const navItems = [
  {
    label: "Dashboard",
    path: "/teacher/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: "Assignments",
    path: "/teacher/assignments",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="15" y2="17" />
      </svg>
    ),
  },
  {
    label: "Attendance",
    path: "/teacher/attendance",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: "Quizzes",
    path: "/teacher/quizzes",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    label: "Analytics",
    path: "/teacher/analytics",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

const TeacherSidebar = ({ onClose, isMobile }) => {
  return (
    <>
      <style>{`
        .ts-navlink {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 14px; border-radius: 10px;
          color: #b8d4ea; text-decoration: none;
          font-size: 14px; font-weight: 500;
          transition: all 0.2s ease; position: relative;
        }
        .ts-navlink:hover { background: rgba(245,158,11,0.10); color: #ffffff; transform: translateX(4px); }
        .ts-navlink.active {
          background: linear-gradient(90deg, rgba(245,158,11,0.22), rgba(245,158,11,0.05));
          color: #f59e0b; font-weight: 600;
        }
        .ts-navlink.active::before {
          content: ""; position: absolute; left: -12px; top: 20%; bottom: 20%;
          width: 3px; border-radius: 0 4px 4px 0; background: #f59e0b;
        }
        .ts-logout {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 14px; border-radius: 10px;
          color: #f87171; text-decoration: none;
          font-size: 14px; font-weight: 500; transition: all 0.2s ease;
        }
        .ts-logout:hover { background: rgba(248,113,113,0.15); transform: translateX(4px); }
        .ts-close {
          display: none; background: none; border: none;
          cursor: pointer; color: #b8d4ea; padding: 6px;
          border-radius: 8px; margin-left: auto; transition: all 0.2s ease;
        }
        .ts-close:hover { color: #fff; background: rgba(255,255,255,0.1); }
        @media (max-width: 768px) {
          .ts-close { display: flex; align-items: center; }
        }
      `}</style>

      <aside style={{ ...styles.sidebar, height: isMobile ? "100dvh" : "100%" }}>
        <div style={styles.top}>
          <div style={styles.closeRow}>
            <span style={styles.drawerTitle}>Teacher Menu</span>
            <button className="ts-close" onClick={onClose} aria-label="Close menu">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <nav style={styles.nav}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => "ts-navlink" + (isActive ? " active" : "")}
                onClick={onClose}
              >
                <span style={styles.icon}>{item.icon}</span>
                <span style={styles.label}>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div style={styles.bottom}>
          <div style={styles.divider} />
          <NavLink to="/logout" className="ts-logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span style={styles.label}>Logout</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

const styles = {
  sidebar: { width: "230px", backgroundColor: "#0c4a6e", borderRight: "1px solid #0a3a57", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "20px 0", flexShrink: 0 },
  top: { display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" },
  closeRow: { display: "flex", alignItems: "center", padding: "0 12px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "8px" },
  drawerTitle: { fontSize: "14px", fontWeight: "600", color: "#b8d4ea" },
  nav: { display: "flex", flexDirection: "column", gap: "4px", padding: "0 12px", overflowY: "auto" },
  icon: { display: "flex", alignItems: "center", flexShrink: 0 },
  label: { flexShrink: 0, flex: 1 },
  bottom: { padding: "0 12px" },
  divider: { height: "1px", backgroundColor: "rgba(255,255,255,0.10)", margin: "8px 0 12px" },
};

export default TeacherSidebar;