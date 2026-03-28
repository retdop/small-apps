import { useState, useCallback, useRef } from "react";

// ---- Types ----
interface Focus {
  id: string;
  name: string;
  type: "strength" | "flexibility";
}

interface Exercise {
  id: string;
  name: string;
  focusId: string;
}

interface SessionEntry {
  focusId: string;
  exerciseId: string;
  done: boolean;
}

interface TrainingSession {
  id: string;
  date: string;
  entries: SessionEntry[];
}

interface AppState {
  focuses: Focus[];
  exercises: Exercise[];
  sessions: TrainingSession[];
}

// ---- Persistence ----
const STORAGE_KEY = "routine_tracker_data";

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch {
    // ignore
  }
  return { focuses: [], exercises: [], sessions: [] };
}

function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function todayStr(): string {
  return toDateStr(new Date());
}

function formatDate(str: string): string {
  const d = new Date(str + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ---- Tab type ----
type Tab = "plan" | "library" | "history";

// ---- Shared styles ----
const btnPrimary =
  "bg-[#58a6ff] hover:bg-[#79c0ff] text-white rounded-[10px] px-4 py-2.5 text-[0.85rem] font-semibold transition-colors border-0 cursor-pointer";
const btnDanger =
  "text-[#8b949e] hover:text-[#f85149] p-1 rounded transition-colors text-[1.1rem] leading-none cursor-pointer";
const inputClass =
  "bg-[#161b22] border border-[#30363d] rounded-[10px] text-[#e6edf3] px-3.5 py-2.5 text-[0.9rem] outline-none focus:border-[#58a6ff]";
const cardClass =
  "rounded-[10px] border border-[#30363d] bg-[#161b22] px-4 py-3";
const sectionTitle =
  "text-[0.8rem] font-semibold text-[#8b949e] uppercase tracking-[0.04em] mb-3";

// ---- Main App ----
export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [tab, setTab] = useState<Tab>("plan");
  const importFileRef = useRef<HTMLInputElement>(null);

  const update = useCallback((next: AppState) => {
    saveState(next);
    setState(next);
  }, []);

  function exportData() {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `routine-tracker-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as AppState;
        if (!Array.isArray(parsed.focuses) || !Array.isArray(parsed.exercises) || !Array.isArray(parsed.sessions)) {
          alert("Invalid file: not a valid Routine Tracker export.");
          return;
        }
        if (!confirm("This will replace all current data. Continue?")) return;
        update(parsed);
      } catch {
        alert("Failed to read file. Make sure it is a valid JSON export.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-[600px] mx-auto px-4 pb-16">
        <header className="py-6 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[1.6rem] font-bold">Routine Tracker</h1>
              <p className="text-[#8b949e] text-[0.9rem] mt-1">
                Plan and track your strength &amp; mobility training
              </p>
            </div>
            <div className="flex gap-1.5 mt-1 flex-shrink-0">
              <button
                type="button"
                onClick={exportData}
                className="bg-transparent border border-[#30363d] hover:border-[#484f58] text-[#8b949e] hover:text-[#e6edf3] rounded-[8px] px-3 py-1.5 text-[0.82rem] transition-colors cursor-pointer"
              >
                Export
              </button>
              <button
                type="button"
                onClick={() => importFileRef.current?.click()}
                className="bg-transparent border border-[#30363d] hover:border-[#484f58] text-[#8b949e] hover:text-[#e6edf3] rounded-[8px] px-3 py-1.5 text-[0.82rem] transition-colors cursor-pointer"
              >
                Import
              </button>
              <input
                ref={importFileRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImport}
                className="hidden"
                aria-hidden="true"
              />
            </div>
          </div>
        </header>

        {/* Tab bar */}
        <nav className="flex gap-1 mb-6 bg-[#161b22] rounded-[10px] p-1 border border-[#30363d]">
          {(["plan", "library", "history"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-[0.85rem] font-semibold rounded-lg transition-colors cursor-pointer border-0 ${
                tab === t
                  ? "bg-[#58a6ff] text-white"
                  : "text-[#8b949e] hover:text-[#e6edf3]"
              }`}
            >
              {t === "plan" ? "Plan" : t === "library" ? "Library" : "History"}
            </button>
          ))}
        </nav>

        {tab === "library" && <LibraryTab state={state} update={update} />}
        {tab === "plan" && <PlanTab state={state} update={update} />}
        {tab === "history" && <HistoryTab state={state} update={update} />}
      </div>
    </div>
  );
}

// ============================================================
// LIBRARY TAB — manage focuses and exercises
// ============================================================
function LibraryTab({
  state,
  update,
}: {
  state: AppState;
  update: (s: AppState) => void;
}) {
  const [focusName, setFocusName] = useState("");
  const [focusType, setFocusType] = useState<Focus["type"]>("strength");
  const [exerciseInputs, setExerciseInputs] = useState<Record<string, string>>(
    {}
  );
  const [expandedFocus, setExpandedFocus] = useState<string | null>(null);

  function addFocus(e: React.FormEvent) {
    e.preventDefault();
    const name = focusName.trim();
    if (!name) return;
    const newFocus: Focus = { id: genId(), name, type: focusType };
    update({ ...state, focuses: [...state.focuses, newFocus] });
    setFocusName("");
    setExpandedFocus(newFocus.id);
  }

  function deleteFocus(id: string) {
    if (!confirm("Delete this focus and all its exercises?")) return;
    update({
      ...state,
      focuses: state.focuses.filter((f) => f.id !== id),
      exercises: state.exercises.filter((ex) => ex.focusId !== id),
      sessions: state.sessions.map((s) => ({
        ...s,
        entries: s.entries.filter((e) => e.focusId !== id),
      })),
    });
  }

  function addExercise(focusId: string) {
    const name = (exerciseInputs[focusId] ?? "").trim();
    if (!name) return;
    const newEx: Exercise = { id: genId(), name, focusId };
    update({ ...state, exercises: [...state.exercises, newEx] });
    setExerciseInputs({ ...exerciseInputs, [focusId]: "" });
  }

  function deleteExercise(exId: string) {
    update({
      ...state,
      exercises: state.exercises.filter((ex) => ex.id !== exId),
      sessions: state.sessions.map((s) => ({
        ...s,
        entries: s.entries.filter((e) => e.exerciseId !== exId),
      })),
    });
  }

  return (
    <div>
      {/* Add focus */}
      <section className="mb-8">
        <h2 className={sectionTitle}>Add Focus</h2>
        <form onSubmit={addFocus} className="flex gap-2 flex-wrap">
          <input
            type="text"
            value={focusName}
            onChange={(e) => setFocusName(e.target.value)}
            placeholder="e.g. Chest Strength"
            required
            className={`flex-1 min-w-[160px] ${inputClass}`}
          />
          <select
            value={focusType}
            onChange={(e) => setFocusType(e.target.value as Focus["type"])}
            className={`min-w-[130px] ${inputClass}`}
          >
            <option value="strength">Strength</option>
            <option value="flexibility">Flexibility</option>
          </select>
          <button type="submit" className={btnPrimary}>
            Add Focus
          </button>
        </form>
      </section>

      {/* Focus list */}
      <section>
        <h2 className={sectionTitle}>
          Focuses &amp; Exercises ({state.focuses.length})
        </h2>
        {state.focuses.length === 0 && (
          <p className="text-[#8b949e] text-[0.88rem] text-center py-6">
            No focuses yet. Add one above to get started.
          </p>
        )}
        <div className="flex flex-col gap-3">
          {state.focuses.map((focus) => {
            const exercises = state.exercises.filter(
              (ex) => ex.focusId === focus.id
            );
            const isExpanded = expandedFocus === focus.id;
            return (
              <div key={focus.id} className={cardClass}>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedFocus(isExpanded ? null : focus.id)
                    }
                    className="text-[#8b949e] text-[0.8rem] cursor-pointer border-0 bg-transparent p-0"
                  >
                    {isExpanded ? "▼" : "▶"}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-[0.95rem]">
                      {focus.name}
                    </span>
                    <span
                      className={`ml-2 text-[0.72rem] font-semibold px-2 py-0.5 rounded-full ${
                        focus.type === "strength"
                          ? "bg-[rgba(136,82,255,0.2)] text-[#b392f0]"
                          : "bg-[rgba(63,185,80,0.15)] text-[#3fb950]"
                      }`}
                    >
                      {focus.type}
                    </span>
                    <span className="ml-2 text-[0.75rem] text-[#8b949e]">
                      {exercises.length} exercise
                      {exercises.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteFocus(focus.id)}
                    title="Delete focus"
                    className={btnDanger}
                  >
                    ✕
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-3 ml-6">
                    {exercises.map((ex) => (
                      <div
                        key={ex.id}
                        className="flex items-center gap-2 py-1.5 group"
                      >
                        <span className="text-[0.88rem] flex-1">{ex.name}</span>
                        <button
                          type="button"
                          onClick={() => deleteExercise(ex.id)}
                          title="Remove exercise"
                          className="text-[#8b949e] hover:text-[#f85149] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-0 bg-transparent p-0 text-[0.9rem]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={exerciseInputs[focus.id] ?? ""}
                        onChange={(e) =>
                          setExerciseInputs({
                            ...exerciseInputs,
                            [focus.id]: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addExercise(focus.id);
                          }
                        }}
                        placeholder="New exercise name"
                        className={`flex-1 text-[0.85rem] py-2 ${inputClass}`}
                      />
                      <button
                        type="button"
                        onClick={() => addExercise(focus.id)}
                        className="bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] rounded-[10px] px-3 py-2 text-[0.82rem] font-semibold transition-colors border border-[#30363d] cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ============================================================
// PLAN TAB — create/edit a training session for a date
// ============================================================
function PlanTab({
  state,
  update,
}: {
  state: AppState;
  update: (s: AppState) => void;
}) {
  const today = todayStr();
  const [planDate, setPlanDate] = useState(today);
  const existingSession = state.sessions.find((s) => s.date === planDate);

  // Which focuses are selected for this session
  const [selectedFocusIds, setSelectedFocusIds] = useState<Set<string>>(
    () => new Set(existingSession?.entries.map((e) => e.focusId) ?? [])
  );
  // Which exercise is chosen per focus
  const [chosenExercises, setChosenExercises] = useState<
    Record<string, string>
  >(() => {
    const map: Record<string, string> = {};
    existingSession?.entries.forEach((e) => {
      map[e.focusId] = e.exerciseId;
    });
    return map;
  });

  // Sync when date changes
  function changeDate(newDate: string) {
    setPlanDate(newDate);
    const session = state.sessions.find((s) => s.date === newDate);
    if (session) {
      setSelectedFocusIds(new Set(session.entries.map((e) => e.focusId)));
      const map: Record<string, string> = {};
      session.entries.forEach((e) => {
        map[e.focusId] = e.exerciseId;
      });
      setChosenExercises(map);
    } else {
      setSelectedFocusIds(new Set());
      setChosenExercises({});
    }
  }

  function toggleFocus(focusId: string) {
    const next = new Set(selectedFocusIds);
    if (next.has(focusId)) {
      next.delete(focusId);
      const ex = { ...chosenExercises };
      delete ex[focusId];
      setChosenExercises(ex);
    } else {
      next.add(focusId);
    }
    setSelectedFocusIds(next);
  }

  function chooseExercise(focusId: string, exerciseId: string) {
    setChosenExercises({ ...chosenExercises, [focusId]: exerciseId });
  }

  function saveSession() {
    const entries: SessionEntry[] = [];
    for (const focusId of selectedFocusIds) {
      const exId = chosenExercises[focusId];
      if (exId) {
        entries.push({ focusId, exerciseId: exId, done: false });
      }
    }
    if (entries.length === 0) return;

    if (existingSession) {
      // Preserve done status for unchanged entries
      const updatedEntries = entries.map((e) => {
        const prev = existingSession.entries.find(
          (p) => p.focusId === e.focusId && p.exerciseId === e.exerciseId
        );
        return prev ? { ...e, done: prev.done } : e;
      });
      update({
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === existingSession.id
            ? { ...s, entries: updatedEntries }
            : s
        ),
      });
    } else {
      const session: TrainingSession = {
        id: genId(),
        date: planDate,
        entries,
      };
      update({ ...state, sessions: [...state.sessions, session] });
    }
  }

  function toggleDone(focusId: string, exerciseId: string) {
    if (!existingSession) return;
    update({
      ...state,
      sessions: state.sessions.map((s) =>
        s.id === existingSession.id
          ? {
              ...s,
              entries: s.entries.map((e) =>
                e.focusId === focusId && e.exerciseId === exerciseId
                  ? { ...e, done: !e.done }
                  : e
              ),
            }
          : s
      ),
    });
  }

  function deleteSession() {
    if (!existingSession) return;
    if (!confirm("Delete this training session?")) return;
    update({
      ...state,
      sessions: state.sessions.filter((s) => s.id !== existingSession.id),
    });
    setSelectedFocusIds(new Set());
    setChosenExercises({});
  }

  const allComplete =
    existingSession &&
    existingSession.entries.length > 0 &&
    existingSession.entries.every((e) => e.done);

  // Check if current plan differs from saved session
  const hasUnsavedChanges = (() => {
    const entries: { focusId: string; exerciseId: string }[] = [];
    for (const focusId of selectedFocusIds) {
      const exId = chosenExercises[focusId];
      if (exId) entries.push({ focusId, exerciseId: exId });
    }
    if (!existingSession) return entries.length > 0;
    if (entries.length !== existingSession.entries.length) return true;
    return entries.some(
      (e) =>
        !existingSession.entries.find(
          (p) => p.focusId === e.focusId && p.exerciseId === e.exerciseId
        )
    );
  })();

  if (state.focuses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#8b949e] text-[0.95rem] mb-2">
          No focuses defined yet.
        </p>
        <p className="text-[#8b949e] text-[0.85rem]">
          Go to the <strong>Library</strong> tab to add focuses and exercises
          first.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Date picker */}
      <section className="mb-6">
        <h2 className={sectionTitle}>Training Date</h2>
        <input
          type="date"
          value={planDate}
          onChange={(e) => changeDate(e.target.value)}
          className={`${inputClass} w-full`}
        />
      </section>

      {/* If session exists, show workout view */}
      {existingSession && !hasUnsavedChanges && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className={sectionTitle + " mb-0"}>
              Workout{" "}
              {allComplete && (
                <span className="text-[#3fb950] normal-case">— Complete!</span>
              )}
            </h2>
            <button
              type="button"
              onClick={deleteSession}
              className="text-[#8b949e] hover:text-[#f85149] text-[0.78rem] cursor-pointer border-0 bg-transparent"
            >
              Delete session
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {existingSession.entries.map((entry) => {
              const focus = state.focuses.find(
                (f) => f.id === entry.focusId
              );
              const exercise = state.exercises.find(
                (ex) => ex.id === entry.exerciseId
              );
              if (!focus || !exercise) return null;
              return (
                <div
                  key={entry.focusId + entry.exerciseId}
                  className={`flex items-center gap-3 rounded-[10px] border px-4 py-3 transition-colors ${
                    entry.done
                      ? "border-[#3fb950] bg-[rgba(63,185,80,0.15)]"
                      : "border-[#30363d] bg-[#161b22] hover:border-[#484f58]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleDone(entry.focusId, entry.exerciseId)
                    }
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all text-sm cursor-pointer ${
                      entry.done
                        ? "border-[#3fb950] bg-[#3fb950] text-white"
                        : "border-[#30363d] bg-transparent text-transparent hover:border-[#3fb950]"
                    }`}
                  >
                    ✓
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[0.95rem]">
                      {exercise.name}
                    </div>
                    <div className="text-[0.75rem] text-[#8b949e] mt-0.5">
                      {focus.name}
                      <span
                        className={`ml-2 text-[0.68rem] font-semibold px-1.5 py-0.5 rounded-full ${
                          focus.type === "strength"
                            ? "bg-[rgba(136,82,255,0.2)] text-[#b392f0]"
                            : "bg-[rgba(63,185,80,0.15)] text-[#3fb950]"
                        }`}
                      >
                        {focus.type}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Focus picker */}
      <section className="mb-6">
        <h2 className={sectionTitle}>
          {existingSession && !hasUnsavedChanges
            ? "Edit Plan"
            : "Select Focuses"}
        </h2>
        <div className="flex flex-col gap-2">
          {state.focuses.map((focus) => {
            const selected = selectedFocusIds.has(focus.id);
            const exercises = state.exercises.filter(
              (ex) => ex.focusId === focus.id
            );
            const chosen = chosenExercises[focus.id];
            return (
              <div key={focus.id} className={cardClass}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleFocus(focus.id)}
                    className="w-5 h-5 accent-[#58a6ff] cursor-pointer"
                  />
                  <span className="font-medium text-[0.95rem]">
                    {focus.name}
                  </span>
                  <span
                    className={`text-[0.72rem] font-semibold px-2 py-0.5 rounded-full ${
                      focus.type === "strength"
                        ? "bg-[rgba(136,82,255,0.2)] text-[#b392f0]"
                        : "bg-[rgba(63,185,80,0.15)] text-[#3fb950]"
                    }`}
                  >
                    {focus.type}
                  </span>
                </label>

                {selected && (
                  <div className="mt-3 ml-8">
                    {exercises.length === 0 ? (
                      <p className="text-[#8b949e] text-[0.82rem]">
                        No exercises yet — add some in the Library tab.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <p className="text-[#8b949e] text-[0.78rem] mb-1">
                          Choose an exercise:
                        </p>
                        {exercises.map((ex) => (
                          <label
                            key={ex.id}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                              chosen === ex.id
                                ? "bg-[rgba(88,166,255,0.15)] border border-[#58a6ff]"
                                : "hover:bg-[#1c2128] border border-transparent"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`exercise-${focus.id}`}
                              checked={chosen === ex.id}
                              onChange={() =>
                                chooseExercise(focus.id, ex.id)
                              }
                              className="accent-[#58a6ff] cursor-pointer"
                            />
                            <span className="text-[0.88rem]">{ex.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Save button */}
      {hasUnsavedChanges && (
        <button
          type="button"
          onClick={saveSession}
          className={`${btnPrimary} w-full py-3 text-[0.95rem]`}
        >
          {existingSession ? "Update Session" : "Create Session"}
        </button>
      )}
    </div>
  );
}

// ============================================================
// HISTORY TAB — view past sessions
// ============================================================
function HistoryTab({
  state,
  update,
}: {
  state: AppState;
  update: (s: AppState) => void;
}) {
  const sorted = [...state.sessions].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  function deleteSession(sessionId: string) {
    if (!confirm("Delete this training session?")) return;
    update({
      ...state,
      sessions: state.sessions.filter((s) => s.id !== sessionId),
    });
  }

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#8b949e] text-[0.95rem]">
          No sessions yet. Plan your first workout in the{" "}
          <strong>Plan</strong> tab.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className={sectionTitle}>Past Sessions</h2>
      <div className="flex flex-col gap-4">
        {sorted.map((session) => {
          const doneCount = session.entries.filter((e) => e.done).length;
          const total = session.entries.length;
          const allDone = doneCount === total && total > 0;
          return (
            <div key={session.id} className={cardClass}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium text-[0.95rem]">
                    {formatDate(session.date)}
                  </span>
                  <span
                    className={`ml-3 text-[0.78rem] font-semibold ${
                      allDone ? "text-[#3fb950]" : "text-[#8b949e]"
                    }`}
                  >
                    {doneCount}/{total} done
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => deleteSession(session.id)}
                  title="Delete session"
                  className={btnDanger}
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {session.entries.map((entry) => {
                  const focus = state.focuses.find(
                    (f) => f.id === entry.focusId
                  );
                  const exercise = state.exercises.find(
                    (ex) => ex.id === entry.exerciseId
                  );
                  return (
                    <div
                      key={entry.focusId + entry.exerciseId}
                      className="flex items-center gap-2 text-[0.85rem]"
                    >
                      <span
                        className={
                          entry.done ? "text-[#3fb950]" : "text-[#8b949e]"
                        }
                      >
                        {entry.done ? "✓" : "○"}
                      </span>
                      <span className={entry.done ? "" : "text-[#8b949e]"}>
                        {exercise?.name ?? "(deleted)"}
                      </span>
                      <span className="text-[#484f58] text-[0.75rem]">
                        — {focus?.name ?? "(deleted)"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
