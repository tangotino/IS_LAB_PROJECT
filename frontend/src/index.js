import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Optional, if you want to style your app
import App from './App'; // This is where your main component will be
import 'bootstrap/dist/css/bootstrap.min.css';


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
