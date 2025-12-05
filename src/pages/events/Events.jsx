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
    deleteEvent,
    importHolyricsEvents
} from '../../services/eventApi.js'

import Button from '../../components/Button.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'

import EventCard from "./components/EventCard.jsx";
import EventFormModal from './EventFormModal.jsx'
import EventViewModal from './EventViewModal.jsx'
import EventFilterBar from './EventFilterBar.jsx'

export default function Events() {
    const { id: bandId } = useParams()

    const now = new Date()
    const today = new Date().toISOString().slice(0, 10)
    const importKey = `holyrics_import_${bandId}`

    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(false)

    const [selectedEvent, setSelectedEvent] = useState(null)
    const [formOpen, setFormOpen] = useState(false)
    const [editingEvent, setEditingEvent] = useState(null)
    const [eventToDelete, setEventToDelete] = useState(null)
    const [filter, setFilter] = useState("now")

    /** Atualiza apenas 1 evento da lista */
    function updateEventInList(eventId, newData) {
        setEvents(prev =>
            prev.map(ev =>
                ev.id === eventId ? { ...ev, ...newData } : ev
            )
        )
    }

    async function autoImportHolyricsOncePerDay() {
        try {
            const lastImport = localStorage.getItem(importKey)
            if (lastImport === today) return

            const now = new Date()
            const month = now.getMonth() + 1
            const year = now.getFullYear()
            const month_year = Number(`${year}${String(month).padStart(2, "0")}`)

            await importHolyricsEvents(bandId, month, year, month_year)

            localStorage.setItem(importKey, today)
        } catch (err) {
            console.error("Erro ao importar eventos do Holyrics:", err)
        }
    }

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

            const now = new Date()

            if (filter === "past") {
                data.sort((a, b) => new Date(b.startingTime) - new Date(a.startingTime))
            } else if (filter === "future" || filter === "now") {
                data.sort((a, b) => new Date(a.startingTime) - new Date(b.startingTime))
            } else {
                data.sort((a, b) => {
                    const aStart = new Date(a.startingTime)
                    const bStart = new Date(b.startingTime)

                    const aEnded = new Date(a.endingTime) < now
                    const bEnded = new Date(b.endingTime) < now

                    const aIsToday = aStart <= now && new Date(a.endingTime) >= now
                    const bIsToday = bStart <= now && new Date(b.endingTime) >= now

                    if (aIsToday && !bIsToday) return -1
                    if (!aIsToday && bIsToday) return 1

                    if (!aEnded && bEnded) return -1
                    if (aEnded && !bEnded) return 1

                    if (!aEnded && !bEnded)
                        return aStart - bStart

                    return bStart - aStart
                })
            }

            setEvents(data)

        } catch (err) {
            console.error(err)
            toast.error("Erro ao carregar eventos.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        async function run() {
            await autoImportHolyricsOncePerDay()
            await loadEvents()
        }
        run()
    }, [bandId, filter])


    async function handleOpenDetails(eventId) {
        try {
            const data = await getEventById(eventId)
            setSelectedEvent(data)
        } catch {
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
                toast.success("Evento atualizado!")
            } else {
                await createEvent(bandId, formData)
                toast.success("Evento criado!")
            }

            setFormOpen(false)
            setEditingEvent(null)
            setSelectedEvent(null)

            await loadEvents()

        } catch {
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

        } catch {
            toast.error("Erro ao excluir evento.")
        }
    }

    return (
        <div className="space-y-6">

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

            <EventFilterBar
                current={filter}
                onChange={setFilter}
            />

            {loading ? (
                <p className="text-gray-400 text-sm">Carregando eventos…</p>
            ) : events.length === 0 ? (
                <p className="text-gray-400 text-sm">
                    Nenhum evento encontrado.
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

            <EventViewModal
                open={!!selectedEvent}
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onEdit={handleOpenEdit}
                onDelete={() => setEventToDelete(selectedEvent)}
                onUpdated={(changes) => {
                    if (selectedEvent) {
                        updateEventInList(selectedEvent.id, changes)
                    }
                    loadEvents()
                }}
            />

            <EventFormModal
                open={formOpen}
                event={editingEvent}
                onClose={() => {
                    setFormOpen(false)
                    setEditingEvent(null)
                }}
                onSubmit={handleSubmitForm}
            />

            <ConfirmDialog
                open={!!eventToDelete}
                title="Excluir evento"
                message={
                    eventToDelete
                        ? `Deseja excluir o evento "${eventToDelete.name}"?`
                        : ""
                }
                onConfirm={handleConfirmDelete}
                onCancel={() => setEventToDelete(null)}
            />

        </div>
    )
}
