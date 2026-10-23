import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppRoutes } from "./routes";
import { ProgressServiceProvider } from "./hooks/useProgressService";

const queryClient = new QueryClient();

const router = createBrowserRouter(createAppRoutes());

export { createAppRoutes };

export default function App(): React.ReactElement {
  return (
    <ProgressServiceProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ProgressServiceProvider>
  );
}
