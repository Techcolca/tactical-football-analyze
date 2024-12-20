"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisHandler = void 0;
const auth_1 = require("../../middleware/auth");
class AnalysisHandler {
    constructor(io, roomManager, openAIService) {
        this.io = io;
        this.roomManager = roomManager;
        this.openAIService = openAIService;
    }
    handleConnection(socket) {
        // Actualizar análisis
        socket.on('analysis:update', async (data) => {
            var _a;
            try {
                const user = await (0, auth_1.verifyToken)(socket.handshake.auth.token);
                const room = this.roomManager.getRoom(data.roomId);
                if (!room) {
                    throw new Error('Room not found');
                }
                const roomUser = room.users.find(u => u.id === user.id);
                if (!roomUser || (roomUser.role !== 'coach' && roomUser.role !== 'analyst')) {
                    throw new Error('Unauthorized to update analysis');
                }
                // Validar el análisis
                this.validateAnalysis(data.analysis);
                // Actualizar el análisis en la sala
                room.analysis = {
                    ...data.analysis,
                    version: (((_a = room.analysis) === null || _a === void 0 ? void 0 : _a.version) || 0) + 1
                };
                // Solicitar sugerencias de la IA si hay cambios significativos
                if (data.analysis.description && data.analysis.description.length > 50) {
                    try {
                        const aiSuggestions = await this.openAIService.getAnalysisSuggestions({
                            formation: room.formation,
                            analysis: data.analysis,
                            context: {
                                previousAnalysis: room.analysis.description,
                                tacticalChanges: room.formation.tactics
                            }
                        });
                        room.analysis.aiSuggestions = aiSuggestions;
                    }
                    catch (error) {
                        console.error('Error getting AI suggestions:', error);
                    }
                }
                // Notificar a todos los usuarios en la sala
                this.io.to(data.roomId).emit('analysis:updated', {
                    analysis: room.analysis,
                    updatedBy: {
                        id: user.id,
                        name: user.name,
                        role: roomUser.role
                    }
                });
                // Actualizar el estado del usuario
                roomUser.lastAction = 'analysis_update';
                roomUser.lastActionTimestamp = Date.now();
                this.io.to(data.roomId).emit('user:action', {
                    userId: user.id,
                    action: 'analysis_update',
                    timestamp: roomUser.lastActionTimestamp
                });
            }
            catch (error) {
                socket.emit('error', {
                    type: 'analysis:update',
                    message: error.message
                });
            }
        });
        // Solicitar sugerencias de la IA
        socket.on('analysis:request-suggestions', async (data) => {
            try {
                const user = await (0, auth_1.verifyToken)(socket.handshake.auth.token);
                const room = this.roomManager.getRoom(data.roomId);
                if (!room) {
                    throw new Error('Room not found');
                }
                const roomUser = room.users.find(u => u.id === user.id);
                if (!roomUser) {
                    throw new Error('User not found in room');
                }
                // Emitir evento de "escribiendo"
                this.io.to(data.roomId).emit('analysis:ai-typing', {
                    status: 'started'
                });
                // Obtener sugerencias de la IA
                const aiSuggestions = await this.openAIService.getAnalysisSuggestions({
                    formation: room.formation,
                    analysis: room.analysis,
                    context: {
                        userPrompt: data.context,
                        previousAnalysis: room.analysis.description,
                        tacticalChanges: room.formation.tactics
                    }
                });
                // Actualizar el análisis con las sugerencias
                room.analysis.aiSuggestions = aiSuggestions;
                // Crear mensaje del sistema con las sugerencias
                const aiMessage = {
                    id: `ai_${Date.now()}`,
                    userId: 'system',
                    userName: 'AI Assistant',
                    userRole: 'system',
                    content: aiSuggestions.join('\n\n'),
                    type: 'analysis',
                    timestamp: Date.now()
                };
                room.messages.push(aiMessage);
                // Notificar que la IA terminó de escribir
                this.io.to(data.roomId).emit('analysis:ai-typing', {
                    status: 'completed'
                });
                // Emitir las sugerencias
                this.io.to(data.roomId).emit('analysis:suggestions', {
                    suggestions: aiSuggestions,
                    message: aiMessage
                });
            }
            catch (error) {
                socket.emit('error', {
                    type: 'analysis:request-suggestions',
                    message: error.message
                });
                this.io.to(data.roomId).emit('analysis:ai-typing', {
                    status: 'error'
                });
            }
        });
        // Agregar etiquetas al análisis
        socket.on('analysis:add-tag', async (data) => {
            try {
                const user = await (0, auth_1.verifyToken)(socket.handshake.auth.token);
                const room = this.roomManager.getRoom(data.roomId);
                if (!room) {
                    throw new Error('Room not found');
                }
                const roomUser = room.users.find(u => u.id === user.id);
                if (!roomUser || (roomUser.role !== 'coach' && roomUser.role !== 'analyst')) {
                    throw new Error('Unauthorized to add tags');
                }
                // Validar la etiqueta
                if (!data.tag || data.tag.trim().length === 0) {
                    throw new Error('Tag cannot be empty');
                }
                // Agregar la etiqueta si no existe
                const normalizedTag = data.tag.trim().toLowerCase();
                if (!room.analysis.tags.includes(normalizedTag)) {
                    room.analysis.tags.push(normalizedTag);
                    // Notificar a todos los usuarios en la sala
                    this.io.to(data.roomId).emit('analysis:tag-added', {
                        tag: normalizedTag,
                        addedBy: {
                            id: user.id,
                            name: user.name,
                            role: roomUser.role
                        }
                    });
                }
            }
            catch (error) {
                socket.emit('error', {
                    type: 'analysis:add-tag',
                    message: error.message
                });
            }
        });
    }
    validateAnalysis(analysis) {
        if (!analysis.title || analysis.title.trim().length === 0) {
            throw new Error('Analysis title is required');
        }
        if (!analysis.description) {
            analysis.description = '';
        }
        if (!Array.isArray(analysis.tags)) {
            analysis.tags = [];
        }
        if (!Array.isArray(analysis.aiSuggestions)) {
            analysis.aiSuggestions = [];
        }
        // Validar longitud máxima del título y descripción
        if (analysis.title.length > 200) {
            throw new Error('Analysis title is too long (max 200 characters)');
        }
        if (analysis.description.length > 5000) {
            throw new Error('Analysis description is too long (max 5000 characters)');
        }
        // Validar formato de las etiquetas
        analysis.tags = analysis.tags.map(tag => {
            if (typeof tag !== 'string') {
                throw new Error('Invalid tag format');
            }
            return tag.trim().toLowerCase();
        });
        // Eliminar etiquetas duplicadas
        analysis.tags = [...new Set(analysis.tags)];
    }
}
exports.AnalysisHandler = AnalysisHandler;
//# sourceMappingURL=analysisHandler.js.map