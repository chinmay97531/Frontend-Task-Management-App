import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config";
import axios from "axios";
import TaskFlowLogo from "../assets/TaskFlow.png";
import imgBoard from "../assets/auth-board.jpg";
import imgTeam from "../assets/auth-team.jpg";
import imgFocus from "../assets/auth-focus.jpg";

const stories = [
  {
    id: "clarity",
    label: "Why you need it",
    title: "Work gets messy without a system",
    body: "Deadlines hide in chats, priorities collide, and nobody is sure what is next. TaskFlow gives you one clear place for every task — so you stop hunting and start finishing.",
    help: "See everything in To Do → Doing → Done, with due dates and labels that keep chaos out of your day.",
    image: imgBoard,
    imageAlt: "TaskFlow board showing tasks moving from to do to done",
  },
  {
    id: "team",
    label: "Work together",
    title: "The right person owns the right work",
    body: "When ownership is unclear, work slows down. Assign teammates, share context, and make progress visible — so handoffs are fast and nothing sits idle.",
    help: "Add assignees, track who is responsible, and keep the whole team aligned without long status meetings.",
    image: imgTeam,
    imageAlt: "Team collaboration view with tasks and assignees",
  },
  {
    id: "speed",
    label: "Move faster",
    title: "Find what matters in seconds",
    body: "Speed comes from focus. Search, filter by priority or due date, and jump straight to the work that needs you now — properly organized, not buried.",
    help: "Use filters and importance flags to cut noise and ship the important work first.",
    image: imgFocus,
    imageAlt: "Focused dashboard with search, filters, and progress",
  },
];

function Auth() {
  const navigate = useNavigate();

  const usernameUpRef = useRef(null);
  const emailUpRef = useRef(null);
  const passwordUpRef = useRef(null);

  const emailInRef = useRef(null);
  const passwordInRef = useRef(null);

  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeStory, setActiveStory] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(() => {
      setActiveStory((prev) => (prev + 1) % stories.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [paused]);

  const story = stories[activeStory];

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const username = usernameUpRef.current.value;
      const email = emailUpRef.current.value;
      const password = passwordUpRef.current.value;
      const response = await axios.post(BACKEND_URL + "/signup", {
        username,
        email,
        password,
      });

      const jwt = response.data.token;
      localStorage.setItem("token", jwt);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const email = emailInRef.current.value;
      const password = passwordInRef.current.value;
      const response = await axios.post(BACKEND_URL + "/signin", {
        email,
        password,
      });

      const jwt = response.data.token;
      localStorage.setItem("token", jwt);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans text-stone-50">
      {/* Product story */}
      <section
        className="relative tf-auth-atmosphere text-white lg:w-[56%] flex flex-col px-6 py-8 sm:px-10 sm:py-12 lg:px-12 lg:py-14 overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="absolute inset-0 tf-auth-grid pointer-events-none" aria-hidden="true" />
        <div
          className="absolute -top-20 -right-10 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl pointer-events-none"
          style={{ animation: "tf-pulse-soft 8s ease-in-out infinite" }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-8 left-1/4 h-56 w-56 rounded-full bg-coral-500/25 blur-3xl pointer-events-none"
          style={{ animation: "tf-pulse-soft 10s ease-in-out infinite 1s" }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col h-full gap-6 lg:gap-7">
          <div className="flex items-center gap-3 sm:gap-4 tf-animate-fade-up">
            <img
              src={TaskFlowLogo}
              alt="TaskFlow"
              className="h-12 w-12 sm:h-14 sm:w-14 object-contain drop-shadow-lg"
            />
            <p className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight bg-gradient-to-r from-teal-300 via-teal-400 to-coral-400 bg-clip-text text-transparent">
              TaskFlow
            </p>
          </div>

          <div className="tf-animate-fade-up tf-delay-1">
            <h1 className="font-display text-2xl sm:text-3xl lg:text-[2.1rem] font-medium leading-snug text-white max-w-xl">
              Manage work properly — faster, clearer, and with less stress.
            </h1>
            <p className="mt-3 max-w-xl text-sm sm:text-base text-stone-100/85 leading-relaxed">
              TaskFlow is built for people who are tired of scattered notes and
              forgotten deadlines. It helps you organize tasks, assign ownership,
              and move work from idea to done — so your day stays productive and
              under control.
            </p>
          </div>

          {/* Interactive story tabs */}
          <div
            className="flex flex-wrap gap-2 tf-animate-fade-up tf-delay-2"
            role="tablist"
            aria-label="How TaskFlow helps"
          >
            {stories.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={activeStory === index}
                onClick={() => setActiveStory(index)}
                className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 border ${
                  activeStory === index
                    ? "bg-white/15 border-teal-300/50 text-white shadow-[0_0_20px_rgba(72,198,239,0.2)] scale-[1.03]"
                    : "bg-white/5 border-white/10 text-stone-300 hover:bg-white/10 hover:text-white hover:border-white/25"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Interactive image + detail panel */}
          <div
            key={story.id}
            className="relative flex-1 min-h-[220px] sm:min-h-[280px] lg:min-h-0 rounded-3xl overflow-hidden border border-white/15 bg-white/5 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.35)] group tf-animate-fade-in"
            role="tabpanel"
          >
            <img
              src={story.image}
              alt={story.imageAlt}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1524] via-[#0f1524]/55 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
              <p className="text-[11px] uppercase tracking-[0.18em] text-teal-300 font-semibold">
                How TaskFlow helps
              </p>
              <h2 className="mt-1.5 font-display text-xl sm:text-2xl font-semibold text-white">
                {story.title}
              </h2>
              <p className="mt-2 text-sm text-stone-100/90 leading-relaxed max-w-lg">
                {story.body}
              </p>
              <p className="mt-2 text-sm text-teal-200/90 leading-relaxed max-w-lg">
                {story.help}
              </p>

              <div className="mt-4 flex items-center gap-2">
                {stories.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Show ${item.label}`}
                    onClick={() => setActiveStory(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeStory === index
                        ? "w-8 bg-gradient-to-r from-teal-300 to-coral-400"
                        : "w-2.5 bg-white/35 hover:bg-white/60"
                    }`}
                  />
                ))}
                <span className="ml-2 text-[11px] text-stone-300/80">
                  {paused ? "Paused — click a topic" : "Auto-playing"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick benefit chips */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 tf-animate-fade-up tf-delay-3">
            {[
              { title: "Properly", desc: "Clear status & ownership" },
              { title: "Fast", desc: "Search & filter instantly" },
              { title: "Good", desc: "Prioritize what matters" },
            ].map((chip) => (
              <div
                key={chip.title}
                className="rounded-2xl border border-white/12 bg-white/8 px-3 py-3 text-center transition-all duration-300 hover:-translate-y-1 hover:border-teal-300/40 hover:bg-white/12 cursor-default"
              >
                <p className="text-sm font-semibold text-teal-200">{chip.title}</p>
                <p className="mt-1 text-[11px] sm:text-xs text-stone-300 leading-snug">
                  {chip.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth form */}
      <section className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10 tf-app-bg">
        <div className="w-full max-w-md tf-animate-slide-in">
          <div className="mb-8 lg:hidden flex items-center gap-3">
            <img src={TaskFlowLogo} alt="" className="h-10 w-10 object-contain" />
            <div>
              <p className="font-display text-2xl font-semibold bg-gradient-to-r from-teal-300 to-coral-400 bg-clip-text text-transparent">
                TaskFlow
              </p>
              <p className="text-sm text-stone-500">Sign in to continue</p>
            </div>
          </div>

          <div className="rounded-3xl tf-glass p-7 sm:p-9 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
            <div className="hidden lg:block mb-6">
              <h2 className="font-display text-2xl font-semibold text-stone-50">
                Welcome back
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Sign in or create an account to start managing work with TaskFlow.
              </p>
            </div>

            <div className="relative flex p-1 rounded-xl bg-white/5 border border-white/10 mb-7">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === "login"
                    ? "bg-white/12 text-teal-300 shadow-sm"
                    : "text-stone-500 hover:text-stone-50"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === "signup"
                    ? "bg-white/12 text-teal-300 shadow-sm"
                    : "text-stone-500 hover:text-stone-50"
                }`}
              >
                Sign up
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-rose-100/40 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 tf-animate-fade-in">
                {error}
              </div>
            )}

            {mode === "login" ? (
              <form
                key="login"
                onSubmit={handleLoginSubmit}
                className="space-y-4 tf-animate-fade-in"
              >
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">
                    Email
                  </label>
                  <input
                    ref={emailInRef}
                    type="email"
                    name="email"
                    placeholder="you@company.com"
                    required
                    className="tf-input w-full h-12 px-4 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">
                    Password
                  </label>
                  <input
                    ref={passwordInRef}
                    type="password"
                    name="pswd"
                    placeholder="Your password"
                    required
                    className="tf-input w-full h-12 px-4 rounded-xl"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="tf-btn-primary w-full h-12 mt-2 rounded-xl font-semibold text-base hover:scale-[1.015]"
                >
                  {loading ? "Signing in..." : "Login"}
                </button>
              </form>
            ) : (
              <form
                key="signup"
                onSubmit={handleSignUpSubmit}
                className="space-y-4 tf-animate-fade-in"
              >
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">
                    Username
                  </label>
                  <input
                    ref={usernameUpRef}
                    type="text"
                    name="txt"
                    placeholder="Choose a username"
                    required
                    className="tf-input w-full h-12 px-4 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">
                    Email
                  </label>
                  <input
                    ref={emailUpRef}
                    type="email"
                    name="email"
                    placeholder="you@company.com"
                    required
                    className="tf-input w-full h-12 px-4 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">
                    Password
                  </label>
                  <input
                    ref={passwordUpRef}
                    type="password"
                    name="pswd"
                    placeholder="Create a password"
                    required
                    className="tf-input w-full h-12 px-4 rounded-xl"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="tf-btn-primary w-full h-12 mt-2 rounded-xl font-semibold text-base hover:scale-[1.015]"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-xs text-stone-500">
              Join TaskFlow and keep your work organized, fast, and on track.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Auth;
