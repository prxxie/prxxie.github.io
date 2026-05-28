import React from 'react';
import ReactDOM from 'react-dom/client';
import AboutApp from './AboutApp';
import '../../shell/src/index.css'; // Share shell styling

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="p-4 w-[500px]">
      <AboutApp />
    </div>
  </React.StrictMode>
);
