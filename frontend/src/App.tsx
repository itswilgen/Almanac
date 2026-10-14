import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { Provider } from "./lib/Provider";
import { useApp } from "./lib/context";
import { X } from "lucide-react";
import { ErrorMessage } from "./components/UI";
import Landing from "./features/Landing";
import Auth from "./features/Auth";
import Shell from "./components/Shell";
import Journal from "./features/Journal";
import History from "./features/History";
import Settings from "./features/Settings";
import Learn from "./features/Learn";
import Legal from "./features/Legal";
function PublicFeedback() {
  const { user, notice, notify, error } = useApp();
  if (user) return null;
  return (
    <>
      {notice && (
        <div className="toast public-feedback" role="status">
          <span>{notice}</span>
          <button
            className="icon-button"
            aria-label="Dismiss message"
            onClick={() => notify("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {error && (
        <div className="public-feedback">
          <ErrorMessage message={error} />
          <button
            className="button secondary"
            onClick={() => window.location.reload()}
          >
            Reconnect
          </button>
        </div>
      )}
    </>
  );
}
function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${pathname.includes("journal") ? "Your journal" : pathname.includes("history") ? "Cycle history" : pathname.includes("learn") ? "A little knowledge" : "Your own rhythm"} · Almanac`;
  }, [pathname]);
  return null;
}
function ProtectedSetup() {
  const { user, loading } = useApp();
  return loading ? (
    <p>Opening your journal…</p>
  ) : user ? (
    <Settings onboarding />
  ) : (
    <Navigate to="/login" replace />
  );
}
function LibraryRoute() {
  const { user } = useApp();
  return user ? <Shell /> : <Learn />;
}
export default function App() {
  return (
    <BrowserRouter>
      <Provider>
        <ScrollReset />
        <PublicFeedback />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Routes>
          <Route path="/" element={<Landing />} />
          {(
            ["login", "register", "forgot-password", "reset-password"] as const
          ).map((mode) => (
            <Route
              key={mode}
              path={`/${mode}`}
              element={<Auth key={mode} mode={mode} />}
            />
          ))}
          <Route path="/onboarding" element={<ProtectedSetup />} />
          <Route element={<Shell />}>
            <Route path="/journal" element={<Journal />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route element={<LibraryRoute />}>
            <Route path="/learn" element={<Learn />} />
            <Route path="/learn/:slug" element={<Learn />} />
          </Route>
          <Route path="/privacy" element={<Legal privacy />} />
          <Route path="/terms" element={<Legal />} />
          <Route
            path="*"
            element={
              <main id="main" className="empty-state">
                <h1>This page isn’t in your journal.</h1>
                <a href="/">Return home</a>
              </main>
            }
          />
        </Routes>
      </Provider>
    </BrowserRouter>
  );
}
