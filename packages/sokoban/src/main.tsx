import React from "react";
import ReactDOM from "react-dom/client";
import SokobanApp from "./SokobanApp";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="p-8 flex justify-center">
      <SokobanApp />
    </div>
  </React.StrictMode>
);
