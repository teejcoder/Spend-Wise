import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import Login from './pages/Login';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId="110739623713-47g2l3ftq6qu3v2t9hj81q03r41lmk62.apps.googleusercontent.com">
      <React.StrictMode>
      <Login />
          <App />
          
      </React.StrictMode>
  </GoogleOAuthProvider>,
  document.getElementById('root')
);
