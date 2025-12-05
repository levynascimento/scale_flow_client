import { useEffect, useState } from "react";
import Button from "../../../components/Button.jsx";
import { getBandMusics } from "../../../services/musicApi.js";
import { addMusicToEvent } from "../../../services/eventApi.js";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

export default function SelectMusicModal({ open, eventId, onClose, onAdded }) {
    const { id: bandId } = useParams();
    const [musics, setMusics] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!open) return;
        loadMusics();
    }, [open]);

    async function loadMusics() {
        try {
            const data = await getBandMusics(bandId);
            setMusics(data);
        } catch (err) {
            toast.error("Erro ao carregar músicas.");
        }
    }

    async function handleAdd(musicId) {
        try {
            await addMusicToEvent(eventId, musicId);
            toast.success("Música adicionada!");
            onAdded();
            onClose();
        } catch (err) {
            toast.error("Erro ao adicionar música.");
        }
    }

    if (!open) return null;

    const filteredMusics = musics.filter(m =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.artist.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#1b1b1f] border border-[#2a2a30] rounded-2xl p-6 w-[95%] max-w-lg">
                <h2 className="text-xl font-semibold text-[#c4b5ff] mb-4">
                    Escolher música
                </h2>

                <input
                    type="text"
                    placeholder="Buscar música..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full mb-3 px-3 py-2 rounded-lg bg-[#111118] border border-[#2a2a30] text-gray-200"
                />

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {filteredMusics.map(music => (
                        <div
                            key={music.id}
                            className="flex justify-between items-center bg-[#111118] border border-[#2a2a30] p-3 rounded-lg"
                        >
                            <div>
                                <p className="text-gray-200 font-medium">
                                    {music.title}
                                </p>
                                <p className="text-gray-400 text-sm">
                                    {music.artist}
                                </p>
                            </div>
                            <Button
                                className="bg-[#7c5fff] hover:bg-[#6a4ee8]"
                                onClick={() => handleAdd(music.id)}
                            >
                                Adicionar
                            </Button>
                        </div>
                    ))}

                    {filteredMusics.length === 0 && (
                        <p className="text-gray-500 text-center py-4">
                            Nenhuma música encontrada.
                        </p>
                    )}
                </div>

                <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Fechar
                    </Button>
                </div>
            </div>
        </div>
    );
}
