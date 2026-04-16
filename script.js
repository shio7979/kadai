// ===== 保存 =====
function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const data = localStorage.getItem("tasks");
  return data ? JSON.parse(data) : [];
}

let tasks = loadTasks();

// ===== 次の締切 =====
function getNextDue(task) {
  const now = new Date();
  const due = new Date();
  due.setHours(0, 0, 0, 0);

  const today = now.getDay();

  let diff = task.day - today;
  if (diff < 0) diff += 7;

  due.setDate(due.getDate() + diff);

  const periodHours = {
    1: 9,
    2: 11,
    3: 13,
    4: 15,
    5: 17
  };

  due.setHours(periodHours[task.period] || 9);

  if (diff === 0 && now > due) {
    due.setDate(due.getDate() + 7);
  }

  return due;
}

// ===== 残り日数 =====
function getDaysLeft(due) {
  const now = new Date();
  const diff = due - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ===== リセット判定 =====
function shouldReset(task) {
  if (!task.lastDone) return false;

  const last = new Date(task.lastDone);
  const next = getNextDue(task);

  return last < next && new Date() >= next;
}

// ===== 表示 =====
function render() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.sort((a, b) => getNextDue(a) - getNextDue(b));

  tasks.forEach((task, index) => {

    if (shouldReset(task)) {
      task.done = false;
    }

    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;

    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      if (task.done) {
        task.lastDone = new Date();
      }
      saveTasks(tasks);
    });

    const due = getNextDue(task);
    const daysLeft = getDaysLeft(due);

    // ===== 左 =====
    const left = document.createElement("span");
    left.textContent =
      `${task.name}（${["日","月","火","水","木","金","土"][task.day]}${task.period}限）`;

    // ===== 右 =====
    const right = document.createElement("span");

    let label = "";
    if (daysLeft === 0) label = "今日";
    else if (daysLeft === 1) label = "明日";
    else label = `あと${daysLeft}日`;

    right.textContent = label;

    // 色
    if (daysLeft <= 1) {
      right.classList.add("danger");
    } else {
      right.classList.add("normal");
    }

    // 完了表示
    if (task.done) {
      left.style.opacity = "0.5";
      left.style.textDecoration = "line-through";
    }

    const textWrap = document.createElement("div");
    textWrap.className = "task-text";

    textWrap.appendChild(left);
    textWrap.appendChild(right);

    const delBtn = document.createElement("button");
    delBtn.textContent = "削除";
    delBtn.onclick = () => {
      tasks.splice(index, 1);
      saveTasks(tasks);
      render();
    };

    li.appendChild(checkbox);
    li.appendChild(textWrap);
    li.appendChild(delBtn);

    list.appendChild(li);
  });
}

// ===== 追加 =====
function addTask() {
  const name = document.getElementById("taskName").value;
  const day = Number(document.getElementById("day").value);
  const period = Number(document.getElementById("period").value);

  if (!name) return;

  tasks.push({
    name,
    day,
    period,
    done: false,
    lastDone: null
  });

  saveTasks(tasks);
  render();

  document.getElementById("taskName").value = "";
}

render();