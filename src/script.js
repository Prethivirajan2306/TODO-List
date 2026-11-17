
// SMART TO-DO LIST APPLICATION

// Load saved data
let tasks = JSON.parse(
    localStorage.getItem("smartTasks")
) || [];

let xp = Number(localStorage.getItem("smartXP")) || 0;

let currentFilter = "all";
let editingId = null;

// Productivity challenges
const challenges = [
    "📚 Revise a topic for 15 minutes.",
    "🧹 Organize your study table.",
    "📖 Read 5 pages of a useful book.",
    "📵 Stay away from social media for 20 minutes.",
    "✍️ Write down three goals for tomorrow.",
    "💻 Practice coding for an extra 15 minutes.",
    "🧠 Solve five aptitude questions."
];

// Save tasks and XP
function saveData() {
    localStorage.setItem(
        "smartTasks",
        JSON.stringify(tasks)
    );

    localStorage.setItem("smartXP", xp);
}

// Check missed deadlines
function checkDeadlines() {
    const now = Date.now();

    tasks.forEach(task => {
        if (
            !task.completed &&
            !task.punishment &&
            new Date(task.deadline).getTime() < now
        ) {
            const random = Math.floor(
                Math.random() * challenges.length
            );

            task.punishment = challenges[random];
        }
    });

    saveData();
}

// Add or update task
function addTask() {
    const name = document.getElementById("taskInput")
        .value.trim();

    const category = document.getElementById("category").value;

    const priority = document.getElementById("priority").value;

    const deadline = document.getElementById("deadline").value;

    const message = document.getElementById("message");

    if (!name || !deadline) {
        message.textContent =
            "Please enter a task and deadline!";
        return;
    }

    const deadlineTime = new Date(deadline).getTime();

    if (isNaN(deadlineTime) || deadlineTime <= Date.now()) {
        message.textContent =
            "Please select a valid future deadline!";
        return;
    }

    if (editingId !== null) {
        const task = tasks.find(t => t.id === editingId);

        if (task) {
            task.name = name;
            task.category = category;
            task.priority = priority;
            task.deadline = deadline;
            task.punishment = null;
        }

        editingId = null;

        document.getElementById("saveBtn").textContent =
            "Add Task";

        document.getElementById("cancelBtn").hidden = true;

        message.textContent = "Task updated successfully!";
    } else {
        tasks.push({
            id: Date.now() + Math.random(),
            name: name,
            category: category,
            priority: priority,
            deadline: deadline,
            completed: false,
            punishment: null,
            xpAwarded: false
        });

        message.textContent = "Task added successfully!";
    }

    document.getElementById("taskInput").value = "";
    document.getElementById("deadline").value = "";

    saveData();
    displayTasks();
}

// Edit task
function editTask(id) {
    const task = tasks.find(t => t.id === id);

    if (!task || task.completed) return;

    document.getElementById("taskInput").value = task.name;
    document.getElementById("category").value = task.category;
    document.getElementById("priority").value = task.priority;
    document.getElementById("deadline").value = task.deadline;

    editingId = id;

    document.getElementById("saveBtn").textContent =
        "Update Task";

    document.getElementById("cancelBtn").hidden = false;

    document.getElementById("message").textContent =
        "Editing selected task.";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Cancel editing
function cancelEdit() {
    editingId = null;

    document.getElementById("taskInput").value = "";
    document.getElementById("deadline").value = "";

    document.getElementById("saveBtn").textContent =
        "Add Task";

    document.getElementById("cancelBtn").hidden = true;

    document.getElementById("message").textContent = "";

    displayTasks();
}

// Complete task
function completeTask(id) {
    const task = tasks.find(t => t.id === id);

    if (!task || task.completed) return;

    task.completed = true;
    task.completedAt = Date.now();

    if (!task.xpAwarded) {
        if (task.completedAt <= new Date(task.deadline).getTime()) {
            xp += 20;

            alert("🎉 Excellent! Task completed on time. +20 XP!");
        } else {
            alert("Task completed late! Keep improving your time management.");
        }

        task.xpAwarded = true;
    }

    saveData();
    displayTasks();
}

// Delete task
function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) {
        return;
    }

    tasks = tasks.filter(t => t.id !== id);

    if (editingId === id) {
        cancelEdit();
    }

    saveData();
    displayTasks();
}

// Filter tasks
function setFilter(filter, button) {
    currentFilter = filter;

    document.querySelectorAll(".filter").forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");

    displayTasks();
}

// Search tasks
document.getElementById("searchInput")
    .addEventListener("input", displayTasks);

// Display all tasks
function displayTasks() {
    checkDeadlines();

    const list = document.getElementById("taskList");

    const search = document.getElementById("searchInput")
        .value.toLowerCase().trim();

    const now = Date.now();

    list.innerHTML = "";

    const filteredTasks = tasks.filter(task => {
        const overdue =
            !task.completed &&
            new Date(task.deadline).getTime() < now;

        const matchesSearch =
            task.name.toLowerCase().includes(search);

        let matchesFilter = true;

        if (currentFilter === "pending") {
            matchesFilter = !task.completed && !overdue;
        } else if (currentFilter === "completed") {
            matchesFilter = task.completed;
        } else if (currentFilter === "overdue") {
            matchesFilter = overdue;
        }

        return matchesSearch && matchesFilter;
    });

    // Sort tasks by deadline
    filteredTasks.sort((a, b) =>
        new Date(a.deadline) - new Date(b.deadline)
    );

    if (filteredTasks.length === 0) {
        list.innerHTML =
            '<div class="empty">No tasks found. Add a new task!</div>';
    }

    filteredTasks.forEach(task => {
        const overdue =
            !task.completed &&
            new Date(task.deadline).getTime() < now;

        const div = document.createElement("div");

        div.className = "task-item";

        if (task.completed) {
            div.classList.add("completed");
        } else if (overdue) {
            div.classList.add("overdue");
        }

        const status = task.completed
            ? "Completed"
            : overdue ? "Overdue" : "Pending";

        const statusClass = task.completed
            ? "completed-status"
            : overdue ? "overdue-status" : "pending-status";

        const date = new Date(task.deadline)
            .toLocaleString();

        const title = document.createElement("h3");
        title.textContent = task.name;

        const statusBadge = document.createElement("span");
        statusBadge.className = "status " + statusClass;
        statusBadge.textContent = status;

        const top = document.createElement("div");
        top.className = "task-top";

        top.append(title, statusBadge);

        const details = document.createElement("div");
        details.className = "task-details";

        const category = document.createElement("p");
        category.textContent = "Category: " + task.category;

        const priority = document.createElement("p");
        priority.textContent = "Priority: " + task.priority;

        const deadline = document.createElement("p");
        deadline.textContent = "Deadline: " + date;

        details.append(category, priority, deadline);

        if (task.punishment) {
            const challenge = document.createElement("p");
            challenge.textContent = "🔥 Challenge: " + task.punishment;
            details.appendChild(challenge);
        }

        const actions = document.createElement("div");
        actions.className = "task-actions";

        if (!task.completed) {
            const doneButton = document.createElement("button");
            doneButton.className = "done-btn";
            doneButton.textContent = "✓ Complete";

            doneButton.addEventListener("click", () => {
                completeTask(task.id);
            });

            const editButton = document.createElement("button");
            editButton.className = "edit-btn";
            editButton.textContent = "✎ Edit";

            editButton.addEventListener("click", () => {
                editTask(task.id);
            });

            actions.append(doneButton, editButton);
        }

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        actions.appendChild(deleteButton);

        div.append(top, details, actions);

        list.appendChild(div);
    });

    updateDashboard();
}

// Update dashboard statistics
function updateDashboard() {
    const now = Date.now();

    const completed = tasks.filter(t => t.completed).length;

    const overdue = tasks.filter(t =>
        !t.completed &&
        new Date(t.deadline).getTime() < now
    ).length;

    const pending = tasks.filter(t =>
        !t.completed &&
        new Date(t.deadline).getTime() >= now
    ).length;

    document.getElementById("totalCount").textContent =
        tasks.length;

    document.getElementById("pendingCount").textContent =
        pending;

    document.getElementById("completedCount").textContent =
        completed;

    document.getElementById("overdueCount").textContent =
        overdue;

    const percentage = tasks.length === 0
        ? 0
        : Math.round((completed / tasks.length) * 100);

    document.getElementById("progressFill").style.width =
        percentage + "%";

    document.getElementById("progressText").textContent =
        percentage + "% Completed";

    document.getElementById("xpText").textContent =
        "🏆 XP Points: " + xp;

    updateAchievements();
    updateChallenges();
}

// Update achievements
function updateAchievements() {
    let level = "Beginner";

    let message = "Start completing your tasks!";

    if (xp >= 100) {
        level = "Silver Achiever";
        message = "Great progress! Keep going!";
    }

    if (xp >= 300) {
        level = "Gold Achiever";
        message = "Excellent productivity!";
    }

    if (xp >= 500) {
        level = "Productivity Champion";
        message = "You have mastered your tasks!";
    }

    document.getElementById("level").textContent = level;

    document.getElementById("achievementText").textContent =
        message;
}

// Show missed deadline challenges
function updateChallenges() {
    const zone = document.getElementById("challengeList");

    zone.innerHTML = "";

    const missedTasks = tasks.filter(t => t.punishment);

    if (missedTasks.length === 0) {
        zone.textContent =
            "No missed tasks! Keep up the good work.";
        return;
    }

    missedTasks.forEach(task => {
        const item = document.createElement("div");

        item.className = "challenge-item";

        item.textContent =
            "⚠ " + task.name + " — " + task.punishment;

        zone.appendChild(item);
    });
}

// Check deadlines automatically
setInterval(displayTasks, 10000);

// Initial application loading
displayTasks();
