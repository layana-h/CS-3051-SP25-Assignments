document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("todo-input");
    const addButton = document.getElementById("add-btn");
    const todoList = document.getElementById("todo-list");
    const listSelect = document.getElementById("list-select");

    function bindEvents() {
        document.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
            checkbox.addEventListener("change", () => {
                const id = checkbox.dataset.id;
                fetch(`/api/todos/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ completed: checkbox.checked })
                }).then(() => {
                    const li = checkbox.closest("li");
                    checkbox.checked
                        ? li.classList.add("checked")
                        : li.classList.remove("checked");
                });
            });
        });

        document.querySelectorAll("button[data-id]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                fetch(`/api/todos/${id}`, {
                    method: "DELETE"
                }).then(() => {
                    btn.parentElement.remove();
                });
            });
        });
    }

    addButton.addEventListener("click", () => {
        const text = input.value.trim();
        if (!text) return;

        fetch("/api/todos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, list_name: listSelect.value })
        })
            .then((res) => res.json())
            .then(() => {
                window.location.href = `/?list=${listSelect.value}`;
            });
    });

    listSelect.addEventListener("change", () => {
        window.location.href = `/?list=${listSelect.value}`;
    });

    bindEvents();
});