import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import {
    getBandEvents,
    getBandEventsToday,
    getBandEventsFuture,
    getBandEventsPast,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
} from '../../services/eventApi.js'

import Button from '../../components/Button.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'

import EventCard from "./components/EventCard.jsx";
import EventFormModal from './EventFormModal.jsx'
import EventViewModal from './EventViewModal.jsx'
import EventFilterBar from './EventFilterBar.jsx'

export default function Events() {
    const { id: bandId } = useParams()

    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(false)

    const [selectedEvent, setSelectedEvent] = useState(null)
    const [formOpen, setFormOpen] = useState(false)
    const [editingEvent, setEditingEvent] = useState(null)
    const [eventToDelete, setEventToDelete] = useState(null)
    const [filter, setFilter] = useState("now")


    async function loadEvents() {
        try {
            setLoading(true)

            let data = []

            if (filter === "now") {
                data = await getBandEventsToday(bandId)
            } else if (filter === "future") {
                data = await getBandEventsFuture(bandId)
            } else if (filter === "past") {
                data = await getBandEventsPast(bandId)
            } else {
                data = await getBandEvents(bandId)
            }

            // =============================
            // ORDENAR EVENTOS
            // =============================

            const now = new Date()

            if (filter === "past") {
                // passado → mais recente para mais antigo
                data.sort((a, b) => new Date(b.startingTime) - new Date(a.startingTime))

            } else if (filter === "future" || filter === "now") {
                // futuro/hoje → mais próximo para mais distante
                data.sort((a, b) => new Date(a.startingTime) - new Date(b.startingTime))

            } else {
                // =============================
                // FILTRO "TODOS"
                // =============================

                data.sort((a, b) => {
                    const aStart = new Date(a.startingTime)
                    const bStart = new Date(b.startingTime)

                    const aEnded = new Date(a.endingTime) < now
                    const bEnded = new Date(b.endingTime) < now

                    const aIsToday = aStart <= now && new Date(a.endingTime) >= now
                    const bIsToday = bStart <= now && new Date(b.endingTime) >= now

                    // 1) HOJE primeiro
                    if (aIsToday && !bIsToday) return -1
                    if (!aIsToday && bIsToday) return 1

                    // 2) FUTUROS depois
                    if (!aEnded && bEnded) return -1
                    if (aEnded && !bEnded) return 1

                    // 3) FUTUROS → ordenação crescente
                    if (!aEnded && !bEnded)
                        return aStart - bStart

                    // 4) PASSADOS → ordenação decrescente
                    return bStart - aStart
                })
            }

            // AQUI ATUALIZA A LISTA
            setEvents(data)

        } catch (err) {
            console.error(err)
            toast.error("Erro ao carregar eventos.")
        } finally {
            setLoading(false)
        }
    }



    useEffect(() => {
        loadEvents()
    }, [bandId, filter])

    async function handleOpenDetails(eventId) {
        try {
            const data = await getEventById(eventId)
            setSelectedEvent(data)
        } catch (err) {
            toast.error("Erro ao carregar detalhes do evento.")
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
                toast.success("Evento atualizado com sucesso!")
            } else {
                await createEvent(bandId, formData)
                toast.success("Evento criado com sucesso!")
            }

            setFormOpen(false)
            setEditingEvent(null)
            setSelectedEvent(null)
            await loadEvents()
        } catch (err) {
            toast.error("Erro ao salvar evento.")
        }
    }

    async function handleConfirmDelete() {
        try {
            await deleteEvent(eventToDelete.id)
            toast.success("Evento excluído!")

            setEventToDelete(null)
            setSelectedEvent(null)

            await loadEvents()
        } catch (err) {
            toast.error("Erro ao excluir evento.")
        }
    }

    return (
        <div className="space-y-6">

            {/* Cabeçalho */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-[#c4b5ff]">Eventos</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Gerencie e filtre os eventos da banda
                    </p>
                </div>

                <Button onClick={handleOpenCreate}>
                    Novo evento
                </Button>
            </div>

            {/* Barra de filtros */}
            <EventFilterBar
                current={filter}
                onChange={setFilter}
            />

            {/* Lista de eventos */}
            {loading ? (
                <p className="text-sm text-gray-400">Carregando eventos…</p>
            ) : events.length === 0 ? (
                <p className="text-sm text-gray-400">
                    Nenhum evento encontrado para este filtro.
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

            {/* Diálogo de confirmação */}
            <ConfirmDialog
                open={!!eventToDelete}
                title="Excluir evento"
                message={
                    eventToDelete
                        ? `Deseja excluir o evento "${eventToDelete.name}"? Essa ação não pode ser desfeita.`
                        : ""
                }
                onConfirm={handleConfirmDelete}
                onCancel={() => setEventToDelete(null)}
            />

        </div>
    )
}
