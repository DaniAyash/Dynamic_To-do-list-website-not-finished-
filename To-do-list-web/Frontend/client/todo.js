async function loadTasks() {
    try {
        const response = await fetch("/todo", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();
        console.log("Received tasks:", data); // Debugging

        if (data.error) {
            console.error("Error:", data.error);
            return;
        }

        displayTasks(data.tasks);
    } catch (error) {
        console.error("Request failed:", error);
    }
}

async function addTask() {
    const taskInput = document.getElementById("task-input");
    const task = taskInput.value.trim();

    if (!task) {
        alert("Please enter a task!");
        return;
    }

    try {
        const response = await fetch("/add-task", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ task })
        });

        const result = await response.json();

        if (result.success) {
            taskInput.value = ""; // Clear input
            displayTasks(result.tasks); // Refresh task list
        } else {
            alert(result.error || "Failed to add task");
        }
    } catch (error) {
        console.error("Error adding task:", error);
    }
}

async function removeTask(taskIndex) {
    try {
        const response = await fetch("/remove-task", {
            method: "POST", // Could also use DELETE
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskIndex })
        });

        const result = await response.json();

        if (result.success) {
            displayTasks(result.tasks); // Refresh the UI with updated task list
        } else {
            alert(result.error || "Failed to remove task");
        }
    } catch (error) {
        console.error("Error removing task:", error);
    }
}

function displayTasks(tasks) {
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = ""; // Clear previous tasks

    tasks.forEach((task, index) => {
        const taskDiv = document.createElement("div");
        taskDiv.classList.add("task");
        taskDiv.innerHTML = `
        <span id="task-text-${index}" style="text-decoration: ${task.completed ? 'line-through' : 'none'}; color: ${task.completed ? 'purple' : 'black'}">
            ${task.taskText}
        </span> 
        <input type="checkbox" id="task-${index}" onclick="toggleTask(this, ${index})" ${task.completed ? 'checked' : ''}>
        <button onclick="removeTask(${index})">Remove</button>`;
        taskList.appendChild(taskDiv);
    });
}


function toggleTask(checkbox, taskIndex) {
    const completed = checkbox.checked;

    // Send the completed status to the server for the specific task
    fetch("/update-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskIndex, completed })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const taskText = document.getElementById(`task-text-${taskIndex}`);
            if (completed) {
                taskText.style.textDecoration = "line-through";
                taskText.style.color = "purple";
            } else {
                taskText.style.textDecoration = "none";
                taskText.style.color = "black";
            }
        } else {
            console.error("Failed to update task status");
        }
    })
    .catch(error => console.error("Error updating task:", error));
}



function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === name) {
            return decodeURIComponent(value); // Decode the cookie value here
        }
    }
    return null;
}

function logout() {
    // Set a flag in localStorage to indicate logout
    localStorage.setItem("clearLoginFields", "true");

    // Redirect to the login page
    window.location.href = "/";
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("logout-btn").addEventListener("click", logout);
});


// Get the username from the cookie
const username = getCookie("username");

// Display the username in the to-do page
if (username) {
    document.getElementById("todo-header").innerText = `This is ${username}'s to-do list`;
} else {
    document.getElementById("todo-header").innerText = "To-Do List";
}

// Add event listener for the "Add Task" button
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("add-task-btn").addEventListener("click", addTask);
});

// Load tasks when page loads
window.onload = loadTasks;
