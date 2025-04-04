document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("todo-input");
    const addButton = document.getElementById("add-btn");
    const todoList = document.getElementById("todo-list");
    const listSelect = document.getElementById("list-select");

    function renderTask(task) {
        const listItem = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        const taskSpan = document.createElement("span");
        taskSpan.textContent = task.text;
        if (task.completed) {
            taskSpan.style.textDecoration = "line-through";
        }

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "X";

        checkbox.addEventListener("change", () => {
            fetch(`/api/todos/${task.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: checkbox.checked })
            }).then(() => {
                taskSpan.style.textDecoration = checkbox.checked ? "line-through" : "none";
            });
        });

        deleteBtn.addEventListener("click", () => {
            fetch(`/api/todos/${task.id}`, {
                method: "DELETE"
            }).then(() => {
                listItem.remove();
            });
        });

        listItem.appendChild(checkbox);
        listItem.appendChild(taskSpan);
        listItem.appendChild(deleteBtn);
        todoList.appendChild(listItem);
    }

    function loadTodos() {
        const listName = listSelect.value;
        fetch(`/api/todos?list=${encodeURIComponent(listName)}`)
            .then((res) => res.json())
            .then((data) => {
                todoList.innerHTML = "";
                data.forEach(renderTask);
            });
    }

    addButton.addEventListener("click", () => {
        const text = input.value.trim();
        const listName = listSelect.value;
        if (!text) return;

        fetch("/api/todos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, list_name: listName })
        })
            .then((res) => res.json())
            .then((newTask) => {
                renderTask(newTask);
                input.value = "";
            });
    });

    listSelect.addEventListener("change", loadTodos);
    loadTodos();
});