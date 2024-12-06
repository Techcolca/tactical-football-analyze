import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  error: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Inicializar Socket.IO
    const socketInstance = io(process.env.REACT_APP_API_URL || 'http://localhost:3001', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Manejadores de eventos
    socketInstance.on('connect', () => {
      console.log('Socket conectado');
      setConnected(true);
      setError(null);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Error de conexión:', err);
      setError('Error al conectar con el servidor');
      setConnected(false);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket desconectado:', reason);
      setConnected(false);
      
      if (reason === 'io server disconnect') {
        // Desconexión iniciada por el servidor
        setError('Desconectado por el servidor');
      } else {
        // Intentar reconectar automáticamente
        socketInstance.connect();
      }
    });

    socketInstance.on('error', (error: any) => {
      console.error('Error de socket:', error);
      setError(error.message || 'Error en la conexión');
    });

    // Ping/Pong para mantener la conexión activa
    const pingInterval = setInterval(() => {
      if (socketInstance.connected) {
        socketInstance.emit('ping');
      }
    }, 30000);

    setSocket(socketInstance);

    // Limpieza
    return () => {
      clearInterval(pingInterval);
      socketInstance.disconnect();
    };
  }, [token]);

  // Reconexión manual
  const reconnect = () => {
    if (socket) {
      socket.connect();
    }
  };

  // Manejador de errores de red
  useEffect(() => {
    const handleOnline = () => {
      console.log('Conexión de red restaurada');
      reconnect();
    };

    const handleOffline = () => {
      console.log('Conexión de red perdida');
      setError('Sin conexión a internet');
      setConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        error
      }}
    >
      {children}
      
      {/* Notificación de estado de conexión */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}
      
      {!connected && !error && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Reconectando...
        </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
