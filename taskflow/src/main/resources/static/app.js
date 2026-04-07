const API_URL = "http://localhost:8080/api/tasks";
let currentFilter = "ALL";
let allTasks = [];

// Load all tasks when page opens
document.addEventListener("DOMContentLoaded", loadTasks);

function loadTasks() {
    fetch(API_URL)
        .then(res => res.json())
        .then(tasks => {
            allTasks = tasks;
            renderTasks(tasks);
        });
}

function renderTasks(tasks) {
    const taskList = document.getElementById("taskList");

    // Apply filter
    const filtered = currentFilter === "ALL"
        ? tasks
        : tasks.filter(t => t.status === currentFilter);

    if (filtered.length === 0) {
        taskList.innerHTML = `<div class="empty-state">No tasks here! 🎯</div>`;
        return;
    }

    taskList.innerHTML = filtered.map(task => `
        <div class="task-item ${task.status === 'DONE' ? 'done' : ''}">
            <div class="task-left">
                <span class="task-title">${task.title}</span>
                <span class="task-badge badge-${task.status}">
                    ${task.status.replace('_', ' ')}
                </span>
            </div>
            <div class="task-actions">
                ${task.status !== 'DONE' ? `
                <button class="btn-done" onclick="markDone(${task.id})">
                    ✅ Done
                </button>` : ''}
                <button class="btn-delete" onclick="deleteTask(${task.id})">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `).join('');
}

function filterTasks(status, btn) {
    currentFilter = status;

    // Update active button
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    renderTasks(allTasks);
}

function addTask() {
    const input = document.getElementById("taskInput");
    const statusSelect = document.getElementById("statusSelect");
    const title = input.value.trim();

    if (!title) {
        alert("Please enter a task!");
        return;
    }

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title, status: statusSelect.value })
    })
    .then(res => res.json())
    .then(() => {
        input.value = "";
        statusSelect.value = "TODO";
        loadTasks();
    });
}

function markDone(id) {
    const task = allTasks.find(t => t.id === id);
    fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: task.title, status: "DONE" })
    })
    .then(() => loadTasks());
}

function deleteTask(id) {
    fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    })
    .then(() => loadTasks());
}