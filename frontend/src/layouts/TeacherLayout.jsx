// src/layouts/TeacherLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import TeacherSidebar from "../components/teacher/TeacherSidebar";

const TeacherLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .tl-sidebar { display: none !important; }
          .tl-drawer {
            position: fixed; top: 0; left: 0;
            height: 100dvh;
            z-index: 200; transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .tl-drawer.open { transform: translateX(0); }
          .tl-overlay {
            display: none; position: fixed; inset: 0;
            background: rgba(0,0,0,0.4); z-index: 199;
          }
          .tl-overlay.open { display: block; }
          .tl-main { padding: 20px 16px !important; }
        }
        @media (min-width: 769px) {
          .tl-drawer { display: none !important; }
          .tl-overlay { display: none !important; }
          .sl-hamburger { display: none !important; }
        }
      `}</style>

      <div style={styles.root}>
        <Navbar onHamburger={() => setSidebarOpen(true)} />

        <div
          className={`tl-overlay ${sidebarOpen ? "open" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />

        <div className={`tl-drawer ${sidebarOpen ? "open" : ""}`}>
          <TeacherSidebar onClose={() => setSidebarOpen(false)} isMobile={true} />
        </div>

        <div style={styles.body}>
          <div className="tl-sidebar" style={{ height: "100%" }}>
            <TeacherSidebar isMobile={false} />
          </div>

          <main className="tl-main" style={styles.main}>
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

export default TeacherLayout;