import { useState, useCallback } from "react";

// ---- Types ----
type Freq = "daily" | "weekly" | "weekdays" | "weekends";

interface Task {
  id: string;
  name: string;
  freq: Freq;
  created: string;
  totalDuration?: number; // target number of days for the task
}

interface AppState {
  tasks: Task[];
  logs: Record<string, Record<string, string>>;
}

// ---- Persistence ----
const STORAGE_KEY = "task_logger_data";

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch {
    // ignore
  }
  return { tasks: [], logs: {} };
}

function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---- Date helpers ----
function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatDate(str: string): string {
  const d = new Date(str + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function todayStr(): string {
  return toDateStr(new Date());
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

function dayOfWeek(dateStr: string): number {
  return new Date(dateStr + "T00:00:00").getDay();
}

// ---- Task scheduling ----
function isTaskDue(task: Task, dateStr: string): boolean {
  const dow = dayOfWeek(dateStr);
  switch (task.freq) {
    case "daily":
      return true;
    case "weekdays":
      return dow >= 1 && dow <= 5;
    case "weekends":
      return dow === 0 || dow === 6;
    case "weekly":
      return dow === dayOfWeek(task.created.slice(0, 10));
  }
}

// ---- Streak calculation ----
function getStreak(state: AppState, taskId: string): number {
  let streak = 0;
  let d = todayStr();
  const todayLog = state.logs[d];
  if (!todayLog || !todayLog[taskId]) {
    d = addDays(d, -1);
  }
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) break;
    if (!isTaskDue(task, d)) {
      d = addDays(d, -1);
      continue;
    }
    const dayLog = state.logs[d];
    if (dayLog && dayLog[taskId]) {
      streak++;
      d = addDays(d, -1);
    } else {
      break;
    }
  }
  return streak;
}

// ---- Calendar helpers ----
function getMonthDays(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function padDate(y: number, m: number, d: number): string {
  return (
    y +
    "-" +
    String(m + 1).padStart(2, "0") +
    "-" +
    String(d).padStart(2, "0")
  );
}

interface CalCell {
  day: number;
  dateStr: string;
  outside: boolean;
}

function getCalendarGrid(year: number, month: number): CalCell[] {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = getMonthDays(year, month);
  const prevMonthDays =
    month === 0 ? getMonthDays(year - 1, 11) : getMonthDays(year, month - 1);
  const cells: CalCell[] = [];

  for (let i = firstDow - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    cells.push({ day, dateStr: padDate(y, m, day), outside: true });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, dateStr: padDate(year, month, d), outside: false });
  }

  const remaining = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
  for (let d = 1; d <= remaining; d++) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    cells.push({ day: d, dateStr: padDate(y, m, d), outside: true });
  }

  return cells;
}

function getDayCompletionInfo(
  state: AppState,
  dateStr: string
): { logged: number; due: number } {
  const dayLog = state.logs[dateStr];
  if (!dayLog) return { logged: 0, due: 0 };
  const due = state.tasks.filter((t) => isTaskDue(t, dateStr));
  const logged = due.filter((t) => dayLog[t.id]).length;
  const extraLogged = Object.keys(dayLog).filter(
    (id) => !state.tasks.find((t) => t.id === id)
  ).length;
  return { logged: logged + extraLogged, due: due.length };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---- Completion progress ----
function getCompletionProgress(
  state: AppState,
  task: Task
): { logged: number; total: number } | null {
  if (!task.totalDuration) return null;
  const start = task.created.slice(0, 10);
  const endDate = addDays(start, task.totalDuration - 1);
  const today = todayStr();
  const cap = today < endDate ? today : endDate;

  let total = 0;
  let logged = 0;
  let d = start;
  while (d <= cap) {
    if (isTaskDue(task, d)) {
      total++;
      if (state.logs[d]?.[task.id]) logged++;
    }
    d = addDays(d, 1);
  }
  return { logged, total };
}

// ---- Gear icon ----
function GearIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

// ---- Task row shared styles ----
const rowBase =
  "flex items-center gap-3 rounded-[10px] border px-4 py-3 transition-colors";
const rowDone = "border-[#3fb950] bg-[rgba(63,185,80,0.15)]";
const rowDefault = "border-[#30363d] bg-[#161b22] hover:border-[#484f58]";

const checkBase =
  "w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all text-sm cursor-pointer";
const checkDone = "border-[#3fb950] bg-[#3fb950] text-white";
const checkPending =
  "border-[#30363d] bg-transparent text-transparent hover:border-[#3fb950]";

// ---- Main App ----
export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const today = todayStr();
  const todayParts = today.split("-");

  const [selectedDate, setSelectedDate] = useState(today);
  const [manageOpen, setManageOpen] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskFreq, setTaskFreq] = useState<Freq>("daily");
  const [taskDuration, setTaskDuration] = useState("");
  const [calYear, setCalYear] = useState(parseInt(todayParts[0]));
  const [calMonth, setCalMonth] = useState(parseInt(todayParts[1]) - 1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editFreq, setEditFreq] = useState<Freq>("daily");
  const [editDuration, setEditDuration] = useState("");

  const updateState = useCallback((next: AppState) => {
    saveState(next);
    setState(next);
  }, []);

  function toggleLog(taskId: string, dateStr: string) {
    const newLogs = { ...state.logs };
    newLogs[dateStr] = { ...(newLogs[dateStr] ?? {}) };

    if (newLogs[dateStr][taskId]) {
      delete newLogs[dateStr][taskId];
      if (Object.keys(newLogs[dateStr]).length === 0) {
        delete newLogs[dateStr];
      }
    } else {
      if (dateStr === today) {
        const now = new Date();
        newLogs[dateStr][taskId] = now.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else {
        newLogs[dateStr][taskId] = "retroactively";
      }
    }
    updateState({ ...state, logs: newLogs });
  }

  function deleteTask(taskId: string) {
    if (!confirm("Delete this task? History logs will be kept.")) return;
    updateState({
      ...state,
      tasks: state.tasks.filter((t) => t.id !== taskId),
    });
  }

  function addTask(e: React.FormEvent) {
    e.preventDefault();
    const name = taskName.trim();
    if (!name) return;
    const duration = parseInt(taskDuration);
    const newTask: Task = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      freq: taskFreq,
      created: new Date().toISOString(),
      ...(duration > 0 ? { totalDuration: duration } : {}),
    };
    updateState({ ...state, tasks: [...state.tasks, newTask] });
    setTaskName("");
    setTaskDuration("");
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditName(task.name);
    setEditFreq(task.freq);
    setEditDuration(task.totalDuration ? String(task.totalDuration) : "");
  }

  function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    const name = editName.trim();
    if (!name || !editingId) return;
    const duration = parseInt(editDuration);
    updateState({
      ...state,
      tasks: state.tasks.map((t) =>
        t.id === editingId
          ? {
              ...t,
              name,
              freq: editFreq,
              ...(duration > 0 ? { totalDuration: duration } : { totalDuration: undefined }),
            }
          : t
      ),
    });
    setEditingId(null);
  }

  // Calendar navigation
  const now = new Date();
  const canGoNext =
    calYear < now.getFullYear() ||
    (calYear === now.getFullYear() && calMonth < now.getMonth());

  function prevMonth() {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  }

  function nextMonth() {
    if (!canGoNext) return;
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
  }

  // Derived data
  const dueTodayTasks = state.tasks.filter((t) => isTaskDue(t, today));
  const todayLog = state.logs[today] ?? {};
  const grid = getCalendarGrid(calYear, calMonth);
  const monthName = new Date(calYear, calMonth, 1).toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" }
  );
  const dayLog = state.logs[selectedDate] ?? {};
  const isPast = selectedDate <= today;
  const dueDateTasks = isPast
    ? state.tasks.filter((t) => isTaskDue(t, selectedDate))
    : [];
  const knownIds = new Set(state.tasks.map((t) => t.id));
  const deletedEntries = Object.keys(dayLog)
    .filter((id) => !knownIds.has(id))
    .map((id) => ({ id, time: dayLog[id] }));

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-[540px] mx-auto px-4 pb-16">
        {/* Header */}
        <header className="py-6 pb-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[1.6rem] font-bold">Task Logger</h1>
              <p className="text-[#8b949e] text-[0.9rem] mt-1">
                Track your daily routine
              </p>
            </div>
            <button
              type="button"
              onClick={() => setManageOpen(!manageOpen)}
              aria-label="Manage tasks"
              aria-expanded={manageOpen}
              className={`mt-1 p-2 rounded-[10px] border flex items-center justify-center transition-colors flex-shrink-0 ${
                manageOpen
                  ? "text-[#58a6ff] border-[#58a6ff] bg-[#1c2128]"
                  : "text-[#8b949e] border-[#30363d] hover:text-[#e6edf3] hover:border-[#484f58] hover:bg-[#1c2128]"
              }`}
            >
              <GearIcon />
            </button>
          </div>
        </header>

        {/* Today section */}
        <section className="mb-9">
          <h2 className="text-[0.8rem] font-semibold text-[#8b949e] uppercase tracking-[0.04em] mb-3">
            Today{" "}
            <span className="text-[#e6edf3] normal-case tracking-normal text-[0.85rem] font-normal">
              {formatDate(today)}
            </span>
          </h2>
          <div className="flex flex-col gap-1.5">
            {dueTodayTasks.length === 0 && (
              <p className="text-[#8b949e] text-[0.88rem] text-center py-6">
                No tasks yet. Add one below.
              </p>
            )}
            {dueTodayTasks.map((task) => {
              const logEntry = todayLog[task.id];
              const done = !!logEntry;
              const streak = getStreak(state, task.id);
              const progress = getCompletionProgress(state, task);
              const pct = progress
                ? Math.round((progress.logged / Math.max(progress.total, 1)) * 100)
                : null;
              return (
                <div
                  key={task.id}
                  className={`group ${rowBase} ${done ? rowDone : rowDefault}`}
                >
                  <button
                    type="button"
                    title={done ? "Undo" : "Log task"}
                    onClick={() => toggleLog(task.id, today)}
                    className={`${checkBase} ${done ? checkDone : checkPending}`}
                  >
                    ✓
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[0.95rem]">
                      {task.name}
                      {streak >= 2 && (
                        <span className="ml-2 text-[#3fb950] text-[0.72rem] font-semibold">
                          {streak} day streak
                        </span>
                      )}
                    </div>
                    <div className="text-[0.75rem] text-[#8b949e] mt-0.5">
                      {capitalize(task.freq)}
                      {task.totalDuration && (
                        <span className="ml-1.5">· {task.totalDuration}d goal</span>
                      )}
                    </div>
                    {done && (
                      <div className="text-[0.72rem] text-[#3fb950] mt-0.5">
                        Logged {logEntry}
                      </div>
                    )}
                    {progress !== null && pct !== null && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-[#30363d] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: pct >= 100 ? "#3fb950" : "#58a6ff",
                            }}
                          />
                        </div>
                        <span className="text-[0.7rem] text-[#8b949e] tabular-nums w-8 text-right">
                          {pct}%
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    title="Delete task"
                    onClick={() => deleteTask(task.id)}
                    className="text-[#8b949e] hover:text-[#f85149] p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-[1.1rem] leading-none"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Manage Tasks section */}
        {manageOpen && (
          <section className="mb-9">
            <h2 className="text-[0.8rem] font-semibold text-[#8b949e] uppercase tracking-[0.04em] mb-3">
              Manage Tasks
            </h2>

            {/* Existing tasks */}
            {state.tasks.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-4">
                {state.tasks.map((task) =>
                  editingId === task.id ? (
                    <form
                      key={task.id}
                      onSubmit={saveEdit}
                      className="flex gap-2 flex-wrap items-center rounded-[10px] border border-[#58a6ff] bg-[#1c2128] px-3 py-2.5"
                    >
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        autoFocus
                        className="flex-1 min-w-[140px] bg-[#0d1117] border border-[#30363d] rounded-[8px] text-[#e6edf3] px-3 py-1.5 text-[0.88rem] outline-none focus:border-[#58a6ff]"
                      />
                      <select
                        value={editFreq}
                        onChange={(e) => setEditFreq(e.target.value as Freq)}
                        className="bg-[#0d1117] border border-[#30363d] rounded-[8px] text-[#e6edf3] px-3 py-1.5 text-[0.88rem] outline-none focus:border-[#58a6ff]"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="weekdays">Weekdays</option>
                        <option value="weekends">Weekends</option>
                      </select>
                      <input
                        type="number"
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        placeholder="Days goal"
                        min="1"
                        className="w-[110px] bg-[#0d1117] border border-[#30363d] rounded-[8px] text-[#e6edf3] px-3 py-1.5 text-[0.88rem] outline-none focus:border-[#58a6ff]"
                      />
                      <div className="flex gap-1.5">
                        <button
                          type="submit"
                          className="bg-[#58a6ff] hover:bg-[#79c0ff] text-white rounded-[8px] px-3 py-1.5 text-[0.82rem] font-semibold transition-colors border-0 cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="bg-transparent border border-[#30363d] hover:border-[#484f58] text-[#8b949e] hover:text-[#e6edf3] rounded-[8px] px-3 py-1.5 text-[0.82rem] transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div
                      key={task.id}
                      className="group flex items-center gap-3 rounded-[10px] border border-[#30363d] bg-[#161b22] px-4 py-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[0.92rem]">{task.name}</div>
                        <div className="text-[0.73rem] text-[#8b949e] mt-0.5">
                          {capitalize(task.freq)}
                          {task.totalDuration && (
                            <span className="ml-1.5">· {task.totalDuration}d goal</span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        title="Edit task"
                        onClick={() => startEdit(task)}
                        className="text-[#8b949e] hover:text-[#58a6ff] p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        type="button"
                        title="Delete task"
                        onClick={() => deleteTask(task.id)}
                        className="text-[#8b949e] hover:text-[#f85149] p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-[1.1rem] leading-none"
                      >
                        ✕
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Add new task */}
            <form onSubmit={addTask} className="flex gap-2 flex-wrap">
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Task name, e.g. Shoulder stretches"
                required
                className="flex-1 min-w-[180px] bg-[#161b22] border border-[#30363d] rounded-[10px] text-[#e6edf3] px-3.5 py-2.5 text-[0.9rem] outline-none focus:border-[#58a6ff]"
              />
              <select
                value={taskFreq}
                onChange={(e) => setTaskFreq(e.target.value as Freq)}
                className="min-w-[120px] bg-[#161b22] border border-[#30363d] rounded-[10px] text-[#e6edf3] px-3.5 py-2.5 text-[0.9rem] outline-none focus:border-[#58a6ff]"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
              </select>
              <input
                type="number"
                value={taskDuration}
                onChange={(e) => setTaskDuration(e.target.value)}
                placeholder="Days (optional)"
                min="1"
                className="w-[130px] bg-[#161b22] border border-[#30363d] rounded-[10px] text-[#e6edf3] px-3.5 py-2.5 text-[0.9rem] outline-none focus:border-[#58a6ff]"
              />
              <button
                type="submit"
                className="bg-[#58a6ff] hover:bg-[#79c0ff] text-white rounded-[10px] px-[18px] py-2.5 text-[0.85rem] font-semibold transition-colors border-0 cursor-pointer"
              >
                Add Task
              </button>
            </form>
          </section>
        )}

        {/* History section */}
        <section className="mb-9">
          <h2 className="text-[0.8rem] font-semibold text-[#8b949e] uppercase tracking-[0.04em] mb-3">
            History
          </h2>

          {/* Calendar nav */}
          <div className="flex items-center gap-3 mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="w-9 h-9 flex items-center justify-center bg-[#161b22] border border-[#30363d] rounded-[10px] text-[#e6edf3] hover:border-[#58a6ff] transition-colors cursor-pointer text-base"
            >
              ←
            </button>
            <span className="text-[0.9rem] font-semibold min-w-[140px] text-center">
              {monthName}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              disabled={!canGoNext}
              className="w-9 h-9 flex items-center justify-center bg-[#161b22] border border-[#30363d] rounded-[10px] text-[#e6edf3] hover:border-[#58a6ff] transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-base"
            >
              →
            </button>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="text-[0.68rem] text-[#8b949e] text-center py-1 font-semibold uppercase"
              >
                {d}
              </div>
            ))}
            {grid.map((cell) => {
              const isToday = cell.dateStr === today;
              const isSelected = cell.dateStr === selectedDate;
              const isFuture = cell.dateStr > today;
              const info =
                !cell.outside && !isFuture
                  ? getDayCompletionInfo(state, cell.dateStr)
                  : null;

              let cellClass =
                "aspect-square flex flex-col items-center justify-center rounded-lg text-[0.82rem] border transition-colors ";
              if (cell.outside) {
                cellClass +=
                  "text-[#8b949e] opacity-35 pointer-events-none border-transparent";
              } else if (isFuture) {
                cellClass +=
                  "opacity-30 pointer-events-none border-transparent text-[#e6edf3]";
              } else if (isSelected) {
                cellClass += "bg-[#58a6ff] text-white border-[#58a6ff] cursor-pointer";
              } else if (isToday) {
                cellClass +=
                  "border-[#58a6ff] font-bold text-[#e6edf3] hover:bg-[#1c2128] cursor-pointer";
              } else {
                cellClass +=
                  "border-transparent text-[#e6edf3] hover:bg-[#1c2128] cursor-pointer";
              }

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  disabled={cell.outside || isFuture}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={cellClass}
                >
                  <span>{cell.day}</span>
                  {info && info.logged > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected
                            ? info.logged < info.due
                              ? "bg-white/50"
                              : "bg-white"
                            : info.logged < info.due
                              ? "bg-[#8b949e]"
                              : "bg-[#3fb950]"
                        }`}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Day detail */}
          <div>
            <h3 className="text-[0.85rem] text-[#8b949e] font-medium mb-2">
              {formatDate(selectedDate)}
            </h3>
            <div className="flex flex-col gap-1.5">
              {dueDateTasks.length === 0 && deletedEntries.length === 0 && (
                <p className="text-[#8b949e] text-[0.88rem] text-center py-6">
                  No logs for this day.
                </p>
              )}
              {dueDateTasks.map((task) => {
                const logEntry = dayLog[task.id];
                const done = !!logEntry;
                const progress = getCompletionProgress(state, task);
                const pct = progress
                  ? Math.round((progress.logged / Math.max(progress.total, 1)) * 100)
                  : null;
                return (
                  <div
                    key={task.id}
                    className={`${rowBase} ${done ? rowDone : rowDefault}`}
                  >
                    <button
                      type="button"
                      title={done ? "Undo" : "Log task"}
                      onClick={() => toggleLog(task.id, selectedDate)}
                      className={`${checkBase} ${done ? checkDone : checkPending}`}
                    >
                      ✓
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[0.95rem]">
                        {task.name}
                      </div>
                      <div className="text-[0.75rem] text-[#8b949e] mt-0.5">
                        {capitalize(task.freq)}
                        {task.totalDuration && (
                          <span className="ml-1.5">· {task.totalDuration}d goal</span>
                        )}
                      </div>
                      {done && (
                        <div className="text-[0.72rem] text-[#3fb950] mt-0.5">
                          Logged {logEntry}
                        </div>
                      )}
                      {progress !== null && pct !== null && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-1 bg-[#30363d] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: pct >= 100 ? "#3fb950" : "#58a6ff",
                              }}
                            />
                          </div>
                          <span className="text-[0.7rem] text-[#8b949e] tabular-nums w-8 text-right">
                            {pct}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {deletedEntries.map(({ id, time }) => (
                <div key={id} className={`${rowBase} ${rowDone}`}>
                  <button
                    type="button"
                    disabled
                    className={`${checkBase} ${checkDone} cursor-default`}
                  >
                    ✓
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[0.95rem]">
                      (deleted task)
                    </div>
                    <div className="text-[0.72rem] text-[#3fb950] mt-0.5">
                      Logged {time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
