import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import {
  BookOpen,
  CalendarDays,
  History,
  Settings,
  LogOut,
  LockKeyhole,
  X,
} from "lucide-react";
import { Brand, ErrorMessage } from "./UI";
import { useApp } from "../lib/context";
import { api } from "../lib/api";
export default function Shell() {
  const { user, loading, error, refresh, setUser, notice, notify } = useApp(),
    nav = useNavigate();
  if (loading)
    return (
      <div className="page-loading" role="status">
        Opening your journal…
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <p className="sidebar-label">YOUR PERSONAL SPACE</p>
        <nav aria-label="Journal navigation">
          {(
            [
              ["/journal", "My journal", "Journal", CalendarDays],
              ["/history", "Cycle history", "History", History],
              ["/learn", "A little knowledge", "Knowledge", BookOpen],
              ["/settings", "Settings", "Settings", Settings],
            ] as const
          ).map(([path, label, mobileLabel, Icon]) => (
            <NavLink key={path} to={path} aria-label={label}>
              <span className="nav-icon" aria-hidden="true">
                <Icon size={20} />
              </span>
              <span className="nav-label-desktop">{label}</span>
              <span className="nav-label-mobile" aria-hidden="true">
                {mobileLabel}
              </span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="private-note">
            <LockKeyhole size={18} />
            <p>
              Just for you.
              <br />
              <span>You control your records.</span>
            </p>
          </div>
          <button
            className="profile-signout"
            aria-label="Sign out"
            onClick={async () => {
              try {
                await api("/logout", "POST");
                setUser(null);
                notify("You have signed out.");
                nav("/login");
              } catch (e) {
                notify((e as Error).message);
              }
            }}
          >
            <span className="avatar">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <span>
              {user.name}
              <small>Sign out</small>
            </span>
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <span>A little more in tune with you.</span>
          <span>
            <LockKeyhole size={13} /> Private journal
          </span>
        </header>
        {notice && (
          <div className="toast" role="status">
            <span>{notice}</span>
            <button
              aria-label="Dismiss message"
              className="icon-button"
              onClick={() => notify("")}
            >
              <X size={16} />
            </button>
          </div>
        )}
        {error && (
          <div className="load-error">
            <ErrorMessage message={error} />
            <button
              className="button secondary"
              onClick={() => refresh().catch(() => {})}
            >
              Try again
            </button>
          </div>
        )}
        <main id="main" className="app-content">
          <Outlet />
        </main>
        <footer className="app-footer">
          Made for awareness, never certainty.{" "}
          <NavLink to="/privacy">Your privacy</NavLink>
        </footer>
      </div>
    </div>
  );
}
