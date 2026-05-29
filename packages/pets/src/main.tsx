import React from "react";
import ReactDOM from "react-dom/client";
import PetsApp from "./PetsApp";
import "../../shell/src/index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <div className="p-4 w-[500px]">
      <PetsApp />
    </div>
  </React.StrictMode>
);
