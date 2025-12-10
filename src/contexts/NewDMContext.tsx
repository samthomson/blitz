import { createContext, useContext, ReactNode } from 'react';

interface NewDMContextValue {
  // TODO: add context values
}

const NewDMContext = createContext<NewDMContextValue | undefined>(undefined);

export function NewDMProvider({ children }: { children: ReactNode }) {
  const value: NewDMContextValue = {
    // TODO: add context values
  };

  return (
    <NewDMContext.Provider value={value}>
      {children}
    </NewDMContext.Provider>
  );
}

export function useNewDMContext(): NewDMContextValue {
  const context = useContext(NewDMContext);
  if (!context) {
    throw new Error('useNewDMContext must be used within a NewDMProvider');
  }
  return context;
}
