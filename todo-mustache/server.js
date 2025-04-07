const express = require("express");
const mustacheExpress = require("mustache-express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const app = express();
const PORT = 3000;

app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname);

app.use(express.json());
app.use(express.static(__dirname));

const db = new sqlite3.Database(path.join(__dirname, "todo.db"), (err) => {
    if (err) return console.error(err.message);
    console.log("Connected to SQLite database.");
});

db.run(`
    CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        list_name TEXT NOT NULL
    )
`);

app.get("/", (req, res) => {
    const list = req.query.list || "home";
    db.all("SELECT * FROM todos WHERE list_name = ?", [list], (err, rows) => {
        if (err) return res.status(500).send("Database error.");

        const listFlags = {
            homeSelected: list === "home",
            schoolSelected: list === "school",
            workSelected: list === "work"
        };

        res.render("todo", {
            todos: rows,
            selectedList: list,
            ...listFlags
        });
    });
});

app.post("/api/todos", (req, res) => {
    const { text, list_name } = req.body;
    db.run(
        "INSERT INTO todos (text, completed, list_name) VALUES (?, 0, ?)",
        [text, list_name],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, text, completed: 0, list_name });
        }
    );
});

app.put("/api/todos/:id", (req, res) => {
    const { completed } = req.body;
    db.run("UPDATE todos SET completed = ? WHERE id = ?", [completed ? 1 : 0, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.sendStatus(200);
    });
});

app.delete("/api/todos/:id", (req, res) => {
    db.run("DELETE FROM todos WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.sendStatus(204);
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});