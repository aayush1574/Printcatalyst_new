import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getWsUrl } from '../config';

const SocketContext = createContext(null);

// Web Audio synthesizer for alert sound
function playOrderChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    
    // Pleasant dual chime
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.25); // D6
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    // Audio might be blocked if user hasn't interacted yet
  }
}

export function SocketProvider({ children }) {
  const { merchant } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [latestEvent, setLatestEvent] = useState(null);
  const reconnectTimeout = useRef(null);

  useEffect(() => {
    let ws;
    const connectWS = () => {
      const wsUrl = getWsUrl();
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setConnected(true);
        if (merchant) {
          ws.send(JSON.stringify({
            type: 'REGISTER_MERCHANT',
            shopId: merchant.id
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLatestEvent(data);
          if (data.type === 'NEW_ORDER') {
            playOrderChime();
          }
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        reconnectTimeout.current = setTimeout(connectWS, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };

      setSocket(ws);
    };

    connectWS();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [merchant?.id]);

  return (
    <SocketContext.Provider value={{ socket, connected, latestEvent, playOrderChime }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
