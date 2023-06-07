import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import Home from '../src/pages/Home'
import Login from '../src/pages/Login'
import Header from '../src/components/Header'
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId="110739623713-7u76ko4m7vmlpi5c98ajini35psuu9gi.apps.googleusercontent.com">
    
  <React.StrictMode>
    <App />
      <App />
      <Home />
      <Header />
      <Dashboard />
      <Transactions /> 
      <Login />

  </React.StrictMode>

</GoogleOAuthProvider>,
);

