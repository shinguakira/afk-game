import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initDesktopLinks } from "./desktop";
import "./index.css";

initDesktopLinks(); // Tauri デスクトップ時のみ外部リンクをシステムブラウザへ（Webは no-op）

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
