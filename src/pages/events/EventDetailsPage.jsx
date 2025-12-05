// src_frontend/features/events/pages/EventDetailsPage.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {getEventById} from "../../services/eventApi.js";
import EventDetailsCard from "./components/EventDetailsCard.jsx";

export default function EventDetailsPage() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);

    useEffect(() => {
        async function load() {
            const data = await getEventById(id);
            setEvent(data);
        }
        load();
    }, [id]);

    if (!event) return <p className="p-6 text-neutral-500">Carregando...</p>;

    return (
        <div className="p-6">
            <EventDetailsCard event={event} />
        </div>
    );
}
