import { useState } from "react";
import { useParams } from "react-router-dom";
import {
    listHolyricsMusics,
    importHolyricsMusics
} from "../../services/holyricsApi";
import Button from "../../components/Button";
import toast from "react-hot-toast";

export default function HolyricsMusics() {
    const { id: bandId } = useParams();

    const [musics, setMusics] = useState([]);
    const [loading, setLoading] = useState(false);

    async function handleList() {
        try {
            setLoading(true);
            const data = await listHolyricsMusics(bandId);
            setMusics(data);
        } catch {
            toast.error("Erro ao consultar músicas.");
        } finally {
            setLoading(false);
        }
    }

    async function handleImport() {
        try {
            await importHolyricsMusics(bandId);
            toast.success("Músicas importadas com sucesso!");
        } catch {
            toast.error("Erro ao importar músicas.");
        }
    }

    return (
        <div className="space-y-6">

            <h1 className="text-2xl font-semibold">Músicas do Holyrics</h1>

            <div className="flex gap-3">
                <Button onClick={handleList}>Consultar Músicas</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleImport}>
                    Importar para o ScaleFlow
                </Button>
            </div>

            {loading && <p className="text-gray-400 mt-4">Carregando…</p>}

            <div className="space-y-3 mt-6">
                {musics.map((m, i) => (
                    <div key={i} className="bg-[#1b1b1f] border border-[#2a2a30] p-4 rounded-xl">
                        <p className="text-lg font-medium">{m.title}</p>
                        <p className="text-gray-400 text-sm">{m.artist || "—"}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
