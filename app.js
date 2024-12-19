// Open IndexedDB database
var db;
const request = indexedDB.open("todoDB", 1);

request.onsuccess = function (event) {
  db = event.target.result;
  loadTasks();
};

request.onerror = function (event) {
  console.log("Database error: " + event.target.errorCode);
};

request.onupgradeneeded = function (event) {
  db = event.target.result;
  if (!db.objectStoreNames.contains("tasks")) {
    db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
  }
};

// Add a task to IndexedDB
document.getElementById("add-task").addEventListener("click", function () {
  const taskInput = document.getElementById("task-input");
  const dueDateInput = document.getElementById("due-date");
  const taskText = taskInput.value.trim();
  const dueDate = dueDateInput.value;

  if (taskText && dueDate) {
    const transaction = db.transaction("tasks", "readwrite");
    const tasksStore = transaction.objectStore("tasks");
    tasksStore.add({ task: taskText, dueDate, completed: false, completedDate: null });

    transaction.oncomplete = function () {
      loadTasks();
      taskInput.value = "";
      dueDateInput.value = "";
    };
  } else {
    alert("Please enter a task and select a due date.");
  }
});

// Load tasks from IndexedDB
function loadTasks() {
  const transaction = db.transaction("tasks", "readonly");
  const tasksStore = transaction.objectStore("tasks");
  const request = tasksStore.getAll();

  request.onsuccess = function (event) {
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";

    event.target.result.forEach(task => {
      const li = document.createElement("li");
      li.classList.add("task-item");

      // Task details container
      const taskDetails = document.createElement("div");
      taskDetails.classList.add("task-details");

      const taskNameSpan = document.createElement("span");
      taskNameSpan.textContent = task.task;

      const dueDateSpan = document.createElement("span");
      dueDateSpan.textContent = `Due: ${task.dueDate}`;

      taskDetails.appendChild(taskNameSpan);
      taskDetails.appendChild(dueDateSpan);

      // Completed Checkbox
      const completedCheckbox = document.createElement("input");
      completedCheckbox.type = "checkbox";
      completedCheckbox.checked = task.completed;
      completedCheckbox.classList.add("completed-checkbox");
      completedCheckbox.addEventListener("change", (e) => {
        updateTaskCompletion(task.id, e.target.checked);
      });

      // Completed Date
      const completedSpan = document.createElement("span");
      if (task.completedDate) {
        completedSpan.textContent = `Completed: ${task.completedDate}`;
      }

      // Task Actions
      const taskActions = document.createElement("div");
      taskActions.classList.add("task-actions");

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => {
        deleteTask(task.id);
      });

      taskActions.appendChild(deleteButton);

      // Append everything to task item
      li.appendChild(completedCheckbox);
      li.appendChild(taskDetails);
      li.appendChild(completedSpan);
      li.appendChild(taskActions);

      taskList.appendChild(li);

      // Style completed tasks
      if (task.completed) {
        li.classList.add("completed");
      }
    });
  };
}

// Update task completion in IndexedDB
function updateTaskCompletion(taskId, completed) {
  const transaction = db.transaction("tasks", "readwrite");
  const tasksStore = transaction.objectStore("tasks");
  const request = tasksStore.get(taskId);

  request.onsuccess = function (event) {
    const task = event.target.result;
    task.completed = completed;
    task.completedDate = completed ? new Date().toLocaleDateString() : null;

    const updateRequest = tasksStore.put(task);
    updateRequest.onsuccess = function () {
      loadTasks();
    };
  };
}

// Delete task from IndexedDB
function deleteTask(taskId) {
  const transaction = db.transaction("tasks", "readwrite");
  const tasksStore = transaction.objectStore("tasks");
  const request = tasksStore.delete(taskId);

  request.onsuccess = function () {
    loadTasks();
  };
}
