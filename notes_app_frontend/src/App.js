import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

/**
 * Notes App - Single Page UI with sidebar and editor
 * Features:
 * - List, create, edit, delete notes
 * - Search/filter notes
 * - Persist notes and UI state to localStorage (fallback when no API configured)
 * - Ocean Professional styling applied via custom CSS
 */

// Utilities
const STORAGE_KEYS = {
  notes: 'notes.app.items.v1',
  theme: 'notes.app.theme.v1',
  selectedId: 'notes.app.selectedId.v1',
};

// Types
/**
 * @typedef Note
 * @property {string} id
 * @property {string} title
 * @property {string} content
 * @property {number} updatedAt
 */

// Helpers
const now = () => Date.now();
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// PUBLIC_INTERFACE
export function getApiBase() {
  /** Determine API base from env; return empty string if not set (use localStorage). */
  const base =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    '';
  return (base || '').trim();
}

// PUBLIC_INTERFACE
export function loadNotes() {
  /** Load notes array from localStorage. */
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.notes);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // ignore parse errors
  }
  return [];
}

// PUBLIC_INTERFACE
export function saveNotes(notes) {
  /** Save notes array to localStorage. */
  try {
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
  } catch {
    // ignore quota errors
  }
}

// PUBLIC_INTERFACE
export function loadTheme() {
  /** Load theme from localStorage; default light. */
  const t = localStorage.getItem(STORAGE_KEYS.theme);
  return t === 'dark' ? 'dark' : 'light';
}

// PUBLIC_INTERFACE
export function saveTheme(theme) {
  /** Persist theme. */
  localStorage.setItem(STORAGE_KEYS.theme, theme);
}

// PUBLIC_INTERFACE
export function loadSelectedId() {
  /** Load last selected note id. */
  return localStorage.getItem(STORAGE_KEYS.selectedId) || '';
}

// PUBLIC_INTERFACE
export function saveSelectedId(id) {
  /** Save selected note id. */
  localStorage.setItem(STORAGE_KEYS.selectedId, id || '');
}

// UI Components

function EmptyState({ onCreate }) {
  return (
    <div className="empty-state">
      <h2>No notes yet</h2>
      <p>Create your first note to get started.</p>
      <button className="btn btn-primary" onClick={onCreate}>
        ➕ New Note
      </button>
    </div>
  );
}

function Sidebar({
  notes,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
  search,
  setSearch,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand">
          <span className="brand-logo">🗒️</span>
          <div className="brand-text">
            <strong>Simple Notes</strong>
            <small>Ocean Professional</small>
          </div>
        </div>
        <button className="btn btn-amber" onClick={onCreate} aria-label="Create note">
          ➕
        </button>
      </div>

      <div className="search-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input search"
          placeholder="Search notes..."
          aria-label="Search notes"
        />
      </div>

      <ul className="note-list" role="listbox" aria-label="Notes list">
        {notes.length === 0 && (
          <li className="note-list-empty">No matching notes</li>
        )}
        {notes.map((n) => (
          <li
            key={n.id}
            className={`note-list-item ${selectedId === n.id ? 'active' : ''}`}
            role="option"
            aria-selected={selectedId === n.id}
            onClick={() => onSelect(n.id)}
          >
            <div className="note-list-item-main">
              <div className="note-title">
                {n.title?.trim() || 'Untitled'}
              </div>
              <div className="note-meta">
                {new Date(n.updatedAt).toLocaleString()}
              </div>
            </div>
            <button
              className="btn btn-icon btn-danger"
              title="Delete note"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(n.id);
              }}
              aria-label={`Delete note ${n.title || 'Untitled'}`}
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function Editor({ note, onChange, onSave }) {
  const titleRef = useRef(null);

  useEffect(() => {
    // focus title when switching to a new note without title
    if (note && !note.title) {
      titleRef.current?.focus();
    }
  }, [note?.id]);

  if (!note) {
    return (
      <div className="editor empty">
        <div className="placeholder">
          Select a note or create a new one to start editing.
        </div>
      </div>
    );
  }

  return (
    <div className="editor">
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <span className="pill">Editing</span>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={onSave}>
            💾 Save
          </button>
        </div>
      </div>

      <input
        ref={titleRef}
        className="input title-input"
        placeholder="Note title"
        value={note.title}
        onChange={(e) => onChange({ ...note, title: e.target.value })}
        aria-label="Note title"
      />
      <textarea
        className="textarea content-input"
        placeholder="Write your note here..."
        value={note.content}
        onChange={(e) => onChange({ ...note, content: e.target.value })}
        aria-label="Note content"
      />
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** Root component for Notes app. */
  const [theme, setTheme] = useState(loadTheme());
  const [notes, setNotes] = useState(() => {
    const loaded = loadNotes();
    // sort by updated desc
    return loaded.sort((a, b) => b.updatedAt - a.updatedAt);
  });
  const [selectedId, setSelectedId] = useState(() => {
    const id = loadSelectedId();
    return id;
  });
  const [search, setSearch] = useState('');

  // Apply theme attribute and persist
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  // Persist notes on change
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Persist selection
  useEffect(() => {
    saveSelectedId(selectedId);
  }, [selectedId]);

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    const arr = q
      ? notes.filter(
          (n) =>
            (n.title || '').toLowerCase().includes(q) ||
            (n.content || '').toLowerCase().includes(q)
        )
      : notes;
    return arr;
  }, [notes, search]);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId) || null,
    [notes, selectedId]
  );

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // PUBLIC_INTERFACE
  const createNote = () => {
    const n = {
      id: uid(),
      title: '',
      content: '',
      updatedAt: now(),
    };
    setNotes((prev) => [n, ...prev]);
    setSelectedId(n.id);
  };

  // PUBLIC_INTERFACE
  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) {
      // select next available
      const remaining = notes.filter((n) => n.id !== id);
      setSelectedId(remaining[0]?.id || '');
    }
  };

  // PUBLIC_INTERFACE
  const updateSelectedNote = (updated) => {
    setNotes((prev) =>
      prev
        .map((n) => (n.id === updated.id ? { ...updated, updatedAt: now() } : n))
        .sort((a, b) => b.updatedAt - a.updatedAt)
    );
  };

  // PUBLIC_INTERFACE
  const saveSelectedNote = () => {
    // No-op since persistence is live on change, but keep for UX affordance
    // Could integrate to backend if REACT_APP_API_BASE is set later.
  };

  const hasNotes = notes.length > 0;

  return (
    <div className="app-root">
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="app-title">Simple Notes</h1>
        </div>
        <div className="topbar-right">
          <button
            className="btn btn-ghost"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title="Toggle theme"
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </header>

      <main className="layout">
        <Sidebar
          notes={filteredNotes}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onCreate={createNote}
          onDelete={deleteNote}
          search={search}
          setSearch={setSearch}
        />

        <section className="content">
          {!hasNotes ? (
            <EmptyState onCreate={createNote} />
          ) : (
            <Editor
              note={selectedNote}
              onChange={updateSelectedNote}
              onSave={saveSelectedNote}
            />
          )}
        </section>
      </main>

      <footer className="footer">
        <span>
          {getApiBase()
            ? 'Connected to API'
            : 'Local mode (saved in your browser)'}
        </span>
      </footer>
    </div>
  );
}

export default App;
