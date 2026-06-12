import { useAuth } from "../context/AuthContext";

const Navbar = ({ onHamburger }) => {
  const { user } = useAuth();

  const studentName = user?.user_metadata?.full_name || user?.email || "Student";
  const initials = studentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <style>{`
        .ss-iconBtn {
          background: none; border: none; cursor: pointer;
          color: #cfe6f7; padding: 8px; border-radius: 10px;
          display: flex; align-items: center; transition: all 0.2s ease;
        }
        .ss-iconBtn:hover { background: rgba(255,255,255,0.12); color: #f59e0b; transform: translateY(-2px); }
        .ss-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
          color: #0c2d4a; font-size: 13px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.25s ease; box-shadow: 0 2px 6px rgba(245,158,11,0.4);
        }
        .ss-profile:hover .ss-avatar { transform: scale(1.08); box-shadow: 0 4px 14px rgba(245,158,11,0.55); }
        .ss-profile {
          display: flex; align-items: center; gap: 10px;
          padding: 4px 10px 4px 4px; border-radius: 30px;
          cursor: pointer; transition: background 0.2s ease;
        }
        .ss-profile:hover { background: rgba(255,255,255,0.10); }
        .ss-hamburger {
          background: none; border: none; cursor: pointer;
          color: #cfe6f7; padding: 8px; border-radius: 10px;
          display: flex; flex-direction: column; gap: 5px;
          transition: all 0.2s ease;
        }
        .ss-hamburger:hover { background: rgba(255,255,255,0.12); }
        .ss-hamburger span { width: 20px; height: 2px; background: #cfe6f7; border-radius: 2px; display: block; }
        @media (max-width: 768px) {
          .ss-name { display: none; }
        }
      `}</style>

      <header style={styles.navbar}>
        <div style={styles.left}>
          <button className="ss-hamburger sl-hamburger" onClick={onHamburger} aria-label="Open menu">
            <span /><span /><span />
          </button>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>📘</span>
            <span style={styles.logoText}>ProgressHub</span>
          </div>
        </div>

        <div style={styles.right}>
          <button className="ss-iconBtn" title="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          <div className="ss-profile">
            <div className="ss-avatar">{initials}</div>
            <span className="ss-name" style={styles.name}>{studentName}</span>
          </div>
        </div>
      </header>
    </>
  );
};

const styles = {
  navbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px", height: "62px",
    backgroundColor: "#075985",
    borderBottom: "1px solid #0c4a6e",
    position: "sticky", top: 0, zIndex: 100,
    boxShadow: "0 2px 8px rgba(12,45,74,0.15)",
  },
  left: { display: "flex", alignItems: "center", gap: "10px" },
  logo: { display: "flex", alignItems: "center", gap: "10px" },
  logoIcon: { fontSize: "22px" },
  logoText: { fontSize: "18px", fontWeight: "700", color: "#ffffff", letterSpacing: "0.4px" },
  right: { display: "flex", alignItems: "center", gap: "12px" },
  name: { color: "#ffffff", fontSize: "14px", fontWeight: "500" },
};

export default Navbar;