import { useState } from "react";
import { useParams } from "react-router-dom";
import { updateHolyricsConfig, disconnectHolyrics } from "../../services/holyricsApi";
import Button from "../../components/Button";
import ConfirmDialog from "../../components/ConfirmDialog";
import toast from "react-hot-toast";

export default function HolyricsCredentials() {
    const { id: bandId } = useParams();

    const [apiKey, setApiKey] = useState("");
    const [token, setToken] = useState("");
    const [openDisconnect, setOpenDisconnect] = useState(false);

    async function handleSave() {
        try {
            await updateHolyricsConfig(bandId, { apiKey, token });
            toast.success("Credenciais atualizadas!");
        } catch {
            toast.error("Erro ao salvar.");
        }
    }

    async function handleDisconnect() {
        try {
            await disconnectHolyrics(bandId);
            toast.success("Holyrics desconectado!");
            setApiKey("");
            setToken("");
        } catch {
            toast.error("Erro ao desconectar.");
        }
    }

    return (
        <div className="space-y-6">

            <h1 className="text-2xl font-semibold mb-4">Credenciais Holyrics</h1>

            <div className="bg-[#1b1b1f] border border-[#2a2a30] p-6 rounded-xl space-y-4">

                <div>
                    <label className="block text-sm mb-1">API Key</label>
                    <input
                        className="w-full bg-[#111118] border border-[#2a2a30] rounded-lg p-2"
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Token</label>
                    <input
                        className="w-full bg-[#111118] border border-[#2a2a30] rounded-lg p-2"
                        value={token}
                        onChange={e => setToken(e.target.value)}
                    />
                </div>

                {/* 🔽 Botões centralizados e com largura reduzida */}
                <div className="max-w-sm mx-auto space-y-3">
                    <Button className="w-full" onClick={handleSave}>
                        Salvar
                    </Button>

                    <Button
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={() => setOpenDisconnect(true)}
                    >
                        Desconectar Holyrics
                    </Button>
                </div>
            </div>

            <ConfirmDialog
                open={openDisconnect}
                title="Desconectar Holyrics"
                message="Tem certeza que deseja desconectar o Holyrics desta banda?"
                onConfirm={handleDisconnect}
                onCancel={() => setOpenDisconnect(false)}
            />
        </div>
    );
}
