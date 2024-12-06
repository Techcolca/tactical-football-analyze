import React from 'react';
import { motion } from 'framer-motion';
import { RoomUser } from '../../types/collaboration';

interface UserListProps {
  users: RoomUser[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'coach':
        return 'text-[#DAA520]';
      case 'analyst':
        return 'text-blue-400';
      case 'viewer':
        return 'text-gray-400';
      default:
        return 'text-white';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'coach':
        return 'sports';
      case 'analyst':
        return 'analytics';
      case 'viewer':
        return 'visibility';
      default:
        return 'person';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-[#DAA520] font-bold text-lg mb-4">
        Participantes
      </h3>

      <div className="space-y-2">
        {users.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`flex items-center space-x-2 p-2 rounded-lg ${
              user.isActive ? 'bg-[#1A1A1A]' : 'bg-[#2C2C2C] opacity-50'
            }`}
          >
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#3C3C3C] flex items-center justify-center">
                  <span className="material-icons text-[#DAA520]">
                    {getRoleIcon(user.role)}
                  </span>
                </div>
              )}
              {user.isActive && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1A1A1A]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <span className="font-medium text-white truncate">
                  {user.name}
                </span>
                {user.lastAction && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-2 text-xs text-gray-400"
                  >
                    {user.lastAction === 'formation_update' ? 'editando formación' : 
                     user.lastAction === 'analysis_update' ? 'analizando' : ''}
                  </motion.span>
                )}
              </div>
              <div className={`text-xs ${getRoleColor(user.role)}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </div>
            </div>

            {user.isActive && user.lastAction && (
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  transition: { repeat: Infinity, duration: 2 }
                }}
                className="w-2 h-2 rounded-full bg-[#DAA520]"
              />
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-[#1A1A1A] rounded-lg">
        <h4 className="text-[#DAA520] font-medium mb-2">Roles</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center space-x-2">
            <span className="material-icons text-[#DAA520]">sports</span>
            <span className="text-white">Coach - Control total</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="material-icons text-blue-400">analytics</span>
            <span className="text-white">Analista - Puede editar</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="material-icons text-gray-400">visibility</span>
            <span className="text-white">Observador - Solo vista</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;
