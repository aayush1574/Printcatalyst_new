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
    let isCancelled = false;

    const connectWS = () => {
      if (isCancelled) return;
      try {
        const wsUrl = getWsUrl();
        if (!wsUrl || (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://'))) {
          return;
        }

        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (isCancelled) return;
          setConnected(true);
          if (merchant) {
            ws.send(JSON.stringify({
              type: 'REGISTER_MERCHANT',
              shopId: merchant.id
            }));
          }
        };

        ws.onmessage = (event) => {
          if (isCancelled) return;
          try {
            const data = JSON.parse(event.data);
            setLatestEvent(data);
            if (data.type === 'NEW_ORDER') {
              playOrderChime();
            }
          } catch (e) {
            // Ignore parse errors
          }
        };

        ws.onclose = () => {
          if (isCancelled) return;
          setConnected(false);
          // Only attempt reconnect if merchant is logged in
          if (merchant) {
            reconnectTimeout.current = setTimeout(connectWS, 5000);
          }
        };

        ws.onerror = () => {
          try {
            ws.close();
          } catch (e) {}
        };

        setSocket(ws);
      } catch (e) {
        // Suppress initial WS connection error on static frontend hosts without backend env
      }
    };

    // Only initiate WS if merchant is active or explicit backend url provided
    if (merchant || import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL) {
      connectWS();
    }

    return () => {
      isCancelled = true;
      if (ws) {
        try { ws.close(); } catch (e) {}
      }
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
