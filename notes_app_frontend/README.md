# Notes App (React) — Ocean Professional

A modern, single‑page notes application with a sidebar and an editor area. It supports creating, editing, deleting, and searching notes. Data persists to localStorage by default and can be wired to a backend later via REACT_APP_* environment variables.

## UI & Style

- Layout: sidebar (notes list + search) and main area (note editor)
- Theme: Ocean Professional (blue & amber accents, subtle shadows, rounded corners, smooth transitions)
- Light and Dark mode toggle in the topbar

## Features

- List notes, select to edit
- Create note
- Edit title and content (autosaves to localStorage on change)
- Delete note
- Search/filter notes by title or content
- Persist to localStorage
- Responsive layout (sidebar collapses under content on smaller screens)

## Environment Variables

The app runs fully local-first. If a backend is configured in the future, set the following:

- REACT_APP_API_BASE
- REACT_APP_BACKEND_URL
- REACT_APP_FRONTEND_URL
- REACT_APP_WS_URL
- REACT_APP_NODE_ENV
- REACT_APP_NEXT_TELEMETRY_DISABLED
- REACT_APP_ENABLE_SOURCE_MAPS
- REACT_APP_PORT
- REACT_APP_TRUST_PROXY
- REACT_APP_LOG_LEVEL
- REACT_APP_HEALTHCHECK_PATH
- REACT_APP_FEATURE_FLAGS
- REACT_APP_EXPERIMENTS_ENABLED

If REACT_APP_API_BASE is not set, the app operates in Local mode using localStorage. A small footer indicator shows whether the app is connected to an API or running locally.

You can provide a `.env` file in the project root (do not commit secrets). Example `.env.example`:

```
REACT_APP_API_BASE=
REACT_APP_BACKEND_URL=
REACT_APP_FRONTEND_URL=http://localhost:3000
REACT_APP_PORT=3000
```

## Getting Started

Install dependencies and run:

```
npm install
npm start
```

The app serves on http://localhost:3000 (Create React App default). To build:

```
npm run build
```

## Project Structure

- src/App.js — main application with state management and UI
- src/App.css — theme and component styles (Ocean Professional)
- src/index.js — application entry point
- src/index.css — minimal resets

## Notes Storage

Notes are stored in localStorage under the key `notes.app.items.v1`. The selected note id and theme preference are also persisted.

## Tests

CRA default tests are present and can be run with:

```
npm test
```

## Accessibility

- Keyboard and screen reader friendly list semantics (`role="listbox"`/`option`)
- Clear labels on interactive controls
