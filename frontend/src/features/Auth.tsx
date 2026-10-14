import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { Brand, ErrorMessage } from "../components/UI";
import { api } from "../lib/api";
import { useApp } from "../lib/context";
import type { User } from "../lib/types";
export default function Auth({
  mode,
}: {
  mode: "login" | "register" | "forgot-password" | "reset-password";
}) {
  const { user, setUser, notify } = useApp(),
    nav = useNavigate(),
    [params] = useSearchParams(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [success, setSuccess] = useState("");
  const register = mode === "register",
    recovery = mode === "forgot-password",
    reset = mode === "reset-password";
  if (user && (mode === "login" || register))
    return (
      <Navigate to={user.onboarded ? "/journal" : "/onboarding"} replace />
    );
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (register)
        data.timezone =
          Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Manila";
      if (reset) data.token = params.get("token") || "";
      const r = await api<User & { message: string }>(`/${mode}`, "POST", data);
      if (recovery || reset) {
        setSuccess(r.message);
        if (reset) setUser(null);
      } else {
        setUser(r);
        notify("");
        nav(r.onboarded ? "/journal" : "/onboarding");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <header>
        <Brand />
        <Link to="/" className="inline-link">
          <ArrowLeft size={16} /> Back home
        </Link>
      </header>
      <main id="main" className="auth-layout">
        <aside>
          <p className="eyebrow">A SPACE FOR YOU</p>
          <h1>
            Your body has
            <br />a story.
            <br />
            <em>Get to know it.</em>
          </h1>
          <p>
            A private place for the everyday details.
            <br />
            No perfect record required.
          </p>
          <div className="auth-flower">
            <LockKeyhole size={50} strokeWidth={1} />
          </div>
        </aside>
        <section className="auth-form">
          <p className="eyebrow">
            {register ? "YOUR FIRST PAGE" : "WELCOME TO ALMANAC"}
          </p>
          <h2>
            {register
              ? "Begin your journal."
              : recovery
                ? "A fresh start."
                : reset
                  ? "Choose a new password."
                  : "Good to have you here."}
          </h2>
          <p>
            {register
              ? "A few details, and a space of your own."
              : recovery
                ? "We’ll send a private recovery link to your email."
                : reset
                  ? "Use at least 12 characters."
                  : "Sign in to pick up where you left off."}
          </p>
          {success ? (
            <div className="success" role="status">
              <p>{success}</p>
              <Link className="inline-link" to="/login">
                Return to sign in <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <form onSubmit={submit}>
              <ErrorMessage message={error} />
              {register && (
                <label>
                  Your name
                  <input
                    name="name"
                    autoComplete="given-name"
                    maxLength={80}
                    required
                  />
                </label>
              )}
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={params.get("email") || ""}
                  required
                />
              </label>
              {!recovery && (
                <label>
                  <span id="password-label">Password</span>
                  <input
                    aria-labelledby="password-label"
                    aria-describedby={
                      register || reset ? "password-hint" : undefined
                    }
                    name="password"
                    type="password"
                    autoComplete={
                      register || reset ? "new-password" : "current-password"
                    }
                    minLength={register || reset ? 12 : undefined}
                    required
                  />
                  {(register || reset) && (
                    <small id="password-hint">
                      At least 12 characters. A memorable phrase works well.
                    </small>
                  )}
                </label>
              )}
              {(register || reset) && (
                <label>
                  Confirm password
                  <input
                    name="password_confirmation"
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    required
                  />
                </label>
              )}
              {mode === "login" && (
                <Link className="forgot" to="/forgot-password">
                  Forgot password?
                </Link>
              )}
              {register && (
                <p className="fine-print">
                  By creating an account, you agree to the{" "}
                  <Link to="/terms">Terms</Link> and acknowledge the{" "}
                  <Link to="/privacy">Privacy notice</Link>. This local
                  application is not a medical service.
                </p>
              )}
              <button className="button primary full" disabled={busy}>
                {busy
                  ? "Please wait…"
                  : register
                    ? "Create my journal"
                    : recovery
                      ? "Send recovery link"
                      : reset
                        ? "Update password"
                        : "Sign in"}
                <ArrowRight size={16} />
              </button>
            </form>
          )}
          <p className="auth-switch">
            {register ? "Already have a journal?" : "New to Almanac?"}{" "}
            <Link to={register ? "/login" : "/register"}>
              {register ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
