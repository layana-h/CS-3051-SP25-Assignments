document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("todo-input");
    const addButton = document.getElementById("add-btn");
    const todoList = document.getElementById("todo-list");

    function addTask() {
        const taskText = input.value.trim();
        if (taskText === "") return;

        const listItem = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";

        const taskSpan = document.createElement("span");
        taskSpan.textContent = taskText;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "X";

        listItem.appendChild(checkbox);
        listItem.appendChild(taskSpan);
        listItem.appendChild(deleteBtn);
        todoList.appendChild(listItem);

        input.value = "";

        checkbox.addEventListener("change", function () {
            taskSpan.style.textDecoration = checkbox.checked ? "line-through" : "none";
        });

        deleteBtn.addEventListener("click", function () {
            listItem.remove();
        });
    }

    addButton.addEventListener("click", addTask);
});