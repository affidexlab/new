import { useContext } from 'react';
import { DecaFlowContext } from '../components/DecaFlowProvider';

export function useDecaFlow() {
  const context = useContext(DecaFlowContext);
  
  if (!context) {
    throw new Error('useDecaFlow must be used within DecaFlowProvider');
  }
  
  return context;
}
