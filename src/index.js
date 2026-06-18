import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Root from './Root';
import reportWebVitals from './reportWebVitals';

document.documentElement.classList.add("dark");

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

reportWebVitals();
