import { useState } from "react";
import { useParams } from "react-router-dom";
import {
    listHolyricsEvents,
    importHolyricsEvents
} from "../../services/holyricsApi";
import Button from "../../components/Button";
import toast from "react-hot-toast";

export default function HolyricsEvents() {
    const { id: bandId } = useParams();

    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [events, setEvents] = useState([]);

    async function handleList() {
        try {
            const data = await listHolyricsEvents(bandId, { month, year });
            setEvents(data);
        } catch {
            toast.error("Erro ao consultar eventos.");
        }
    }

    async function handleImport() {
        try {
            await importHolyricsEvents(bandId, { month, year });
            toast.success("Eventos importados com sucesso!");
        } catch {
            toast.error("Erro ao importar eventos.");
        }
    }

    return (
        <div className="space-y-6">

            {/* Título */}
            <h1 className="text-2xl font-semibold">Eventos do Holyrics</h1>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-4 max-w-md">

                <div>
                    <label className="block mb-1 text-sm">Mês</label>
                    <input
                        type="number"
                        className="w-full bg-[#111118] border border-[#2a2a30] rounded-lg p-2"
                        value={month}
                        onChange={e => setMonth(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block mb-1 text-sm">Ano</label>
                    <input
                        type="number"
                        className="w-full bg-[#111118] border border-[#2a2a30] rounded-lg p-2"
                        value={year}
                        onChange={e => setYear(e.target.value)}
                    />
                </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
                <Button onClick={handleList}>Consultar Eventos</Button>

                <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleImport}
                >
                    Importar para o ScaleFlow
                </Button>
            </div>

            {/* LISTA DE EVENTOS */}
            <div className="space-y-4 mt-6">
                {events.length === 0 && (
                    <p className="text-gray-500 text-sm">Nenhum evento encontrado.</p>
                )}

                {events.map((ev, index) => {
                    const dateFormatted = ev.startingTime
                        ? new Date(ev.startingTime).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        })
                        : "Sem data";

                    return (
                        <div
                            key={index}
                            className="bg-[#1b1b1f] border border-[#2a2a30] p-5 rounded-xl shadow hover:bg-[#1f1f23] transition"
                        >
                            {/* Nome */}
                            <h2 className="text-lg font-semibold mb-1">{ev.name || "Sem nome"}</h2>

                            {/* Removido: NÃO mostrar mais ev.type */}

                            {/* Data */}
                            <p className="text-gray-300 text-sm">{dateFormatted}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
