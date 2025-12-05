// src_frontend/features/events/pages/EventListPage.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {getAllEvents} from "../../services/eventApi.js";
import EventCard from "./components/EventCard.jsx";

export default function EventListPage() {
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function load() {
            try {
                const data = await getAllEvents();
                setEvents(data);
            } catch (error) {
                console.error("Erro ao carregar eventos:", error);
            }
        }
        load();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-violet-600 dark:text-violet-400 mb-6">
                Eventos
            </h1>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => (
                    <EventCard
                        key={event.id}
                        event={event}
                        onClick={() => navigate(`/events/${event.id}`)}
                    />
                ))}
            </div>
        </div>
    );
}
