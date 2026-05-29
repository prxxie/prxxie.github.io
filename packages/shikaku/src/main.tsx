import React from "react";
import ReactDOM from "react-dom/client";
import ShikakuApp from "./ShikakuApp";
import "../../shell/src/index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <div className="p-8 flex justify-center">
      <ShikakuApp />
    </div>
  </React.StrictMode>
);
