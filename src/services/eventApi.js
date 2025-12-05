
import api from './api'

// Lista todos os eventos da banda
export async function getBandEvents(bandId) {
    const { data } = await api.get(`/bands/${bandId}/events`)
    return data
}

// Detalhes de um evento específico
export async function getEventById(eventId) {
    const { data } = await api.get(`/events/${eventId}`)
    return data
}

// Criar evento para a banda
export async function createEvent(bandId, body) {
    const { data } = await api.post(`/bands/${bandId}/events`, body)
    return data
}

// Editar evento
export async function updateEvent(eventId, body) {
    const { data } = await api.put(`/events/${eventId}`, body)
    return data
}

// Deletar evento
export async function deleteEvent(eventId) {
    await api.delete(`/events/${eventId}`)
}
