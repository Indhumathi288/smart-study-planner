
import { useEffect, useState } from "react";
import { Clock, BookOpen, CalendarDays, Timer, History } from "lucide-react";
import api from "../services/api";

export default function StudyHistory() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await api.get("/study-sessions");
        setSessions(Array.isArray(response.data) ? response.data : response.data.sessions || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load study sessions."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const totalMinutes = sessions.reduce(
    (total, session) => total + Number(session.durationMinutes || 0),
    0
  );

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) return `${remainingMinutes} min`;
    if (remainingMinutes === 0) return `${hours} hr`;
    return `${hours} hr ${remainingMinutes} min`;
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <main className="min-h-screen bg-violet-50/60 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-violet-600">
            Your progress
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            Study Session History
          </h1>
          <p className="mt-2 text-gray-500">
            Every focused session is a step towards your goals.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <Clock size={22} />
            </div>
            <p className="text-sm text-gray-500">Total study time</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {formatDuration(totalMinutes)}
            </h2>
          </div>

          <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <Timer size={22} />
            </div>
            <p className="text-sm text-gray-500">Completed sessions</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {sessions.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-700">
              <BookOpen size={22} />
            </div>
            <p className="text-sm text-gray-500">Average session</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {sessions.length
                ? formatDuration(Math.round(totalMinutes / sessions.length))
                : "0 min"}
            </h2>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
            <History className="text-violet-600" size={22} />
            <div>
              <h2 className="font-bold text-gray-900">Recent sessions</h2>
              <p className="text-sm text-gray-500">
                Your saved study activity
              </p>
            </div>
          </div>

          {loading ? (
            <p className="p-10 text-center text-gray-500">
              Loading your study history...
            </p>
          ) : error ? (
            <p className="p-10 text-center text-red-600">{error}</p>
          ) : sessions.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <CalendarDays
                size={40}
                className="mx-auto mb-4 text-violet-300"
              />
              <h3 className="font-semibold text-gray-800">
                No study sessions yet
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Complete a session with the Study Timer to see it here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-violet-50/70 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Subject</th>
                    <th className="px-6 py-4 font-semibold">Duration</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sessions.map((session) => (
                    <tr
                      key={session._id}
                      className="transition hover:bg-violet-50/40"
                    >
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {session.subject?.name || "General study"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                        {formatDuration(Number(session.durationMinutes || 0))}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatDate(session.startedAt || session.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
