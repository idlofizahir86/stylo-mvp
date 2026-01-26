import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'

// Initialize Firebase test
const initApp = async () => {
  try {
    // You can add any initialization logic here
    console.log('Stylo MVP initializing...');
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
};

// Start initialization
initApp();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)