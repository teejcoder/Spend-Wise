import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>

    <GoogleOAuthProvider clientId="110739623713-47g2l3ftq6qu3v2t9hj81q03r41lmk62.apps.googleusercontent.com">
      <Routes>
        <Route path="/" component={App} />
        <Route path="/dashboard" component={Dashboard} />
      </Routes>
    </GoogleOAuthProvider>

    </Router>
  </React.StrictMode>,
);
