import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "../../components/Button";

import {
    getEscalations,
    createEscalation,
    deleteEscalation,
    getPriorityList
} from "../../services/escalationApi";

import { getLineup } from "../../services/lineupApi";
import { X, UserPlus, Trash2, Layers } from "lucide-react";

/**
 * Recupera o ID da banda ativa a partir da sessão (localStorage)
 */
function getCurrentBandId() {
    return localStorage.getItem("bandId");
}

export default function EventEscalationModal({
                                                 open,
                                                 event,
                                                 editable = false,
                                                 onClose,
                                                 allIntegrants = [],
                                                 allRoles = [],
                                                 onUpdated,
                                             }) {
    const [loading, setLoading] = useState(true);
    const [escalations, setEscalations] = useState([]);
    const [suggestedLineup, setSuggestedLineup] = useState(null);

    const [pendingEscalations, setPendingEscalations] = useState([]);

    const [adding, setAdding] = useState(false);
    const [selectedIntegrant, setSelectedIntegrant] = useState("");
    const [selectedRole, setSelectedRole] = useState("");

    const [priorityCache, setPriorityCache] = useState({});

    async function loadData() {
        if (!event) return;

        try {
            setLoading(true);

            const data = await getEscalations(event.id);
            setEscalations(data);

            if (event.lineupId) {
                const lineup = await getLineup(event.lineupId);
                setSuggestedLineup(lineup);
            } else {
                setSuggestedLineup(null);
            }

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
            setPendingEscalations([]);
            loadData();
        }
    }, [open, event?.id]);

    async function loadPriority(roleId) {
        if (!roleId || priorityCache[roleId]) return;

        const bandId = getCurrentBandId();
        if (!bandId) return;

        const role = allRoles.find(r => r.id === roleId);
        if (!role?.slug) return;

        try {
            const data = await getPriorityList(role.slug, bandId);

            setPriorityCache(prev => ({
                ...prev,
                [roleId]: data
            }));
        } catch (err) {
            console.error(err);
        }
    }

    function getOrderedIntegrants(roleId) {
        if (!roleId || !priorityCache[roleId]) return allIntegrants;

        const priorityMap = {};
        priorityCache[roleId].forEach(p => {
            priorityMap[p.userId] = p.priority;
        });

        return [...allIntegrants].sort((a, b) => {
            const pA = priorityMap[a.user.id] ?? -1;
            const pB = priorityMap[b.user.id] ?? -1;
            return pB - pA;
        });
    }

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

            setAdding(false);
            setSelectedIntegrant("");
            setSelectedRole("");

            await loadData();
            onUpdated?.();

        } catch (err) {
            console.error(err);
            toast.error("Erro ao adicionar escalação.");
        }
    }

    function applyFormationAsSuggestions() {
        if (!suggestedLineup) return;

        const existingRoleIds = escalations.map(e => e.role?.id).filter(Boolean);
        const pendingRoleIds = pendingEscalations.map(p => p.roleId);

        const rolesToSuggest = suggestedLineup.roles
            .map(r => r.role)
            .filter(role =>
                !existingRoleIds.includes(role.id) &&
                !pendingRoleIds.includes(role.id)
            );

        rolesToSuggest.forEach(role => loadPriority(role.id));

        setPendingEscalations(prev => ([
            ...prev,
            ...rolesToSuggest.map(role => ({
                roleId: role.id,
                roleName: role.name,
                userId: "",
            }))
        ]));

        toast.success("Formação aplicada como sugestão.");
    }

    async function confirmPending(index) {
        const item = pendingEscalations[index];

        if (!item.userId || !item.roleId) {
            toast.error("Selecione o integrante e o papel.");
            return;
        }

        try {
            await createEscalation(event.id, {
                userId: item.userId,
                roleId: item.roleId,
            });

            setPendingEscalations(prev =>
                prev.filter((_, i) => i !== index)
            );

            await loadData();
            onUpdated?.();

            toast.success("Escalação adicionada!");
        } catch (err) {
            console.error(err);
            toast.error("Erro ao confirmar escalação.");
        }
    }

    function cancelPending(index) {
        setPendingEscalations(prev =>
            prev.filter((_, i) => i !== index)
        );
    }

    async function handleDelete(id) {
        try {
            await deleteEscalation(id);
            await loadData();
            onUpdated?.();
            toast.success("Escalação removida!");
        } catch (err) {
            console.error(err);
            toast.error("Erro ao remover escalação.");
        }
    }

    if (!open || !event) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-start overflow-y-auto z-[9999] py-10">
            <div className="bg-[#1a1a1e] border border-[#2a2a30] rounded-2xl p-7 w-[95%] max-w-2xl text-gray-200 shadow-xl">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">
                        Escalação — {event.name}
                    </h1>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={26} />
                    </button>
                </div>

                {!editable && (
                    <p className="text-sm text-gray-400 italic mb-4">
                        Modo visualização — apenas administradores podem alterar a escala.
                    </p>
                )}

                {editable && suggestedLineup && (
                    <div className="mb-6 p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <p className="text-indigo-300 font-medium flex items-center gap-2">
                                    <Layers size={16} />
                                    Formação sugerida
                                </p>
                                <p className="text-sm text-gray-400">
                                    {suggestedLineup.name}
                                </p>
                                <ul className="mt-2 text-sm text-gray-300 space-y-1">
                                    {suggestedLineup.roles.map(r => (
                                        <li key={r.id}>• {r.role.name}</li>
                                    ))}
                                </ul>
                            </div>

                            <Button
                                className="bg-[#7c5fff] hover:bg-[#6a4ee8]"
                                onClick={applyFormationAsSuggestions}
                            >
                                Usar formação como base
                            </Button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <p className="text-gray-400 text-center py-6">Carregando…</p>
                ) : escalations.length === 0 ? (
                    <p className="text-gray-500 mb-6">
                        Nenhum integrante escalado ainda.
                    </p>
                ) : (
                    <div className="space-y-4 mb-8">
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

                                {editable && (
                                    <button
                                        onClick={() => handleDelete(es.id)}
                                        className="p-2 bg-red-600/80 hover:bg-red-600 rounded-lg"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {editable && pendingEscalations.map((p, idx) => (
                    <div key={idx} className="p-5 mb-6 bg-[#101018] border border-[#2a2a30] rounded-xl">
                        <p className="text-sm text-indigo-300 mb-3">
                            Novo escalado (sugestão)
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-300">Papel</label>
                                <select
                                    value={p.roleId}
                                    onChange={e => {
                                        const value = e.target.value;
                                        loadPriority(value);
                                        setPendingEscalations(prev => {
                                            const copy = [...prev];
                                            copy[idx].roleId = value;
                                            return copy;
                                        });
                                    }}
                                    className="w-full bg-[#1a1a1e] border border-[#2a2a30] rounded-lg px-3 py-2 mt-1"
                                >
                                    <option value="">Selecione...</option>
                                    {allRoles.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-gray-300">Integrante</label>
                                <select
                                    value={p.userId}
                                    onChange={e => {
                                        const value = e.target.value;
                                        setPendingEscalations(prev => {
                                            const copy = [...prev];
                                            copy[idx].userId = value;
                                            return copy;
                                        });
                                    }}
                                    className="w-full bg-[#1a1a1e] border border-[#2a2a30] rounded-lg px-3 py-2 mt-1"
                                >
                                    <option value="">Selecione...</option>
                                    {getOrderedIntegrants(p.roleId).map(i => (
                                        <option key={i.user.id} value={i.user.id}>
                                            {i.user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-4 justify-end">
                            <Button
                                className="bg-gray-600/50 hover:bg-gray-600"
                                onClick={() => cancelPending(idx)}
                            >
                                Cancelar
                            </Button>

                            <Button
                                className="bg-emerald-600/80 hover:bg-emerald-500"
                                onClick={() => confirmPending(idx)}
                            >
                                Confirmar
                            </Button>
                        </div>
                    </div>
                ))}

                {editable && !adding && (
                    <Button
                        className="w-full bg-[#7c5fff] hover:bg-[#6a4ee8] flex items-center justify-center gap-2 py-3"
                        onClick={() => setAdding(true)}
                    >
                        <UserPlus size={20} />
                        Adicionar à Escalação
                    </Button>
                )}

                {editable && adding && (
                    <div className="mt-6 space-y-4 p-5 bg-[#111118] border border-[#2a2a30] rounded-xl">
                        <h2 className="text-lg font-semibold">Novo escalado</h2>

                        <div>
                            <label className="text-sm text-gray-300">Integrante</label>
                            <select
                                value={selectedIntegrant}
                                onChange={e => setSelectedIntegrant(e.target.value)}
                                className="w-full bg-[#1a1a1e] border border-[#2a2a30] rounded-lg px-3 py-2 mt-1"
                            >
                                <option value="">Selecione...</option>
                                {getOrderedIntegrants(selectedRole).map(i => (
                                    <option key={i.user.id} value={i.user.id}>
                                        {i.user.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm text-gray-300">Papel</label>
                            <select
                                value={selectedRole}
                                onChange={e => {
                                    const value = e.target.value;
                                    setSelectedRole(value);
                                    loadPriority(value);
                                }}
                                className="w-full bg-[#1a1a1e] border border-[#2a2a30] rounded-lg px-3 py-2 mt-1"
                            >
                                <option value="">Selecione...</option>
                                {allRoles.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3 mt-4">
                            <Button
                                className="bg-emerald-600/80 hover:bg-emerald-500 flex-1"
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
            </div>
        </div>
    );
}
