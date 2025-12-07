// src/services/escalationApi.js
import api from "./api";

// Listar escalações de um evento
export async function getEscalations(eventId) {
    const res = await api.get(`/events/${eventId}/escalations`);
    return res.data;
}

// Criar nova escalação para o evento
// payload: { userId, roleId }
export async function createEscalation(eventId, payload) {
    const res = await api.post(`/events/${eventId}/escalations`, payload);
    return res.data;
}

// Remover escalação
export async function deleteEscalation(escalationId) {
    await api.delete(`/escalations/${escalationId}`);
}
