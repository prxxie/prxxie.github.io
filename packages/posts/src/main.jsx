import React from 'react';
import ReactDOM from 'react-dom/client';
import PostsApp from './PostsApp';
import '../../shell/src/index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <div className="p-4 w-[500px]">
        <PostsApp />
      </div>
    </QueryClientProvider>
  </React.StrictMode>
);
