
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ListTodo,
  Sparkles,
  CalendarDays,
  ArrowRight,
  LogOut,
  RefreshCw,
  UserRound,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studySessions, setStudySessions] = useState([]);
  const [dailyGoalHours, setDailyGoalHours] = useState(() => {
  const savedGoal = Number(localStorage.getItem("dailyStudyGoal"));
  return [1, 2, 3, 4, 5].includes(savedGoal) ? savedGoal : 2;
});

  const fetchDashboardData = async () => {
    try {
      setError("");

      const [taskResponse, subjectResponse,sessionResponse] = await Promise.all([
        api.get("/tasks"),
        api.get("/subjects"),
        api.get("/study-sessions"),
      ]);

      setTasks(taskResponse.data);
      setSubjects(subjectResponse.data);
      const sessionData=Array.isArray(sessionResponse.data)
      ?sessionResponse.data
      :sessionResponse.data.sessions || [];
      setStudySessions(sessionData);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your dashboard. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const today = new Date();
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const todayTasks = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate);
    return dueDate >= todayStart && dueDate < tomorrowStart;
  });

  const completedTasks = tasks.filter((task) => task.completed);
  const pendingTasks = tasks.filter((task) => !task.completed);
  const studyTasks = tasks.filter((task) => task.type !== "Personal");
  const personalTasks = tasks.filter((task) => task.type === "Personal");

  const completionRate =
    tasks.length > 0
      ? Math.round((completedTasks.length / tasks.length) * 100)
      : 0;

  const upcomingTasks = pendingTasks
    .filter((task) => new Date(task.dueDate) >= todayStart)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const statCards = [
    {
      label: "Today's tasks",
      value: todayTasks.length,
      note: "Tasks due today",
      icon: CalendarDays,
      style: "border-violet-100 bg-violet-50 text-violet-700",
    },
    {
      label: "Tasks completed",
      value: completedTasks.length,
      note: `${completionRate}% of all tasks completed`,
      icon: CheckCircle2,
      style: "border-emerald-100 bg-emerald-50 text-emerald-700",
    },
    {
      label: "Pending tasks",
      value: pendingTasks.length,
      note: "Still waiting for you",
      icon: Clock,
      style: "border-amber-100 bg-amber-50 text-amber-700",
    },
    {
      label: "Study tasks",
      value: studyTasks.length,
      note: `${subjects.length} subjects added`,
      icon: BookOpen,
      style: "border-blue-100 bg-blue-50 text-blue-700",
    },
    {
      label: "Personal activities",
      value: personalTasks.length,
      note: "Make time for yourself too",
      icon: UserRound,
      style: "border-pink-100 bg-pink-50 text-pink-700",
    },
    {
      label: "Total tasks",
      value: tasks.length,
      note: "Your complete task list",
      icon: ListTodo,
      style: "border-indigo-100 bg-indigo-50 text-indigo-700",
    },
  ];
  
  const weeklyStudyData = Array.from({ length: 7 }, (_, index) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (6 - index));

  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);

  const minutes = studySessions
    .filter((session) => {
      const sessionDate = new Date(
        session.startedAt || session.createdAt
      );

      return sessionDate >= date && sessionDate < nextDate;
    })
    .reduce(
      (total, session) =>
        total + Number(session.durationMinutes || 0),
      0
    );

  return {
    day: date.toLocaleDateString("en-US", { weekday: "short" }),
    minutes,
  };
});

const weeklyTotalMinutes = weeklyStudyData.reduce(
  (total, day) => total + day.minutes,
  0
);

const studyDays = new Set(
  studySessions.map((session) =>
    new Date(session.startedAt || session.createdAt).toDateString()
  )
);

let studyStreak = 0;
const streakDate = new Date();
streakDate.setHours(0, 0, 0, 0);

if (!studyDays.has(streakDate.toDateString())) {
  streakDate.setDate(streakDate.getDate() - 1);
}

while (studyDays.has(streakDate.toDateString())) {
  studyStreak++;
  streakDate.setDate(streakDate.getDate() - 1);
}

const todayStudyMinutes = studySessions
  .filter((session) => {
    const sessionDate = new Date(
      session.startedAt || session.createdAt
    );
    return sessionDate.toDateString() === new Date().toDateString();
  })
  .reduce(
    (total, session) =>
      total + Number(session.durationMinutes || 0),
    0
  );

const dailyGoalMinutes = dailyGoalHours * 60;

const dailyGoalProgress = Math.min(
  Math.round((todayStudyMinutes / dailyGoalMinutes) * 100),
  100
);


  return (
    <div className="min-h-screen bg-[#F8F7FC]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div>
            <h1 className="text-xl font-bold text-violet-700">StudySpace</h1>
            <p className="text-sm text-slate-500">
              Your personal study planner
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-violet-600">
              YOUR LEARNING SPACE
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-800">
              Welcome back{user?.name ? `, ${user.name}` : ""}!
            </h2>

            <p className="mt-2 text-slate-500">
              Let's make today a productive and balanced day.
            </p>
          </div>

          <button
            onClick={() => navigate("/study-plan")}
            className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700"
          >
            <Sparkles size={18} />
            Generate study plan
          </button>
        </div>

        {error && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 font-semibold"
            >
              <RefreshCw size={15} />
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="mt-10 rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading your dashboard...
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {statCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border ${card.style}`}
                    >
                      <Icon size={21} />
                    </div>

                    <p className="mt-5 text-sm font-medium text-slate-500">
                      {card.label}
                    </p>

                    <p className="mt-1 text-3xl font-bold text-slate-800">
                      {card.value}
                    </p>

                    <p className="mt-2 text-sm text-slate-400">{card.note}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-5">
              <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
                <h3 className="text-lg font-bold text-slate-800">
                  Your progress
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Every completed task is a step forward.
                </p>

                <div className="mt-6 flex items-end justify-between">
                  <span className="text-4xl font-bold text-violet-700">
                    {completionRate}%
                  </span>
                  <span className="text-sm text-slate-500">
                    {completedTasks.length} of {tasks.length} completed
                  </span>
                </div>

                <div
                  className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-label="Task completion progress"
                  aria-valuenow={completionRate}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-violet-600 transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>

                <p className="mt-4 text-sm text-slate-500">
                  {tasks.length === 0
                    ? "Add your first task to start tracking progress."
                    : completionRate === 100
                      ? "Amazing work! All your tasks are complete."
                      : "Keep going at your own pace. Consistency matters."}
                </p>
              </section>

              <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Upcoming deadlines
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Your next pending tasks
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/tasks")}
                    className="flex shrink-0 items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-800"
                  >
                    All tasks <ArrowRight size={16} />
                  </button>
                </div>

                {upcomingTasks.length === 0 ? (
                  <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center">
                    <CheckCircle2
                      className="mx-auto text-emerald-500"
                      size={28}
                    />
                    <p className="mt-2 font-medium text-slate-700">
                      You're all caught up!
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      No upcoming pending deadlines.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {upcomingTasks.map((task) => (
                      <div
                        key={task._id}
                        className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 p-4"
                      >
                        <div className="min-w-0">
                          <p className="break-words font-semibold text-slate-800">
                            {task.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {task.type === "Personal"
                              ? "Personal activity"
                              : task.subject?.name || "Study task"}
                          </p>
                          <p className="mt-2 text-xs text-slate-400">
                            Due: {new Date(task.dueDate).toLocaleString()}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                            task.priority === "High"
                              ? "bg-red-100 text-red-700"
                              : task.priority === "Low"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>



    
<section className="mt-6 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
  <div className="flex items-center gap-4">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-3xl">
      🔥
    </div>

    <div>
      <p className="text-sm font-medium text-slate-500">
        Current study streak
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-800">
        {studyStreak} {studyStreak === 1 ? "day" : "days"}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        {studyStreak === 0
          ? "Complete a study session to start your streak."
          : "Keep showing up and building consistency!"}
      </p>
    </div>
  </div>
</section>
        

           
<section className="mt-6 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
    <div>
      <p className="text-sm font-semibold text-violet-600">
        DAILY STUDY GOAL
      </p>
      <h3 className="mt-1 text-xl font-bold text-slate-800">
        Make today count
      </h3>
    <p className="mt-1 text-sm text-slate-500">
  Track your progress towards your daily study target.
</p>

<div className="mt-4 flex flex-wrap items-center gap-2">
  <label
    htmlFor="dailyGoal"
    className="text-sm font-medium text-slate-600"
  >
    Daily target:
  </label>

  <select
    id="dailyGoal"
    value={dailyGoalHours}
    onChange={(e) => {
      const hours = Number(e.target.value);
      setDailyGoalHours(hours);
      localStorage.setItem("dailyStudyGoal", String(hours));
    }}
    className="rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm font-medium text-violet-700 outline-none focus:ring-2 focus:ring-violet-300"
  >
    {[1, 2, 3, 4, 5].map((hours) => (
      <option key={hours} value={hours}>
        {hours} {hours === 1 ? "hour" : "hours"}
      </option>
    ))}
  </select>
</div>


    </div>

    <div className="sm:text-right">
      <p className="text-3xl font-bold text-violet-700">
        {Math.floor(
          studySessions
            .filter((session) => {
              const date = new Date(session.startedAt || session.createdAt);
              const today = new Date();
              return date.toDateString() === today.toDateString();
            })
            .reduce(
              (total, session) =>
                total + Number(session.durationMinutes || 0),
              0
            ) / 60
        )}h{" "}
        {studySessions
          .filter((session) => {
            const date = new Date(session.startedAt || session.createdAt);
            const today = new Date();
            return date.toDateString() === today.toDateString();
          })
          .reduce(
            (total, session) =>
              total + Number(session.durationMinutes || 0),
            0
          ) % 60}m
    <span className="text-base font-medium text-slate-400">
  / {dailyGoalHours}h
</span>
      </p>
    </div>
  </div>

  <div className="mt-5 h-3 overflow-hidden rounded-full bg-violet-100">
    <div
      className="h-full rounded-full bg-violet-600 transition-all duration-500"
      style={{
        width: `${Math.min(
          (studySessions
            .filter((session) => {
              const date = new Date(session.startedAt || session.createdAt);
              return date.toDateString() === new Date().toDateString();
            })
            .reduce(
              (total, session) =>
                total + Number(session.durationMinutes || 0),
              0) / (dailyGoalHours * 60)) * 100,
          100
        )}%`,
      }}
    />
  </div>

   <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
    <p className="text-sm font-medium text-slate-600">
      {dailyGoalProgress >= 100
        ? "🎉 Daily study goal achieved! Amazing work."
        : `${dailyGoalMinutes - todayStudyMinutes} minutes left to reach your goal.`}
    </p>

    <span className="text-sm font-semibold text-violet-700">
      {dailyGoalProgress}% complete
    </span>
  </div>
</section>





            <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <div className="flex items-center gap-2">
        <BarChart3 className="text-violet-600" size={22} />
        <h3 className="text-lg font-bold text-slate-800">
          Weekly study progress
        </h3>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Your study time over the last seven days.
      </p>
    </div>

    <div>
      <p className="text-sm text-slate-500">Total this week</p>
      <p className="text-2xl font-bold text-violet-700">
        {Math.floor(weeklyTotalMinutes / 60)}h{" "}
        {weeklyTotalMinutes % 60}m
      </p>
    </div>
  </div>

  <div className="mt-6 h-72 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={weeklyStudyData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" />
        <YAxis
          allowDecimals={false}
          width={45}
          label={{
            value: "Minutes",
            angle: -90,
            position: "insideLeft",
          }}
        />
        <Tooltip
          formatter={(value) => [`${value} minutes`, "Study time"]}
        />
        <Bar
          dataKey="minutes"
          fill="#8B5CF6"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
</section>

            <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800">
                Quick actions
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Jump straight into what you need.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <button
                  onClick={() => navigate("/subjects")}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50"
                >
                  <span>
                    <span className="block font-semibold text-slate-800">
                      Manage subjects
                    </span>
                    <span className="mt-1 block text-sm text-slate-500">
                      Organize your learning
                    </span>
                  </span>
                  <ArrowRight size={18} className="text-violet-600" />
                </button>

                <button
                  onClick={() => navigate("/tasks")}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50"
                >
                  <span>
                    <span className="block font-semibold text-slate-800">
                      Manage tasks
                    </span>
                    <span className="mt-1 block text-sm text-slate-500">
                      Study and personal goals
                    </span>
                  </span>
                  <ArrowRight size={18} className="text-violet-600" />
                </button>

                <button
                  onClick={() => navigate("/study-plan")}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50"
                >
                  <span>
                    <span className="block font-semibold text-slate-800">
                      Study planner
                    </span>
                    <span className="mt-1 block text-sm text-slate-500">
                      Plan your available hours
                    </span>
                  </span>
                  <ArrowRight size={18} className="text-violet-600" />
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
