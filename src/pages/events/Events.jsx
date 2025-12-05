// src_frontend/pages/events/Events.jsx

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import {
    getBandEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
} from '../../services/eventApi.js'

import Button from '../../components/Button.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'

import EventCard from '../events/components/EventCard.jsx'
import EventFormModal from './EventFormModal.jsx'
import EventViewModal from './EventViewModal.jsx'

export default function Events() {
    const { id: bandId } = useParams()

    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(false)

    const [selectedEvent, setSelectedEvent] = useState(null)   // para visualizar detalhes
    const [formOpen, setFormOpen] = useState(false)            // modal create/edit
    const [editingEvent, setEditingEvent] = useState(null)     // null = create
    const [eventToDelete, setEventToDelete] = useState(null)   // para ConfirmDialog

    async function loadEvents() {
        try {
            setLoading(true)
            const data = await getBandEvents(bandId)
            setEvents(data)
        } catch (err) {
            console.error(err)
            toast.error('Erro ao carregar eventos da banda.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadEvents()
    }, [bandId])

    async function handleOpenDetails(eventId) {
        try {
            const data = await getEventById(eventId)
            setSelectedEvent(data)
        } catch (err) {
            console.error(err)
            toast.error('Erro ao carregar detalhes do evento.')
        }
    }

    function handleOpenCreate() {
        setEditingEvent(null)
        setFormOpen(true)
    }

    function handleOpenEdit() {
        if (!selectedEvent) return
        setEditingEvent(selectedEvent)
        setFormOpen(true)
    }

    async function handleSubmitForm(formData) {
        try {
            if (editingEvent) {
                await updateEvent(editingEvent.id, formData)
                toast.success('Evento atualizado com sucesso!')
            } else {
                await createEvent(bandId, formData)
                toast.success('Evento criado com sucesso!')
            }

            setFormOpen(false)
            setEditingEvent(null)
            setSelectedEvent(null)
            await loadEvents()
        } catch (err) {
            console.error(err)
            toast.error('Erro ao salvar evento.')
        }
    }

    async function handleConfirmDelete() {
        try {
            await deleteEvent(eventToDelete.id)
            toast.success('Evento excluído com sucesso!')
            setEventToDelete(null)
            setSelectedEvent(null)
            await loadEvents()
        } catch (err) {
            console.error(err)
            toast.error('Erro ao excluir evento.')
        }
    }

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-[#c4b5ff]">Eventos</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Gerencie os eventos da banda: cultos, ensaios, conferências…
                    </p>
                </div>

                <Button onClick={handleOpenCreate}>
                    Novo evento
                </Button>
            </div>

            {/* Lista */}
            {loading ? (
                <p className="text-sm text-gray-400">Carregando eventos…</p>
            ) : events.length === 0 ? (
                <p className="text-sm text-gray-400">
                    Nenhum evento cadastrado ainda. Clique em <span className="font-semibold">Novo evento</span> para começar.
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {events.map(ev => (
                        <EventCard
                            key={ev.id}
                            event={ev}
                            onClick={() => handleOpenDetails(ev.id)}
                        />
                    ))}
                </div>
            )}

            {/* Modal de detalhes */}
            <EventViewModal
                open={!!selectedEvent}
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onEdit={handleOpenEdit}
                onDelete={() => setEventToDelete(selectedEvent)}
            />

            {/* Modal de criação/edição */}
            <EventFormModal
                open={formOpen}
                event={editingEvent}
                onClose={() => {
                    setFormOpen(false)
                    setEditingEvent(null)
                }}
                onSubmit={handleSubmitForm}
            />

            {/* Confirmação de exclusão */}
            <ConfirmDialog
                open={!!eventToDelete}
                title="Excluir evento"
                message={
                    eventToDelete
                        ? `Tem certeza que deseja excluir o evento "${eventToDelete.name}"? Essa ação não pode ser desfeita.`
                        : ''
                }
                onConfirm={handleConfirmDelete}
                onCancel={() => setEventToDelete(null)}
            />
        </div>
    )
}
