import { useContext } from 'react';
import { DocumentContext, DocumentContextProps } from '../context/DocumentContext';

export function useDocumentContext(): DocumentContextProps {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocumentContext must be used within DocumentProvider');
  }
  return context;
}
