import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getSocket } from '../services/socket';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, driver, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const activeSocket = getSocket();
    setSocket(activeSocket);

    if (activeSocket) {
      setIsConnected(activeSocket.connected);

      const onConnect = () => {
        setIsConnected(true);
        if (driver?._id) {
          activeSocket.emit('driver:join', driver._id);
        }
        if (user?.role === 'admin') {
          activeSocket.emit('admin:join');
        }
      };

      const onDisconnect = () => setIsConnected(false);

      activeSocket.on('connect', onConnect);
      activeSocket.on('disconnect', onDisconnect);

      if (activeSocket.connected) {
        onConnect();
      }

      return () => {
        activeSocket.off('connect', onConnect);
        activeSocket.off('disconnect', onDisconnect);
      };
    }
  }, [token, user, driver]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
