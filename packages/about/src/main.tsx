import React from "react";
import ReactDOM from "react-dom/client";
import AboutApp from "./AboutApp";
import "../../shell/src/index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <div className="p-4 w-[500px]">
      <AboutApp />
    </div>
  </React.StrictMode>
);
