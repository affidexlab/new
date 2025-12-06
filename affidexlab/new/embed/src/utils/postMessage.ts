export enum EventType {
  READY = 'READY',
  SWAP_REQUESTED = 'SWAP_REQUESTED',
  SWAP_SUBMITTED = 'SWAP_SUBMITTED',
  SWAP_CONFIRMED = 'SWAP_CONFIRMED',
  BRIDGE_REQUESTED = 'BRIDGE_REQUESTED',
  BRIDGE_SUBMITTED = 'BRIDGE_SUBMITTED',
  BRIDGE_CONFIRMED = 'BRIDGE_CONFIRMED',
  ERROR = 'ERROR'
}

export interface MessagePayload {
  type: EventType;
  data: any;
  timestamp: string;
}

export function sendMessage(type: EventType, data: any) {
  if (window.parent && window.parent !== window) {
    const message: MessagePayload = {
      type,
      data,
      timestamp: new Date().toISOString()
    };
    
    window.parent.postMessage(message, '*');
  }
}

export function setupMessageListener(callback: (message: MessagePayload) => void) {
  const handler = (event: MessageEvent) => {
    if (event.data && event.data.type) {
      callback(event.data as MessagePayload);
    }
  };

  window.addEventListener('message', handler);
  
  return () => window.removeEventListener('message', handler);
}
