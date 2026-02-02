// contexts/AIChatContext.jsx
import React, { createContext, useState, useContext } from 'react';

const AIChatContext = createContext();

export const AIChatProvider = ({ children }) => {
  const [showAIChat, setShowAIChat] = useState(false);

  return (
    <AIChatContext.Provider value={{ showAIChat, setShowAIChat }}>
      {children}
    </AIChatContext.Provider>
  );
};

export const useAIChat = () => {
  const context = useContext(AIChatContext);
  if (!context) {
    throw new Error('useAIChat must be used within AIChatProvider');
  }
  return context;
};