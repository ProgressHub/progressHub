import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .sl-sidebar { display: none !important; }
          .sl-drawer {
            position: fixed; top: 0; left: 0;
            height: 100dvh;
            z-index: 200; transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .sl-drawer.open { transform: translateX(0); }
          .sl-overlay {
            display: none; position: fixed; inset: 0;
            background: rgba(0,0,0,0.4); z-index: 199;
          }
          .sl-overlay.open { display: block; }
          .sl-main { padding: 20px 16px !important; }
        }
        @media (min-width: 769px) {
          .sl-drawer { display: none !important; }
          .sl-overlay { display: none !important; }
          .sl-hamburger { display: none !important; }
        }
      `}</style>

      <div style={styles.root}>
        <Navbar onHamburger={() => setSidebarOpen(true)} />

        <div
          className={`sl-overlay ${sidebarOpen ? "open" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Mobile drawer — isMobile=true so height is 100dvh */}
        <div className={`sl-drawer ${sidebarOpen ? "open" : ""}`}>
          <Sidebar onClose={() => setSidebarOpen(false)} isMobile={true} />
        </div>

        <div style={styles.body}>
          {/* Desktop sidebar — isMobile=false so height is 100% */}
          <div className="sl-sidebar" style={{ height: "100%" }}>
            <Sidebar isMobile={false} />
          </div>

          <main className="sl-main" style={styles.main}>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

const styles = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100dvh",
    backgroundColor: "#eef6ff",
    overflow: "hidden",
  },
  body: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
    height: "calc(100dvh - 62px)",
  },
  main: {
    flex: 1,
    padding: "28px",
    overflowY: "auto",
    height: "100%",
    color: "#0c2d4a",
  },
};

export default StudentLayout;