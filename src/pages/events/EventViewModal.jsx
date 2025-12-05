
import { useEffect, useState } from 'react'
import Button from '../../components/Button.jsx'
import {
    getEventMusics,
    removeMusicFromEvent
} from "../../services/eventApi.js";
import SelectMusicModal from "./components/SelectMusicModal.jsx";
import toast from "react-hot-toast";

function formatDateTime(value) {
    if (!value) return '-'
    const date = new Date(value)
    return date.toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
    })
}

export default function EventViewModal({ open, event, onClose, onEdit, onDelete }) {
    const [musics, setMusics] = useState([]);
    const [loadingMusics, setLoadingMusics] = useState(false);
    const [musicModalOpen, setMusicModalOpen] = useState(false);

    useEffect(() => {
        if (open && event) loadMusics();
    }, [open, event]);

    async function loadMusics() {
        try {
            setLoadingMusics(true);
            const data = await getEventMusics(event.id);
            setMusics(data);
        } catch (err) {
            toast.error("Erro ao carregar músicas do evento.");
        } finally {
            setLoadingMusics(false);
        }
    }

    async function handleRemove(musicId) {
        try {
            await removeMusicFromEvent(event.id, musicId);
            toast.success("Música removida!");
            loadMusics();
        } catch (err) {
            toast.error("Erro ao remover música.");
        }
    }

    if (!open || !event) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div
                className="
                    bg-[#1b1b1f] border border-[#2a2a30]
                    rounded-2xl p-6 w-[95%] max-w-xl
                    shadow-2xl transform transition-all duration-200
                "
            >
                {/* Título */}
                <h2 className="text-2xl font-semibold text-[#c4b5ff] mb-2">
                    {event.name}
                </h2>

                {/* Datas */}
                <p className="text-sm text-gray-400 mb-4">
                    {formatDateTime(event.startingTime)} &rarr; {formatDateTime(event.endingTime)}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-3 text-sm text-gray-300 mb-6">
                    <span className="px-3 py-1 rounded-full bg-[#111118] border border-[#2a2a30]">
                        Escalações: {event.escalationsCount ?? 0}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#111118] border border-[#2a2a30]">
                        Sugestões: {event.suggestionsCount ?? 0}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#111118] border border-[#2a2a30]">
                        Músicas escolhidas: {musics.length}
                    </span>
                </div>

                {/* --- NOVA SEÇÃO: Músicas do Evento --- */}
                <h3 className="text-lg font-semibold text-[#c4b5ff] mb-3">
                    Músicas do Evento
                </h3>

                {loadingMusics ? (
                    <p className="text-gray-400">Carregando músicas...</p>
                ) : musics.length === 0 ? (
                    <p className="text-gray-500 mb-3">Nenhuma música escolhida ainda.</p>
                ) : (
                    <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-1">
                        {musics.map(music => (
                            <div
                                key={music.id}
                                className="flex justify-between items-center bg-[#111118] border border-[#2a2a30] p-3 rounded-lg"
                            >
                                <div>
                                    <p className="text-gray-200">{music.title}</p>
                                    <p className="text-gray-400 text-sm">{music.artist}</p>
                                </div>

                                <Button
                                    variant="outline"
                                    className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                                    onClick={() => handleRemove(music.id)}
                                >
                                    Remover
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                <Button
                    className="w-full bg-[#7c5fff] hover:bg-[#6a4ee8] mb-6"
                    onClick={() => setMusicModalOpen(true)}
                >
                    + Adicionar Música
                </Button>

                {/* Botões inferiores */}
                <div className="flex justify-between items-center gap-3">
                    <Button
                        variant="outline"
                        className="border-[#2a2a30] text-gray-300 hover:bg-[#191920]"
                        onClick={onClose}
                    >
                        Fechar
                    </Button>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="border-[#2a2a30] text-gray-300 hover:bg-[#191920]"
                            onClick={onEdit}
                        >
                            Editar
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700"
                            onClick={onDelete}
                        >
                            Excluir
                        </Button>
                    </div>
                </div>

                {/* Modal de seleção de músicas */}
                <SelectMusicModal
                    open={musicModalOpen}
                    eventId={event.id}
                    onClose={() => setMusicModalOpen(false)}
                    onAdded={loadMusics}
                />
            </div>
        </div>
    )
}
