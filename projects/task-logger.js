(function () {
  "use strict";

  const STORAGE_KEY = "task_logger_data";

  // ---- Persistence ----
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return { tasks: [], logs: {} };
  }

  function save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // ---- Date helpers ----
  function toDateStr(d) {
    return d.toISOString().slice(0, 10);
  }

  function formatDate(str) {
    const d = new Date(str + "T00:00:00");
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  function today() {
    return toDateStr(new Date());
  }

  function addDays(dateStr, n) {
    const d = new Date(dateStr + "T00:00:00");
    d.setDate(d.getDate() + n);
    return toDateStr(d);
  }

  function dayOfWeek(dateStr) {
    return new Date(dateStr + "T00:00:00").getDay(); // 0=Sun
  }

  // ---- Task scheduling ----
  function isTaskDue(task, dateStr) {
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
      default:
        return true;
    }
  }

  // ---- Streak calculation ----
  function getStreak(state, taskId) {
    let streak = 0;
    let d = today();
    // If today is not logged yet, start checking from yesterday
    const todayLog = state.logs[d];
    if (!todayLog || !todayLog[taskId]) {
      d = addDays(d, -1);
    }
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

  // ---- State ----
  let state = load();
  let historyDate = today();

  // ---- DOM refs ----
  const $todayDate = document.getElementById("today-date");
  const $taskList = document.getElementById("task-list");
  const $emptyState = document.getElementById("empty-state");
  const $form = document.getElementById("add-form");
  const $taskName = document.getElementById("task-name");
  const $taskFreq = document.getElementById("task-freq");
  const $historyList = document.getElementById("history-list");
  const $historyDate = document.getElementById("history-date");
  const $historyEmpty = document.getElementById("history-empty");
  const $prevDay = document.getElementById("prev-day");
  const $nextDay = document.getElementById("next-day");

  // ---- Render today's tasks ----
  function renderToday() {
    const d = today();
    $todayDate.textContent = formatDate(d);

    const dueTasks = state.tasks.filter((t) => isTaskDue(t, d));
    $emptyState.style.display = dueTasks.length ? "none" : "block";
    $taskList.innerHTML = "";

    dueTasks.forEach((task) => {
      const logEntry = state.logs[d] && state.logs[d][task.id];
      const done = !!logEntry;
      const streak = getStreak(state, task.id);

      const row = document.createElement("div");
      row.className = "task-row" + (done ? " done" : "");

      const checkBtn = document.createElement("button");
      checkBtn.className = "task-check";
      checkBtn.innerHTML = done ? "&#10003;" : "";
      checkBtn.title = done ? "Undo" : "Log task";
      checkBtn.addEventListener("click", () => toggleLog(task.id, d));

      const info = document.createElement("div");
      info.className = "task-info";

      let nameHtml = '<div class="name">' + escHtml(task.name);
      if (streak >= 2) {
        nameHtml += '<span class="streak-badge">' + streak + " day streak</span>";
      }
      nameHtml += "</div>";
      nameHtml += '<div class="freq">' + capitalize(task.freq) + "</div>";
      if (done) {
        nameHtml += '<div class="log-time">Logged ' + logEntry + "</div>";
      }
      info.innerHTML = nameHtml;

      const delBtn = document.createElement("button");
      delBtn.className = "task-delete";
      delBtn.innerHTML = "&#10005;";
      delBtn.title = "Delete task";
      delBtn.addEventListener("click", () => deleteTask(task.id));

      row.append(checkBtn, info, delBtn);
      $taskList.appendChild(row);
    });
  }

  // ---- Render history ----
  function renderHistory() {
    $historyDate.textContent = formatDate(historyDate);
    $nextDay.disabled = historyDate >= today();

    const dayLog = state.logs[historyDate] || {};
    const entries = state.tasks
      .filter((t) => dayLog[t.id])
      .map((t) => ({ task: t, time: dayLog[t.id] }));

    // Also show tasks that were logged but since deleted
    const loggedIds = Object.keys(dayLog);
    const knownIds = new Set(state.tasks.map((t) => t.id));
    loggedIds.forEach((id) => {
      if (!knownIds.has(id)) {
        entries.push({ task: { id, name: "(deleted task)", freq: "" }, time: dayLog[id] });
      }
    });

    $historyEmpty.style.display = entries.length ? "none" : "block";
    $historyList.innerHTML = "";

    entries.forEach(({ task, time }) => {
      const row = document.createElement("div");
      row.className = "task-row done";

      const check = document.createElement("button");
      check.className = "task-check";
      check.innerHTML = "&#10003;";
      check.disabled = true;

      const info = document.createElement("div");
      info.className = "task-info";
      info.innerHTML =
        '<div class="name">' + escHtml(task.name) + "</div>" +
        '<div class="log-time">Logged ' + escHtml(time) + "</div>";

      row.append(check, info);
      $historyList.appendChild(row);
    });
  }

  // ---- Actions ----
  function toggleLog(taskId, dateStr) {
    if (!state.logs[dateStr]) state.logs[dateStr] = {};
    if (state.logs[dateStr][taskId]) {
      delete state.logs[dateStr][taskId];
      if (Object.keys(state.logs[dateStr]).length === 0) {
        delete state.logs[dateStr];
      }
    } else {
      const now = new Date();
      state.logs[dateStr][taskId] =
        now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    }
    save(state);
    renderToday();
    if (historyDate === dateStr) renderHistory();
  }

  function deleteTask(taskId) {
    if (!confirm("Delete this task? History logs will be kept.")) return;
    state.tasks = state.tasks.filter((t) => t.id !== taskId);
    save(state);
    renderToday();
    renderHistory();
  }

  function addTask(name, freq) {
    state.tasks.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      freq,
      created: new Date().toISOString(),
    });
    save(state);
    renderToday();
  }

  // ---- Event listeners ----
  $form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $taskName.value.trim();
    if (!name) return;
    addTask(name, $taskFreq.value);
    $taskName.value = "";
    $taskName.focus();
  });

  $prevDay.addEventListener("click", () => {
    historyDate = addDays(historyDate, -1);
    renderHistory();
  });

  $nextDay.addEventListener("click", () => {
    if (historyDate < today()) {
      historyDate = addDays(historyDate, 1);
      renderHistory();
    }
  });

  // ---- Save on unload as safety net ----
  window.addEventListener("beforeunload", () => save(state));

  // ---- Helpers ----
  function escHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // ---- Init ----
  renderToday();
  renderHistory();
})();
