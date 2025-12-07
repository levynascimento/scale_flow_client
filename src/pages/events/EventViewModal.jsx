import { useEffect, useState } from "react";
import Button from "../../components/Button";
import {
    getEventMusics,
    getEventSuggestions,
    addMusicToEvent,
    createSuggestion,
    acceptSuggestion,
    deleteSuggestion
} from "../../services/eventApi";
import SelectMusicModal from "./components/SelectMusicModal";
import toast from "react-hot-toast";
import { Users } from "lucide-react"; // ⬅ botão de escalação

export default function EventViewModal({ open, event, onClose, isAdmin, onUpdated, onEscalation }) {

    const [musics, setMusics] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [openAddModal, setOpenAddModal] = useState(false);
    const [openSuggestModal, setOpenSuggestModal] = useState(false);

    // ===============================
    // Carregar músicas e sugestões
    // ===============================
    async function loadData() {
        if (!event) return;

        try {
            const [evMusics, evSuggestions] = await Promise.all([
                getEventMusics(event.id),
                getEventSuggestions(event.id)
            ]);

            setMusics(evMusics);
            setSuggestions(evSuggestions);

        } catch (err) {
            console.error(err);
            toast.error("Erro ao carregar dados.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (open) {
            setLoading(true);
            loadData();
        }
    }, [open]);

    if (!open || !event) return null;

    // ===============================
    // Aceitar sugestão
    // ===============================
    async function handleAccept(id) {
        try {
            await acceptSuggestion(id);
            toast.success("Sugestão aceita!");

            await loadData();
            onUpdated?.();

        } catch (err) {
            console.error(err);
            toast.error("Erro ao aceitar.");
        }
    }

    // ===============================
    // Rejeitar sugestão
    // ===============================
    async function handleReject(id) {
        try {
            await deleteSuggestion(id);
            toast.success("Sugestão removida.");

            await loadData();
            onUpdated?.();

        } catch (err) {
            console.error(err);
            toast.error("Erro ao remover sugestão.");
        }
    }

    // ===============================
    // Quando MEMBER envia uma sugestão
    // ===============================
    async function handleSuggestionAdded() {
        try {
            const updated = await getEventSuggestions(event.id);

            setSuggestions(updated);

            onUpdated?.({ suggestionsCount: updated.length });

        } catch (err) {
            console.error(err);
        }
    }

    // ===============================
    // COMPONENTE
    // ===============================
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-start overflow-y-auto z-[9999] py-10">
            <div className="bg-[#1a1a1e] border border-[#2a2a30] rounded-2xl p-8 w-[90%] max-w-3xl text-gray-200 shadow-xl">

                {/* TÍTULO */}
                <h1 className="text-3xl font-bold mb-1">{event.name}</h1>
                <p className="text-gray-400 mb-4">
                    {new Date(event.startingTime).toLocaleString("pt-BR")}
                    {" → "}
                    {new Date(event.endingTime).toLocaleString("pt-BR")}
                </p>

                {/* BADGES */}
                <div className="flex gap-3 mb-6">

                    {/* ⬅ Escalações - usando event.escalationsCount */}
                    <span className="px-3 py-1 rounded-full bg-black/20 border border-black/40 text-sm">
                        Escalações: {event.escalationsCount ?? 0}
                    </span>

                    <span className="px-3 py-1 rounded-full bg-black/20 border border-black/40 text-sm">
                        Sugestões: {suggestions.length}
                    </span>

                    <span className="px-3 py-1 rounded-full bg-black/20 border border-black/40 text-sm">
                        Músicas escolhidas: {musics.length}
                    </span>
                </div>

                {/* BOTÃO → GERENCIAR ESCALAÇÃO */}
                <Button
                    className="w-full bg-[#2d2d34] hover:bg-[#3a3a42] mb-8 flex items-center justify-center gap-2"
                    onClick={() => {
                        // chama o modal de escalação no Events.jsx
                        onEscalation?.(event);
                    }}
                >
                    <Users size={18} />
                    Gerenciar Escalação
                </Button>

                {/* =============================== */}
                {/* MÚSICAS DO EVENTO */}
                {/* =============================== */}
                <h2 className="text-2xl font-semibold mb-3">Músicas do Evento</h2>

                {musics.length === 0 ? (
                    <p className="text-gray-500 mb-4">Nenhuma música adicionada.</p>
                ) : (
                    <div className="space-y-3 mb-6">
                        {musics.map(m => (
                            <div key={m.id} className="p-4 bg-[#111118] border border-[#2a2a30] rounded-xl">
                                <p className="text-lg font-medium">{m.title}</p>
                                <p className="text-gray-400 text-sm">{m.artist}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* BOTÃO ADMIN → ADICIONAR */}
                {isAdmin && (
                    <Button
                        className="w-full bg-[#7c5fff] hover:bg-[#6a4ee8] mb-8"
                        onClick={() => setOpenAddModal(true)}
                    >
                        + Adicionar Música
                    </Button>
                )}

                {/* =============================== */}
                {/* SUGESTÕES */}
                {/* =============================== */}
                <h2 className="text-2xl font-semibold mb-3">Sugestões enviadas</h2>

                {suggestions.length === 0 ? (
                    <p className="text-gray-500 mb-4">Nenhuma sugestão enviada.</p>
                ) : (
                    <div className="space-y-4 mb-6">
                        {suggestions.map(s => (
                            <div key={s.id} className="p-4 bg-[#111118] border border-[#2a2a30] rounded-xl">
                                <p className="text-lg font-medium">{s.music.title}</p>
                                <p className="text-gray-400 text-sm">{s.music.artist}</p>

                                <p className="text-gray-500 text-xs mt-1">
                                    Sugerido por: {s.authorName || "Integrante"}
                                </p>

                                {isAdmin && (
                                    <div className="flex gap-3 mt-3">
                                        <Button
                                            className="bg-emerald-600/80 hover:bg-emerald-500 text-white"
                                            onClick={() => handleAccept(s.id)}
                                        >
                                            Aceitar
                                        </Button>

                                        <Button
                                            className="bg-rose-600/80 hover:bg-rose-500 text-white"
                                            onClick={() => handleReject(s.id)}
                                        >
                                            Rejeitar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* BOTÃO MEMBER → SUGERIR */}
                {!isAdmin && (
                    <Button
                        className="w-full bg-[#7c5fff] hover:bg-[#6a4ee8] mb-8"
                        onClick={() => setOpenSuggestModal(true)}
                    >
                        Sugerir Música
                    </Button>
                )}

                {/* FECHAR */}
                <div className="flex justify-start mt-2">
                    <Button variant="outline" onClick={onClose}>
                        Fechar
                    </Button>
                </div>
            </div>

            {/* MODAL ADMIN → ADICIONAR MÚSICA */}
            <SelectMusicModal
                open={openAddModal}
                eventId={event.id}
                onClose={() => setOpenAddModal(false)}
                onAdded={() => {
                    loadData();
                    onUpdated?.();
                }}
                isSuggestion={false}
                onResetSearch={true}
            />

            {/* MODAL MEMBER → SUGERIR MÚSICA */}
            <SelectMusicModal
                open={openSuggestModal}
                eventId={event.id}
                onClose={() => setOpenSuggestModal(false)}
                onAdded={handleSuggestionAdded}
                isSuggestion={true}
                onResetSearch={true}
            />
        </div>
    );
}
