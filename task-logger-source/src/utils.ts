// ---- Types ----
export type Freq = "daily" | "weekly" | "weekdays" | "weekends";

export interface Task {
  id: string;
  name: string;
  freq: Freq;
  created: string;
  totalDuration?: number; // target number of days for the task
}

export interface AppState {
  tasks: Task[];
  logs: Record<string, Record<string, string>>;
}

// ---- Persistence ----
export const STORAGE_KEY = "task_logger_data";

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch {
    // ignore
  }
  return { tasks: [], logs: {} };
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---- Date helpers ----
export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDate(str: string): string {
  const d = new Date(str + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function todayStr(): string {
  return toDateStr(new Date());
}

export function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

export function dayOfWeek(dateStr: string): number {
  return new Date(dateStr + "T00:00:00").getDay();
}

// ---- Task scheduling ----
export function isTaskDue(task: Task, dateStr: string): boolean {
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
export function getStreak(state: AppState, taskId: string): number {
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
