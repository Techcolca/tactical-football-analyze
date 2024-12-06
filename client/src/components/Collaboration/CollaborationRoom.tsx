import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';
import CollaborationChat from './CollaborationChat';
import UserList from './UserList';
import TacticalBoard from '../TacticalBoard';
import { ChatMessage, RoomUser } from '../../types/collaboration';

interface CollaborationRoomProps {
  roomId: string;
}

const CollaborationRoom: React.FC<CollaborationRoomProps> = ({ roomId }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [roomState, setRoomState] = useState<any>(null);
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [cursors, setCursors] = useState<{ [key: string]: { x: number; y: number } }>({});
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket || !user) return;

    // Unirse a la sala
    socket.emit('joinRoom', roomId);

    // Escuchar eventos de la sala
    socket.on('roomState', ({ room }) => {
      setRoomState(room);
      setUsers(room.users);
      setChat(room.chat);
    });

    socket.on('userJoined', ({ user: newUser, message }) => {
      setUsers(prev => [...prev, newUser]);
      addSystemMessage(message);
    });

    socket.on('userLeft', ({ userId, message }) => {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isActive: false } : u
      ));
      addSystemMessage(message);
    });

    socket.on('formationUpdated', ({ formation, updatedBy }) => {
      setRoomState(prev => ({ ...prev, formation }));
      addSystemMessage(`${updatedBy.name} ha actualizado la formación`);
    });

    socket.on('analysisUpdated', ({ analysis, updatedBy }) => {
      setRoomState(prev => ({ ...prev, analysis }));
      addSystemMessage(`${updatedBy.name} ha actualizado el análisis`);
    });

    socket.on('cursorMoved', ({ userId, userName, position }) => {
      if (userId !== user.id) {
        setCursors(prev => ({
          ...prev,
          [userId]: position
        }));
      }
    });

    socket.on('tacticalDrawUpdate', ({ userId, userName, path }) => {
      if (userId !== user.id) {
        // Actualizar dibujos tácticos
        updateTacticalDrawings(path);
      }
    });

    socket.on('error', ({ message }) => {
      // Mostrar error en UI
      console.error(message);
    });

    return () => {
      socket.off('roomState');
      socket.off('userJoined');
      socket.off('userLeft');
      socket.off('formationUpdated');
      socket.off('analysisUpdated');
      socket.off('cursorMoved');
      socket.off('tacticalDrawUpdate');
      socket.off('error');
    };
  }, [socket, user, roomId]);

  const addSystemMessage = (content: string) => {
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'system',
      userName: 'Sistema',
      content,
      timestamp: new Date(),
      type: 'system'
    };
    setChat(prev => [...prev, systemMessage]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!socket || !boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    socket.emit('cursorMove', {
      roomId,
      x,
      y
    });
  };

  const handleFormationUpdate = (formation: any) => {
    if (!socket || !canEdit()) return;

    socket.emit('formationUpdate', {
      roomId,
      formation
    });
  };

  const handleAnalysisUpdate = (analysis: any) => {
    if (!socket || !canEdit()) return;

    socket.emit('analysisUpdate', {
      roomId,
      analysis
    });
  };

  const canEdit = () => {
    return roomState?.permissions[user?.id]?.canEdit || false;
  };

  const updateTacticalDrawings = (path: any) => {
    // Implementar lógica para actualizar dibujos tácticos
  };

  return (
    <div className="flex h-screen bg-[#1A1A1A]">
      {/* Panel lateral de usuarios */}
      <div className="w-64 bg-[#2C2C2C] p-4">
        <UserList users={users} />
      </div>

      {/* Área principal */}
      <div className="flex-1 flex flex-col">
        {/* Barra superior */}
        <div className="h-16 bg-[#0A2342] flex items-center px-6">
          <h1 className="text-[#DAA520] text-xl font-bold">
            {roomState?.name || 'Sala de Análisis'}
          </h1>
        </div>

        {/* Área de trabajo */}
        <div className="flex-1 flex">
          {/* Pizarra táctica */}
          <div 
            ref={boardRef}
            className="flex-1 relative"
            onMouseMove={handleMouseMove}
          >
            <TacticalBoard
              formation={roomState?.formation}
              onFormationUpdate={handleFormationUpdate}
              isEditable={canEdit()}
            />

            {/* Cursores de otros usuarios */}
            <AnimatePresence>
              {Object.entries(cursors).map(([userId, position]) => (
                <motion.div
                  key={userId}
                  className="absolute pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: 1,
                    x: `${position.x}%`,
                    y: `${position.y}%`
                  }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex flex-col items-center">
                    <span className="material-icons text-[#DAA520]">
                      sports_soccer
                    </span>
                    <span className="text-xs text-white bg-[#2C2C2C] px-2 py-1 rounded">
                      {users.find(u => u.id === userId)?.name}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Chat y análisis */}
          <div className="w-96 bg-[#2C2C2C] flex flex-col">
            <CollaborationChat
              messages={chat}
              roomId={roomId}
              canChat={roomState?.permissions[user?.id]?.canChat}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationRoom;
