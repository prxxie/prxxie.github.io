import React from "react";
import ReactDOM from "react-dom/client";
import PostsApp from "./PostsApp";
import "../../shell/src/index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <div className="p-4 w-[500px]">
        <PostsApp />
      </div>
    </QueryClientProvider>
  </React.StrictMode>
);
