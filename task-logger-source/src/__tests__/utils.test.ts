import { describe, it, expect, vi, afterEach } from "vitest";
import {
  toDateStr,
  addDays,
  dayOfWeek,
  isTaskDue,
  getStreak,
  loadState,
  saveState,
  STORAGE_KEY,
  type Task,
  type AppState,
} from "../utils";

// Helper to build a minimal Task
function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "t1",
    name: "Test task",
    freq: "daily",
    created: "2025-06-09", // Monday
    ...overrides,
  };
}

// ---- toDateStr ----
describe("toDateStr", () => {
  it("formats a known date correctly", () => {
    expect(toDateStr(new Date(2025, 5, 10))).toBe("2025-06-10"); // June 10
  });

  it("zero-pads month and day", () => {
    expect(toDateStr(new Date(2025, 0, 5))).toBe("2025-01-05"); // Jan 5
  });
});

// ---- addDays ----
describe("addDays", () => {
  it("adds positive days", () => {
    expect(addDays("2025-06-10", 3)).toBe("2025-06-13");
  });

  it("adds negative days (goes back)", () => {
    expect(addDays("2025-06-10", -2)).toBe("2025-06-08");
  });

  it("crosses month boundary", () => {
    expect(addDays("2025-01-30", 3)).toBe("2025-02-02");
  });

  it("crosses year boundary", () => {
    expect(addDays("2024-12-31", 1)).toBe("2025-01-01");
  });
});

// ---- dayOfWeek ----
describe("dayOfWeek", () => {
  it("returns 1 for Monday", () => {
    expect(dayOfWeek("2025-06-09")).toBe(1); // known Monday
  });

  it("returns 0 for Sunday", () => {
    expect(dayOfWeek("2025-06-08")).toBe(0); // known Sunday
  });

  it("returns 6 for Saturday", () => {
    expect(dayOfWeek("2025-06-07")).toBe(6); // known Saturday
  });
});

// ---- isTaskDue ----
describe("isTaskDue", () => {
  const monday = "2025-06-09";
  const saturday = "2025-06-07";
  const sunday = "2025-06-08";

  it("daily task is always due", () => {
    const task = makeTask({ freq: "daily" });
    expect(isTaskDue(task, monday)).toBe(true);
    expect(isTaskDue(task, saturday)).toBe(true);
    expect(isTaskDue(task, sunday)).toBe(true);
  });

  it("weekdays task is due Mon–Fri, not on weekends", () => {
    const task = makeTask({ freq: "weekdays" });
    expect(isTaskDue(task, monday)).toBe(true);
    expect(isTaskDue(task, "2025-06-13")).toBe(true); // Friday
    expect(isTaskDue(task, saturday)).toBe(false);
    expect(isTaskDue(task, sunday)).toBe(false);
  });

  it("weekends task is due Sat–Sun, not on weekdays", () => {
    const task = makeTask({ freq: "weekends" });
    expect(isTaskDue(task, saturday)).toBe(true);
    expect(isTaskDue(task, sunday)).toBe(true);
    expect(isTaskDue(task, monday)).toBe(false);
    expect(isTaskDue(task, "2025-06-11")).toBe(false); // Wednesday
  });

  it("weekly task is due only on the same weekday as created", () => {
    // created = 2025-06-09 (Monday)
    const task = makeTask({ freq: "weekly", created: "2025-06-09" });
    expect(isTaskDue(task, monday)).toBe(true); // same day of week
    expect(isTaskDue(task, "2025-06-16")).toBe(true); // next Monday
    expect(isTaskDue(task, "2025-06-10")).toBe(false); // Tuesday
    expect(isTaskDue(task, saturday)).toBe(false);
  });
});

// ---- getStreak ----
describe("getStreak", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 0 when no logs exist", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-10T12:00:00"));
    const state: AppState = {
      tasks: [makeTask({ freq: "daily" })],
      logs: {},
    };
    expect(getStreak(state, "t1")).toBe(0);
  });

  it("returns 0 when task does not exist", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-10T12:00:00"));
    const state: AppState = { tasks: [], logs: {} };
    expect(getStreak(state, "t1")).toBe(0);
  });

  it("counts consecutive days completed today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-10T12:00:00")); // Tuesday
    const state: AppState = {
      tasks: [makeTask({ freq: "daily" })],
      logs: {
        "2025-06-10": { t1: "done" },
        "2025-06-09": { t1: "done" },
        "2025-06-08": { t1: "done" },
      },
    };
    expect(getStreak(state, "t1")).toBe(3);
  });

  it("counts streak from yesterday when today is not logged", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-10T12:00:00"));
    const state: AppState = {
      tasks: [makeTask({ freq: "daily" })],
      logs: {
        "2025-06-09": { t1: "done" },
        "2025-06-08": { t1: "done" },
      },
    };
    expect(getStreak(state, "t1")).toBe(2);
  });

  it("breaks streak on gap", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-10T12:00:00"));
    const state: AppState = {
      tasks: [makeTask({ freq: "daily" })],
      logs: {
        "2025-06-10": { t1: "done" },
        "2025-06-09": { t1: "done" },
        // gap: 2025-06-08 missing
        "2025-06-07": { t1: "done" },
      },
    };
    expect(getStreak(state, "t1")).toBe(2);
  });

  it("skips non-due days for weekdays task", () => {
    vi.useFakeTimers();
    // 2025-06-09 = Monday; streak going back should skip weekend
    vi.setSystemTime(new Date("2025-06-09T12:00:00"));
    const state: AppState = {
      tasks: [makeTask({ freq: "weekdays", created: "2025-01-01" })],
      logs: {
        "2025-06-09": { t1: "done" }, // Monday
        "2025-06-06": { t1: "done" }, // Friday (weekend skipped)
        "2025-06-05": { t1: "done" }, // Thursday
      },
    };
    expect(getStreak(state, "t1")).toBe(3);
  });
});

// ---- loadState / saveState ----
describe("loadState / saveState", () => {
  it("returns default state when storage is empty", () => {
    const state = loadState();
    expect(state).toEqual({ tasks: [], logs: {} });
  });

  it("round-trips state through localStorage", () => {
    const original: AppState = {
      tasks: [makeTask()],
      logs: { "2025-06-10": { t1: "done" } },
    };
    saveState(original);
    const loaded = loadState();
    expect(loaded).toEqual(original);
  });

  it("saves to the correct storage key", () => {
    const state: AppState = { tasks: [], logs: {} };
    saveState(state);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(state));
  });

  it("returns default state when stored JSON is invalid", () => {
    localStorage.setItem(STORAGE_KEY, "not-json{{{");
    const state = loadState();
    expect(state).toEqual({ tasks: [], logs: {} });
  });
});
