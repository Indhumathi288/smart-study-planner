
import { useEffect, useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import api from "../services/api";

const initialForm = {
  title: "",
  description: "",
  type: "Study",
  subject: "",
  dueDate: "",
  priority: "Medium",
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("All");

  const fetchData = async () => {
    try {
      setError("");

      const [taskResponse, subjectResponse] = await Promise.all([
        api.get("/tasks"),
        api.get("/subjects"),
      ]);

      setTasks(taskResponse.data);
      setSubjects(subjectResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load tasks. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (e) => {
    setForm({
      ...form,
      type: e.target.value,
      subject: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const taskData = {
        ...form,
        subject: form.type === "Study" ? form.subject : null,
      };

      const response = await api.post("/tasks", taskData);

      setTasks((previous) => [...previous, response.data]);
      setForm(initialForm);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create task. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleTask = async (task) => {
    setError("");

    try {
      const response = await api.put(`/tasks/${task._id}`, {
        completed: !task.completed,
      });

      setTasks((previous) =>
        previous.map((item) =>
          item._id === task._id ? response.data : item
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task.");
    }
  };

  const deleteTask = async (id) => {
    setError("");

    try {
      await api.delete(`/tasks/${id}`);
      setTasks((previous) => previous.filter((task) => task._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete task.");
    }
  };

  const priorityStyle = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-amber-100 text-amber-700",
    Low: "bg-green-100 text-green-700",
  };

  const completedCount = tasks.filter((task) => task.completed).length;
  const filteredTasks = tasks.filter((task) => {
  if (filter === "Study") return task.type !== "Personal";
  if (filter === "Personal") return task.type === "Personal";
  if (filter === "Pending") return !task.completed;
  if (filter === "Completed") return task.completed;
  return true;
});

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FC] p-8 text-gray-500">
        Loading tasks...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FC] p-5 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-violet-600">
            YOUR PRODUCTIVITY SPACE
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            My Tasks
          </h1>

          <p className="mt-2 text-gray-500">
            Balance your studies and personal time, one task at a time.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            <button
              onClick={fetchData}
              className="shrink-0 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-800">
            <Plus size={20} className="text-violet-600" />
            Create a new task
          </h2>

          {subjects.length === 0 && form.type === "Study" && (
            <div className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              You haven't added any subjects yet. Add a subject on the Subjects
              page to create study tasks, or choose Personal activity below.
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Task type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleTypeChange}
                className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none focus:border-violet-500"
              >
                <option value="Study">Study task</option>
                <option value="Personal">Personal activity</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Task title
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder={
                  form.type === "Study"
                    ? "e.g. Revise computer networks"
                    : "e.g. Listen to songs"
                }
                required
                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-violet-500"
              />
            </div>

            {form.type === "Study" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none focus:border-violet-500"
                >
                  <option value="">Choose a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Due date and time
              </label>
              <input
                type="datetime-local"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                min={new Date().toISOString().slice(0, 16)}
                required
                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description (optional)
              </label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Add a short note"
                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none focus:border-violet-500"
              >
                <option value="Low">Low priority</option>
                <option value="Medium">Medium priority</option>
                <option value="High">High priority</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving || (form.type === "Study" && subjects.length === 0)}
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 p-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
            >
              <Plus size={18} />
              {saving ? "Adding task..." : "Add task"}
            </button>
          </form>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-900">Your task list</h2>
          <div className="mb-5 flex flex-wrap gap-2">
  {["All", "Study", "Personal", "Pending", "Completed"].map((item) => (
    <button
      key={item}
      type="button"
      onClick={() => setFilter(item)}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        filter === item
          ? "bg-violet-600 text-white"
          : "border border-gray-200 bg-white text-gray-600 hover:bg-violet-50"
      }`}
    >
      {item}
    </button>
  ))}
</div>

          <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700">
            {completedCount}/{tasks.length} completed
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="font-semibold text-gray-700">No tasks yet</p>
            <p className="mt-2 text-sm text-gray-500">
              Add a study task or a personal activity to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className={`flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:gap-4 sm:p-5 ${
                  task.completed ? "opacity-60" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleTask(task)}
                  aria-label={
                    task.completed ? "Mark incomplete" : "Mark complete"
                  }
                  className="mt-1 shrink-0 text-violet-600"
                >
                  {task.completed ? (
                    <CheckCircle2 size={22} />
                  ) : (
                    <Circle size={22} />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <h3
                    className={`break-words font-semibold text-gray-900 ${
                      task.completed ? "line-through" : ""
                    }`}
                  >
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="mt-1 break-words text-sm text-gray-500">
                      {task.description}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-violet-50 px-3 py-1 text-violet-700">
                      {task.type === "Personal"
                        ? "Personal"
                        : task.subject?.name || "Study"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 ${
                        priorityStyle[task.priority] || priorityStyle.Medium
                      }`}
                    >
                      {task.priority}
                    </span>

                    <span className="text-gray-500">
                      Due: {new Date(task.dueDate).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteTask(task._id)}
                  aria-label="Delete task"
                  className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
