// src/pages/lineups/LineupEditModal.jsx
import { useEffect, useState } from "react";
import {
    getLineup,
    updateLineupName,
    addRoleToLineup,
    updateLineupRole,
    removeRoleFromLineup
} from "../../services/lineupApi.js";
import { getRoles } from "../../services/rolesApi.js";

import { toast } from "react-toastify";
import { X, Trash2 } from "lucide-react";

export default function LineupEditModal({
                                            open,
                                            lineupId,
                                            onClose,
                                            onUpdated,
                                        }) {

    const [lineup, setLineup] = useState(null);
    const [allRoles, setAllRoles] = useState([]);

    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [items, setItems] = useState([]);
    const [newRoles, setNewRoles] = useState({});

    const [closing, setClosing] = useState(false);

    function handleAnimatedClose() {
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            onClose();
        }, 160);
    }

    /** 🔥 Recarrega apenas este modal */
    async function reloadModal() {
        const data = await getLineup(lineupId);
        setLineup(data);
        setItems(data.roles);
    }

    /** 🔥 Carregar dados iniciais */
    useEffect(() => {
        if (!open || !lineupId) return;

        async function load() {
            try {
                setLoading(true);

                const [lineupData, rolesData] = await Promise.all([
                    getLineup(lineupId),
                    getRoles(),
                ]);

                setLineup(lineupData);
                setName(lineupData.name);
                setItems(lineupData.roles);
                setAllRoles(rolesData);
                setNewRoles({});
            } catch {
                toast.error("Erro ao carregar dados da formação.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [open, lineupId]);

    /** 🔥 Atualizar nome da lineup */
    async function handleSaveName() {
        try {
            await updateLineupName(lineupId, { name });
            toast.success("Nome atualizado!");

            await reloadModal();
            onUpdated(); // atualiza lista lá fora
        } catch {
            toast.error("Erro ao atualizar nome");
        }
    }

    /** 🔥 Atualizar descrição */
    async function handleUpdateDescription(itemId, description) {
        try {
            await updateLineupRole(itemId, { description });
            toast.success("Descrição salva!");

            await reloadModal();
            onUpdated();
        } catch {
            toast.error("Erro ao salvar descrição");
        }
    }

    /** 🔥 Excluir papel */
    async function handleRemoveItem(itemId) {
        try {
            await removeRoleFromLineup(itemId);
            toast.success("Papel removido!");

            await reloadModal();
            onUpdated();
        } catch {
            toast.error("Erro ao remover papel");
        }
    }

    /** 🔥 Adicionar novos papéis */
    async function handleAddNewRoles() {
        const selected = Object.entries(newRoles).filter(([_, v]) => v.checked);

        if (selected.length === 0) {
            toast.warn("Selecione pelo menos um papel.");
            return;
        }

        try {
            for (const [roleId, data] of selected) {
                await addRoleToLineup(lineupId, {
                    roleId,
                    description: data.description || "",
                });
            }

            toast.success("Papéis adicionados!");

            await reloadModal();
            onUpdated();

            setNewRoles({});
        } catch {
            toast.error("Erro ao adicionar papéis");
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">

            <div className={
                "bg-[#1b1b1f] border border-[#2a2a30] rounded-xl p-6 w-[95%] max-w-xl max-h-[90vh] overflow-y-auto shadow-xl " +
                (closing ? "animate-fadeOut" : "animate-scaleIn")
            }>

                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-100">
                        Editar formação
                    </h2>
                    <button
                        onClick={handleAnimatedClose}
                        className="text-gray-400 hover:text-white"
                    >
                        <X size={22} />
                    </button>
                </div>

                {loading || !lineup ? (
                    <p className="text-gray-400 text-center">Carregando...</p>
                ) : (
                    <>
                        {/* Nome */}
                        <label className="text-gray-300 text-sm">Nome da formação</label>
                        <div className="flex gap-2 mb-4">
                            <input
                                className="w-full bg-[#121214] border border-[#2d2d35] rounded-lg px-3 py-2 text-gray-200"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <button
                                onClick={handleSaveName}
                                className="px-4 py-2 bg-sf-primary text-white rounded-lg hover:bg-sf-primary-600"
                            >
                                Salvar
                            </button>
                        </div>

                        {/* Papéis atuais */}
                        <h3 className="text-gray-300 text-sm mb-2">Papéis atuais</h3>
                        <div className="space-y-3 pr-1 mb-6">
                            {items.map((item) => (
                                <div key={item.id} className="bg-[#242428] border border-[#33333a] p-3 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-200 font-medium">
                                            {item.role.name}
                                        </span>

                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="p-1 bg-red-600 hover:bg-red-700 rounded-lg"
                                        >
                                            <Trash2 size={15} className="text-white" />
                                        </button>
                                    </div>

                                    <input
                                        className="w-full bg-[#121214] border border-[#2d2d35] rounded-lg px-3 py-2 text-gray-200 text-sm"
                                        placeholder="Descrição"
                                        value={item.description || ""}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setItems((old) =>
                                                old.map((x) =>
                                                    x.id === item.id
                                                        ? { ...x, description: val }
                                                        : x
                                                )
                                            );
                                        }}
                                        onBlur={(e) =>
                                            handleUpdateDescription(item.id, e.target.value)
                                        }
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Adicionar papéis */}
                        <h3 className="text-gray-300 text-sm mb-2">Adicionar papéis</h3>
                        <div className="space-y-3 pr-1 mb-4">
                            {allRoles
                                .filter((r) => !items.some((i) => i.role.id === r.id))
                                .map((role) => (
                                    <div key={role.id} className="bg-[#242428] border border-[#33333a] p-3 rounded-lg">
                                        <label className="flex items-center gap-2 text-gray-200">
                                            <input
                                                type="checkbox"
                                                className="accent-sf-primary"
                                                checked={newRoles[role.id]?.checked || false}
                                                onChange={(e) =>
                                                    setNewRoles((old) => ({
                                                        ...old,
                                                        [role.id]: {
                                                            ...(old[role.id] || {}),
                                                            checked: e.target.checked,
                                                        },
                                                    }))
                                                }
                                            />
                                            {role.name}
                                        </label>

                                        {newRoles[role.id]?.checked && (
                                            <input
                                                placeholder="Descrição"
                                                className="mt-2 w-full bg-[#121214] border border-[#2d2d35] rounded-lg px-3 py-2 text-gray-200 text-sm"
                                                value={newRoles[role.id]?.description || ""}
                                                onChange={(e) =>
                                                    setNewRoles((old) => ({
                                                        ...old,
                                                        [role.id]: {
                                                            ...(old[role.id] || {}),
                                                            checked: true,
                                                            description: e.target.value,
                                                        },
                                                    }))
                                                }
                                            />
                                        )}
                                    </div>
                                ))}
                        </div>

                        <button
                            onClick={handleAddNewRoles}
                            className="mt-2 w-full px-4 py-2 bg-sf-primary text-white rounded-lg hover:bg-sf-primary-600"
                        >
                            Adicionar papéis
                        </button>

                        {/* FOOTER */}
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={handleAnimatedClose}
                                className="px-4 py-2 text-gray-300 hover:text-white"
                            >
                                Fechar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
