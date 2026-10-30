
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, CheckCircle2, Circle } from "lucide-react";
import api from "../services/api";

export default function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
const [taskFilter, setTaskFilter] = useState("All");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get("/tasks");
        setTasks(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load tasks.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  
const selectedTasks = tasks.filter((task) => {
  const matchesDate = sameDay(new Date(task.dueDate), selectedDate);

  const matchesSearch = task.title
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  const matchesType =
    taskFilter === "All" ||
    (taskFilter === "Study" && task.type !== "Personal") ||
    (taskFilter === "Personal" && task.type === "Personal") ||
    (taskFilter === "Pending" && !task.completed) ||
    (taskFilter === "Completed" && task.completed);

  return matchesDate && matchesSearch && matchesType;
});


  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const calendarDays = [
    ...Array(firstDay.getDay()).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const changeMonth = (offset) => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + offset,
        1
      )
    );
  };

  const hasTaskOnDay = (day) =>
    day !== null &&
    tasks.some((task) =>
      sameDay(
        new Date(task.dueDate),
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      )
    );

  const isSelectedDay = (day) =>
    day !== null &&
    sameDay(
      selectedDate,
      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    );

  const formatDate = (date) =>
    date.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <main className="min-h-screen bg-violet-50/60 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
            Plan your time
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Task Calendar
          </h1>
          <p className="mt-2 text-gray-500">
            See your study deadlines and personal activities at a glance.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow-sm">
            Loading calendar...
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white p-8 text-center text-red-600 shadow-sm">
            {error}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-5">
            <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm lg:col-span-3 sm:p-6">
              <div className="mb-6 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-gray-800">
                  {currentMonth.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>

                <div className="flex gap-2">
                  <button
                    onClick={() => changeMonth(-1)}
                    aria-label="Previous month"
                    className="rounded-lg border border-gray-200 p-2 hover:bg-violet-50"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => changeMonth(1)}
                    aria-label="Next month"
                    className="rounded-lg border border-gray-200 p-2 hover:bg-violet-50"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="py-2 text-xs font-semibold text-gray-400 sm:text-sm"
                    >
                      {day}
                    </div>
                  )
                )}

                {calendarDays.map((day, index) => {
                  const date =
                    day === null
                      ? null
                      : new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth(),
                          day
                        );

                  const isToday = date && sameDay(date, new Date());

                  return (
                    <button
                      key={`${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${index}`}
                      disabled={day === null}
                      onClick={() => setSelectedDate(date)}
                      className={`relative flex min-h-10 flex-col items-center justify-center rounded-xl text-sm transition sm:min-h-12 ${
                        day === null
                          ? "invisible"
                          : isSelectedDay(day)
                            ? "bg-violet-600 font-semibold text-white"
                            : isToday
                              ? "border border-violet-300 font-semibold text-violet-700"
                              : "text-gray-700 hover:bg-violet-50"
                      }`}
                    >
                      {day}
                      {hasTaskOnDay(day) && (
                        <span
                          className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                            isSelectedDay(day) ? "bg-white" : "bg-fuchsia-500"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap gap-4 border-t border-gray-100 pt-4 text-xs text-gray-500">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-500" />
                  Has tasks
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full border border-violet-400" />
                  Today
                </span>
              </div>
            </section>

            <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm lg:col-span-2 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
                  <CalendarDays size={22} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">
                    Tasks for the day
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatDate(selectedDate)}
                  </p>
                </div>
                
<div className="mt-5 space-y-3">
  <input
    type="text"
    placeholder="Search tasks..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
  />

  <select
    value={taskFilter}
    onChange={(e) => setTaskFilter(e.target.value)}
    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400"
  >
    <option value="All">All tasks</option>
    <option value="Study">Study tasks</option>
    <option value="Personal">Personal activities</option>
    <option value="Pending">Pending tasks</option>
    <option value="Completed">Completed tasks</option>
  </select>
</div>

              </div>

              {selectedTasks.length === 0 ? (
                <div className="mt-6 rounded-xl bg-violet-50/70 p-6 text-center">
                  <CalendarDays
                    size={30}
                    className="mx-auto text-violet-300"
                  />
                  <p className="mt-3 font-semibold text-gray-700">
                    Nothing scheduled
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Select another date to see its tasks.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {selectedTasks.map((task) => (
                    <div
                      key={task._id}
                      className="rounded-xl border border-gray-100 p-4"
                    >
                      <div className="flex items-start gap-3">
                        {task.completed ? (
                          <CheckCircle2
                            size={19}
                            className="mt-0.5 shrink-0 text-emerald-500"
                          />
                        ) : (
                          <Circle
                            size={19}
                            className="mt-0.5 shrink-0 text-violet-400"
                          />
                        )}

                        <div className="min-w-0 flex-1">
                          <p
                            className={`break-words font-semibold ${
                              task.completed
                                ? "text-gray-400 line-through"
                                : "text-gray-800"
                            }`}
                          >
                            {task.title}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {task.type === "Personal"
                              ? "Personal activity"
                              : task.subject?.name || "Study task"}
                          </p>
                          <span
                            className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                              task.completed
                                ? "bg-emerald-50 text-emerald-700"
                                : task.priority === "High"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {task.completed ? "Completed" : task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
