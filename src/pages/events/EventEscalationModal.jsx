import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "../../components/Button";

import {
    getEscalations,
    createEscalation,
    deleteEscalation,
} from "../../services/escalationApi";

import { X, UserPlus, Trash2 } from "lucide-react";

export default function EventEscalationModal({
                                                 open,
                                                 event,
                                                 onClose,
                                                 allIntegrants = [],
                                                 allRoles = [],
                                                 onUpdated,
                                             }) {
    const [loading, setLoading] = useState(true);
    const [escalations, setEscalations] = useState([]);

    const [adding, setAdding] = useState(false);
    const [selectedIntegrant, setSelectedIntegrant] = useState("");
    const [selectedRole, setSelectedRole] = useState("");

    async function loadData() {
        if (!event) return;

        try {
            setLoading(true);
            const data = await getEscalations(event.id);
            setEscalations(data);
        } catch (err) {
            console.error(err);
            toast.error("Erro ao carregar escalações.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (open) {
            setAdding(false);
            setSelectedIntegrant("");
            setSelectedRole("");
            loadData();
        }
    }, [open]);

    // Criar escalação
    async function handleCreate() {
        if (!selectedIntegrant || !selectedRole) {
            toast.error("Selecione o integrante e o papel.");
            return;
        }

        try {
            await createEscalation(event.id, {
                userId: selectedIntegrant,
                roleId: selectedRole,
            });

            toast.success("Escalação adicionada!");
            await loadData();
            onUpdated?.();

            setAdding(false);
            setSelectedIntegrant("");
            setSelectedRole("");
        } catch (err) {
            console.error(err);
            toast.error("Erro ao adicionar escalação.");
        }
    }

    // Remover escalação
    async function handleDelete(id) {
        try {
            await deleteEscalation(id);
            toast.success("Escalação removida!");

            await loadData();
            onUpdated?.();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao remover escalação.");
        }
    }

    if (!open || !event) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-start overflow-y-auto z-[9999] py-10">
            <div className="bg-[#1a1a1e] border border-[#2a2a30] rounded-2xl p-7 w-[90%] max-w-2xl text-gray-200 shadow-xl">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Escalação — {event.name}</h1>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition"
                    >
                        <X size={26} />
                    </button>
                </div>

                {loading ? (
                    <p className="text-gray-400 text-center py-6">Carregando…</p>
                ) : (
                    <>
                        {/* LISTA EXISTENTE */}
                        {escalations.length === 0 ? (
                            <p className="text-gray-500 mb-6">
                                Nenhum integrante escalado ainda.
                            </p>
                        ) : (
                            <div className="space-y-4 mb-10">
                                {escalations.map(es => (
                                    <div
                                        key={es.id}
                                        className="p-4 bg-[#111118] border border-[#2a2a30] rounded-xl flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="font-medium text-lg">
                                                {es.user?.name}
                                            </p>

                                            <p className="text-gray-400 text-sm">
                                                {es.role?.name}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleDelete(es.id)}
                                            className="p-2 bg-red-600/80 hover:bg-red-600 rounded-lg"
                                        >
                                            <Trash2 size={18} className="text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!adding && (
                            <Button
                                className="w-full bg-[#7c5fff] hover:bg-[#6a4ee8] flex items-center justify-center gap-2 py-3"
                                onClick={() => setAdding(true)}
                            >
                                <UserPlus size={20} />
                                Adicionar à Escalação
                            </Button>
                        )}

                        {adding && (
                            <div className="mt-6 space-y-4 p-5 bg-[#111118] border border-[#2a2a30] rounded-xl">
                                <h2 className="text-lg font-semibold">Novo escalado</h2>

                                {/* INTEGRANTE */}
                                <div>
                                    <label className="text-sm text-gray-300">Integrante</label>
                                    <select
                                        value={selectedIntegrant}
                                        onChange={e => setSelectedIntegrant(e.target.value)}
                                        className="w-full bg-[#1a1a1e] border border-[#2a2a30] rounded-lg px-3 py-2 mt-1 text-gray-200"
                                    >
                                        <option value="">Selecione...</option>

                                        {allIntegrants.map(i => (
                                            <option key={i.user.id} value={i.user.id}>
                                                {i.user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* PAPEL */}
                                <div>
                                    <label className="text-sm text-gray-300">Papel</label>
                                    <select
                                        value={selectedRole}
                                        onChange={e => setSelectedRole(e.target.value)}
                                        className="w-full bg-[#1a1a1e] border border-[#2a2a30] rounded-lg px-3 py-2 mt-1 text-gray-200"
                                    >
                                        <option value="">Selecione...</option>

                                        {allRoles.map(r => (
                                            <option key={r.id} value={r.id}>
                                                {r.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-3 mt-4">
                                    <Button
                                        className="bg-emerald-600/80 hover:bg-emerald-500 text-white flex-1"
                                        onClick={handleCreate}
                                    >
                                        Confirmar
                                    </Button>

                                    <Button
                                        className="bg-gray-600/50 hover:bg-gray-600 flex-1"
                                        onClick={() => setAdding(false)}
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
