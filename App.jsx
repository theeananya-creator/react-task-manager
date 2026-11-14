import { useState, useEffect } from "react";
import "./App.css";

const KEY = "crud-tasks-v1";
const EMPTY = { title: "", notes: "", priority: "Medium" };

function loadTasks() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  // Persist every change to localStorage
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch (e) {}
  }, [tasks]);

  const setField = (name) => (e) => setForm({ ...form, [name]: e.target.value });

  // CREATE and UPDATE
  const save = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Enter a title for the task."); return; }
    const clean = { ...form, title: form.title.trim(), notes: form.notes.trim() };
    if (editId) {
      setTasks(tasks.map((t) => (t.id === editId ? { ...t, ...clean } : t)));
    } else {
      setTasks([{ id: Date.now().toString(36), done: false, created: new Date().toISOString(), ...clean }, ...tasks]);
    }
    cancel();
  };

  const edit = (t) => {
    setEditId(t.id);
    setForm({ title: t.title, notes: t.notes, priority: t.priority });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancel = () => { setEditId(null); setForm(EMPTY); setError(""); };

  const toggle = (id) => setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  // DELETE
  const remove = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
    setConfirmId(null);
    if (editId === id) cancel();
  };

  // READ (search + filter)
  const shown = tasks.filter((t) => {
    const text = (t.title + " " + t.notes).toLowerCase();
    const okQuery = text.includes(query.toLowerCase());
    const okFilter = filter === "All" || (filter === "Done" ? t.done : filter === "Open" ? !t.done : t.priority === filter);
    return okQuery && okFilter;
  });

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div className="app">
      <h1>Task manager</h1>
      <p className="sub">{tasks.length} tasks, {doneCount} done. Saved in your browser.</p>

      <form className="panel" onSubmit={save}>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" value={form.title} onChange={setField("title")} placeholder="Write the SQL report query" />
        </div>
        <div className="field">
          <label htmlFor="notes">Notes</label>
          <textarea id="notes" rows="2" value={form.notes} onChange={setField("notes")} placeholder="Optional details" />
        </div>
        <div className="row">
          <div>
            <label htmlFor="priority">Priority</label>
            <select id="priority" value={form.priority} onChange={setField("priority")}>
              <option>High</option><option>Medium</option><option>Low</option>
            </select>
          </div>
        </div>
        {error && <p className="err" role="alert">{error}</p>}
        <div className="actions">
          <button className="primary" type="submit">{editId ? "Save changes" : "Add task"}</button>
          {editId && <button type="button" onClick={cancel}>Cancel</button>}
        </div>
      </form>

      <div className="toolbar">
        <input aria-label="Search tasks" placeholder="Search tasks" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select aria-label="Filter tasks" value={filter} onChange={(e) => setFilter(e.target.value)}>
          {["All", "Open", "Done", "High", "Medium", "Low"].map((f) => <option key={f}>{f}</option>)}
        </select>
      </div>

      {shown.length === 0 ? (
        <p className="empty">{tasks.length === 0 ? "No tasks yet. Add your first one above." : "No tasks match your search."}</p>
      ) : (
        <ul>
          {shown.map((t) => (
            <li key={t.id} className={"item " + t.priority + (t.done ? " done" : "")}>
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} aria-label={"Mark " + t.title + " as done"} />
              <div className="body">
                <div className="title">{t.title}</div>
                {t.notes && <div className="notes">{t.notes}</div>}
                <div className="meta">{t.priority} priority, added {new Date(t.created).toLocaleDateString()}</div>
              </div>
              <div className="actions">
                {confirmId === t.id ? (
                  <>
                    <button className="small danger" onClick={() => remove(t.id)}>Confirm delete</button>
                    <button className="small" onClick={() => setConfirmId(null)}>Keep</button>
                  </>
                ) : (
                  <>
                    <button className="small" onClick={() => edit(t)}>Edit</button>
                    <button className="small danger" onClick={() => setConfirmId(t.id)}>Delete</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
