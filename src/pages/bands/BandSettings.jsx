import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBandById, updateBand, regenerateJoinCode, deleteBand } from "../../services/bandApi.js";
import toast from "react-hot-toast";
import Input from "../../components/Input.jsx";
import Button from "../../components/Button.jsx";

export default function BandSettings() {
    const { id } = useParams();
    const [band, setBand] = useState(null);
    const [name, setName] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const b = await getBandById(id);
                setBand(b);
                setName(b.name);
            } catch {
                toast.error("Erro ao carregar dados da banda.");
            }
        }
        load();
    }, [id]);

    async function handleSave() {
        try {
            await updateBand(id, { name });
            toast.success("Dados atualizados!");
        } catch {
            toast.error("Erro ao atualizar banda.");
        }
    }

    async function handleRegen() {
        try {
            await regenerateJoinCode(id);
            toast.success("Código regenerado!");
        } catch {
            toast.error("Erro ao regenerar código.");
        }
    }

    async function handleDelete() {
        const confirmDelete = confirm("Deletar banda? Esta ação é irreversível.");
        if (!confirmDelete) return;

        try {
            await deleteBand(id);
            toast.success("Banda deletada!");
            window.location.href = "/bands/select";
        } catch {
            toast.error("Erro ao deletar banda.");
        }
    }

    if (!band) return <div className="p-8 text-gray-300">Carregando...</div>;

    return (
        <div className="p-8 space-y-10">

            <h1 className="text-3xl font-bold">Configurações da Banda</h1>

            <div className="bg-sf-card p-6 rounded-xl border border-sf-border space-y-4">
                <h2 className="text-xl font-semibold">Dados Básicos</h2>

                <Input
                    label="Nome da Banda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <Button className="mt-2 bg-sf-primary hover:bg-sf-primary/80" onClick={handleSave}>
                    Salvar Alterações
                </Button>
            </div>

            <div className="bg-sf-card p-6 rounded-xl border border-sf-border space-y-4">
                <h2 className="text-xl font-semibold">Código da Banda</h2>

                <p className="text-gray-400 text-sm">
                    O código é mostrado somente na tela inicial da banda.
                </p>

                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleRegen}>
                    Regenerar Código
                </Button>
            </div>

            <div className="bg-sf-card p-6 rounded-xl border border-red-800/40 space-y-4">
                <h2 className="text-xl font-semibold text-red-400">Zona de Perigo</h2>

                <Button className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
                    Deletar Banda
                </Button>
            </div>
        </div>
    );
}
