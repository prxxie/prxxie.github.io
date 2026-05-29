import React from 'react';
import ReactDOM from 'react-dom/client';
import ShikakuApp from './ShikakuApp';
import '../../shell/src/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="p-8 flex justify-center">
      <ShikakuApp />
    </div>
  </React.StrictMode>
);
