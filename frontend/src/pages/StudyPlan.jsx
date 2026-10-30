
import { useState } from "react";
import {
  Sparkles,
  Clock,
  BookOpen,
  Coffee,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";

export default function StudyPlan() {
  const [hours, setHours] = useState("3");
  const [sessions, setSessions] = useState([]);
  const [tips, setTips] = useState([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(false);

  const generatePlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setGenerated(false);

    try {
      const response = await api.post("/study-plan/generate", {
        hours: Number(hours),
      });

      setSessions(response.data.sessions);
      setTips(response.data.tips || []);
      setTotalMinutes(response.data.totalStudyMinutes || 0);
      setGenerated(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to generate your study plan. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes) => {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] p-5 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700">
            <Sparkles size={16} />
            SMART STUDY PLANNER
          </div>

          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Plan your day, <span className="text-violet-600">your way.</span>
          </h1>

          <p className="mt-3 max-w-2xl text-gray-500">
            Create a personalized timetable based on your pending study tasks,
            priorities, and deadlines.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <Clock className="mb-3 text-violet-600" size={24} />
            <p className="text-sm text-gray-500">Available study time</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {hours} hours
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <BookOpen className="mb-3 text-blue-600" size={24} />
            <p className="text-sm text-gray-500">Study sessions</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {sessions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <Coffee className="mb-3 text-amber-600" size={24} />
            <p className="text-sm text-gray-500">Focused study time</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-bold text-gray-900">
            Build your study schedule
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            How much time can you dedicate to studying today?
          </p>

          <form
            onSubmit={generatePlan}
            className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <label
                htmlFor="hours"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Available hours
              </label>

              <select
                id="hours"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none focus:border-violet-500"
              >
                <option value="0.5">30 minutes</option>
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="3">3 hours</option>
                <option value="4">4 hours</option>
                <option value="5">5 hours</option>
                <option value="6">6 hours</option>
                <option value="8">8 hours</option>
                <option value="10">10 hours</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
            >
              {loading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              {loading ? "Creating plan..." : "Generate my plan"}
            </button>
          </form>

          {error && (
            <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {generated && (
          <div>
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-gray-900">
                Your study timetable
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Prioritized using your saved tasks and upcoming deadlines.
              </p>
            </div>

            {sessions.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                <p className="font-semibold text-gray-800">
                  No sessions could be scheduled.
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Try adding more study tasks or increasing your available
                  hours.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session, index) => (
                  <div
                    key={session.id}
                    className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 font-bold text-violet-700">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {session.title}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            session.priority === "High"
                              ? "bg-red-100 text-red-700"
                              : session.priority === "Low"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {session.priority} priority
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-violet-600">
                        {session.subject}
                      </p>

                      <p className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={16} />
                        {formatTime(session.startMinute)} –{" "}
                        {formatTime(session.endMinute)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tips.length > 0 && (
              <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-5 sm:p-6">
                <h3 className="font-bold text-violet-900">
                  Tips for a productive day
                </h3>

                <ul className="mt-3 space-y-2 text-sm text-violet-800">
                  {tips.map((tip, index) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
