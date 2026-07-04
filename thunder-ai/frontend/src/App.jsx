import { useState } from "react";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import { getToken, clearToken } from "./api/client";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());

  function handleLogout() {
    clearToken();
    setLoggedIn(false);
  }

  if (!loggedIn) {
    return <LoginPage onLoggedIn={() => setLoggedIn(true)} />;
  }

  return <ChatPage onLogout={handleLogout} />;
}
