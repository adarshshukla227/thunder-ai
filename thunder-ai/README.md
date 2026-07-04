# Thunder AI

A custom AI assistant — starting with chat mode, coding mode comes next.

## Project structure

```
thunder-ai/
├── backend/                 Node.js + Express + MongoDB API
│   ├── config/
│   │   └── db.js            MongoDB connection
│   ├── models/
│   │   ├── Conversation.js  A single chat thread
│   │   ├── Message.js       A single message (user or assistant)
│   │   └── Memory.js        What the AI knows about the user (transparent memory)
│   ├── routes/
│   │   ├── chatRoutes.js    /api/chat endpoints
│   │   └── memoryRoutes.js  /api/memory endpoints
│   ├── controllers/
│   │   ├── chatController.js
│   │   └── memoryController.js
│   ├── services/
│   │   ├── groqService.js       Calls the Groq API (the LLM)
│   │   └── memoryExtractor.js   Pulls memorable facts out of a conversation
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/                 React + Vite
    ├── src/
    │   ├── api/client.js      Talks to the backend
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   ├── ChatWindow.jsx
    │   │   ├── MessageBubble.jsx
    │   │   ├── ChatInput.jsx
    │   │   └── MemoryDashboard.jsx   Transparent memory viewer
    │   ├── pages/
    │   │   └── ChatPage.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# add your Groq API key, MongoDB URI, and a random JWT_SECRET string to .env
npm run dev
```

Free Groq API key: https://console.groq.com

Free MongoDB (Atlas): https://www.mongodb.com/cloud/atlas

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## What this version includes

- **Login / signup** — email + password auth (JWT), every user has their own
  conversations and memory
- Chat mode — talks to Groq API (Llama / DeepSeek models)
- **Voice input** — mic button uses the browser's built-in speech recognition
  (Chrome recommended)
- **Voice output** — toggle the speaker icon to have replies read aloud
- **File attach** — the `+` button lets you attach a text/code file; its
  contents get sent along with your message
- Memory dashboard — a sidebar option where the user can see exactly what the AI
  knows about them, when it learned it, and delete any memory
- Every conversation is saved to the database, scoped to the logged-in user

## What's coming next

- Coding mode (file explorer + editor + sandbox debug loop)
- A 3D flip transition between chat mode and coding mode
