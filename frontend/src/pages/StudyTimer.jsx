
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  BookOpen,
  Coffee,
  ArrowLeft,
} from "lucide-react";
import api from "../services/api";

export default function StudyTimer() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("25");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [status, setStatus] = useState("idle");
  const [startedAt, setStartedAt] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const intervalRef = useRef(null);
  const endTimeRef = useRef(null);
  const startedAtRef = useRef(null);
  const durationRef = useRef(25 * 60);

  useEffect(() => {
    api
      .get("/subjects")
      .then((response) => setSubjects(response.data))
      .catch(() => setError("Unable to load subjects. You can still use the timer."));

    return () => clearInterval(intervalRef.current);
  }, []);

  const stopInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const startTimer = () => {
    setError("");

    if (status === "idle") {
      const totalSeconds = Number(duration) * 60;
      durationRef.current = totalSeconds;
      startedAtRef.current = new Date();
      setStartedAt(startedAtRef.current);
      setSecondsLeft(totalSeconds);
      endTimeRef.current = Date.now() + totalSeconds * 1000;
    } else if (status === "paused") {
      endTimeRef.current = Date.now() + secondsLeft * 1000;
    }

    setStatus("running");
  };

  useEffect(() => {
    if (status !== "running") return;

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((endTimeRef.current - Date.now()) / 1000)
      );

      setSecondsLeft(remaining);

      if (remaining <= 0) {
        stopInterval();
        setStatus("finished");
      }
    }, 250);

    return stopInterval;
  }, [status]);

  const pauseTimer = () => {
    stopInterval();
    setStatus("paused");
  };

  const resetTimer = () => {
    stopInterval();
    setStatus("idle");
    setSecondsLeft(Number(duration) * 60);
    setStartedAt(null);
    startedAtRef.current = null;
    endTimeRef.current = null;
    setError("");
  };

  const changeDuration = (value) => {
    setDuration(value);
    setSecondsLeft(Number(value) * 60);
    durationRef.current = Number(value) * 60;
    setError("");
  };

  const finishSession = async () => {
    if (!startedAtRef.current) {
      setError("Start a timer before saving a study session.");
      return;
    }

    stopInterval();
    setSaving(true);
    setError("");

    const endedAt = new Date();
    const elapsedMinutes = Math.floor(
      (endedAt.getTime() - startedAtRef.current.getTime()) / 60000
    );

    if (elapsedMinutes < 1) {
      setError("Study for at least one minute before saving a session.");
      setSaving(false);
      return;
    }

    try {
      await api.post("/study-sessions", {
        subject: subject || null,
        durationMinutes: elapsedMinutes,
        startedAt: startedAtRef.current.toISOString(),
        endedAt: endedAt.toISOString(),
      });

      setStatus("saved");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not save your session. Please try again."
      );
      setStatus(secondsLeft === 0 ? "finished" : "paused");
    } finally {
      setSaving(false);
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress =
    durationRef.current > 0
      ? ((durationRef.current - secondsLeft) / durationRef.current) * 100
      : 0;

  return (
    <div className="min-h-screen bg-[#F8F7FC] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-violet-700"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </button>

        <div className="mb-8">
          <p className="text-sm font-semibold text-violet-600">
            FOCUS MODE
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Study Session Timer
          </h1>
          <p className="mt-2 text-slate-500">
            Focus on one thing at a time. Every minute counts.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-10">
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Session length
              </label>
              <select
                value={duration}
                disabled={status !== "idle" || saving}
                onChange={(e) => changeDuration(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-violet-500 disabled:bg-slate-100"
              >
                <option value="15">15 minutes</option>
                <option value="25">25 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Subject (optional)
              </label>
              <select
                value={subject}
                disabled={status === "running" || status === "paused" || saving}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-violet-500 disabled:bg-slate-100"
              >
                <option value="">General study</option>
                {subjects.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mx-auto flex max-w-md flex-col items-center text-center">
            <div className="relative flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 240 240">
                <circle
                  cx="120"
                  cy="120"
                  r="108"
                  fill="none"
                  stroke="#F1EEFC"
                  strokeWidth="8"
                />
                <circle
                  cx="120"
                  cy="120"
                  r="108"
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 108}
                  strokeDashoffset={
                    2 * Math.PI * 108 * (1 - Math.min(progress, 100) / 100)
                  }
                  className="transition-all duration-300"
                />
              </svg>

              <div>
                <Clock className="mx-auto mb-3 text-violet-600" size={25} />
                <p className="text-5xl font-bold tabular-nums text-slate-900 sm:text-6xl">
                  {String(minutes).padStart(2, "0")}:
                  {String(seconds).padStart(2, "0")}
                </p>
                <p className="mt-3 text-sm font-medium text-slate-500">
                  {status === "running"
                    ? "Stay focused"
                    : status === "paused"
                      ? "Timer paused"
                      : status === "finished"
                        ? "Time's up!"
                        : status === "saved"
                          ? "Session saved!"
                          : "Ready when you are"}
                </p>
              </div>
            </div>

            {status === "finished" && (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <Coffee size={18} />
                Session complete! Take a short break.
              </div>
            )}

            {status === "saved" && (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 size={18} />
                Your completed study session is saved.
              </div>
            )}

            {error && (
              <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {(status === "idle" ||
                status === "paused" ||
                status === "finished") && (
                <button
                  onClick={startTimer}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700"
                >
                  <Play size={18} />
                  {status === "paused"
                    ? "Resume"
                    : status === "finished"
                      ? "Start again"
                      : "Start focus"}
                </button>
              )}

              {status === "running" && (
                <button
                  onClick={pauseTimer}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-600"
                >
                  <Pause size={18} />
                  Pause
                </button>
              )}

              {status !== "idle" && status !== "saved" && (
                <button
                  onClick={resetTimer}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <RotateCcw size={17} />
                  Reset
                </button>
              )}

              {(status === "running" ||
                status === "paused" ||
                status === "finished") && (
                <button
                  onClick={finishSession}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 size={18} />
                  {saving ? "Saving..." : "Finish & save"}
                </button>
              )}

              {status === "saved" && (
                <button
                  onClick={resetTimer}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700"
                >
                  <RotateCcw size={17} />
                  New session
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-5">
          <h2 className="font-semibold text-violet-900">A little focus tip</h2>
          <p className="mt-2 text-sm leading-6 text-violet-800">
            Put your phone aside, close unnecessary tabs, and work on one task
            during your session. Remember to take breaks between sessions.
          </p>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
          <BookOpen className="mt-1 shrink-0 text-violet-600" size={20} />
          <div>
            <h2 className="font-semibold text-slate-800">
              How study time is recorded
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Only completed sessions of at least one minute are saved. The
              recorded duration is based on elapsed wall-clock time, including
              any time spent paused, so use Finish & save only when you're
              ready to record the session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
