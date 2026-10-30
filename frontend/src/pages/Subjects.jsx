
import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { BookOpen, Plus, Trash2, LoaderCircle } from "lucide-react";

const colors = [
  "#8B5CF6",
  "#0D9488",
  "#F59E0B",
  "#EC4899",
  "#3B82F6",
  "#10B981",
];

export default function Subjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(colors[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchSubjects = async () => {
    try {
      setError("");
      const { data } = await api.get("/subjects");
      setSubjects(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load subjects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      setError("");

      const { data } = await api.post("/subjects", {
        name: name.trim(),
        description: description.trim(),
        color,
      });

      setSubjects((current) => [data, ...current]);
      setName("");
      setDescription("");
      setColor(colors[0]);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create subject.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subject?")) return;

    try {
      setError("");
      await api.delete(`/subjects/${id}`);
      setSubjects((current) => current.filter((subject) => subject._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete subject.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Subjects</h1>
            <p className="text-sm text-slate-500">
              {user?.name ? `${user.name}'s learning space` : "Organize your learning"}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <section className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">
              Add a subject
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Create a space for each topic you're studying.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Subject name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Computer Networks"
                  maxLength={80}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will you study?"
                  rows={3}
                  maxLength={300}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Choose a color
                </label>
                <div className="flex flex-wrap gap-3">
                  {colors.map((item) => (
                    <button
                      key={item}
                      type="button"
                      aria-label={`Choose color ${item}`}
                      onClick={() => setColor(item)}
                      className={`h-8 w-8 rounded-full ${
                        color === item ? "ring-2 ring-offset-2 ring-slate-500" : ""
                      }`}
                      style={{ backgroundColor: item }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
              >
                <Plus size={18} />
                {saving ? "Adding..." : "Add subject"}
              </button>
            </form>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Your subjects
                </h2>
                <p className="text-sm text-slate-500">
                  {subjects.length} {subjects.length === 1 ? "subject" : "subjects"} created
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {error}
                <button
                  onClick={fetchSubjects}
                  className="ml-2 font-semibold underline"
                >
                  Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex items-center gap-2 py-10 text-slate-500">
                <LoaderCircle className="animate-spin" size={20} />
                Loading subjects...
              </div>
            ) : subjects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <BookOpen className="mx-auto text-slate-400" size={36} />
                <h3 className="mt-4 font-semibold text-slate-800">
                  No subjects yet
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Add your first subject using the form.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {subjects.map((subject) => (
                  <article
                    key={subject._id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className="rounded-xl p-3 text-white"
                          style={{ backgroundColor: subject.color }}
                        >
                          <BookOpen size={20} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="break-words font-semibold text-slate-800">
                            {subject.name}
                          </h3>
                          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-500">
                            {subject.description || "No description added."}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(subject._id)}
                        aria-label={`Delete ${subject.name}`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
