import { useEffect, useState } from "react";
import { X, Trash2, Plus } from "lucide-react";
import { toast } from "react-toastify";

import {
    getLineup,
    updateLineupName,
    addRoleToLineup,
    updateLineupRole,
    removeRoleFromLineup,
} from "../../services/lineupApi.js";
import { getRoles } from "../../services/rolesApi.js";

export default function LineupEditModal({
                                            open,
                                            onClose,
                                            lineupId,
                                            onUpdated,
                                        }) {
    const [name, setName] = useState("");
    const [allRoles, setAllRoles] = useState([]);
    const [items, setItems] = useState([]);

    const [newRole, setNewRole] = useState("");
    const [newDesc, setNewDesc] = useState("");

    const [loading, setLoading] = useState(true);
    const [closing, setClosing] = useState(false);

    function handleAnimatedClose() {
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            onClose();
        }, 150);
    }

    useEffect(() => {
        if (!open || !lineupId) return;

        let cancelled = false;

        async function load() {
            try {
                setLoading(true);

                const [lineupData, roles] = await Promise.all([
                    getLineup(lineupId),
                    getRoles(),
                ]);

                if (cancelled) return;

                setName(lineupData.name || "");
                setItems(
                    (lineupData.roles || []).map((item) => ({
                        id: item.id,
                        roleId: item.role.id,
                        roleName: item.role.name,
                        description: item.description || "",
                    }))
                );

                setAllRoles(roles);
            } catch (err) {
                console.error(err);
                toast.error("Erro ao carregar dados da formação");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => (cancelled = true);
    }, [open, lineupId]);

    // ----------------------------
    // NÃO CHAMA onUpdated aqui
    // Apenas mexe no estado local
    // ----------------------------

    async function handleAddItem() {
        if (!newRole) return toast.warn("Selecione um papel.");

        try {
            const created = await addRoleToLineup(lineupId, {
                roleId: newRole,
                description: newDesc,
            });

            setItems((prev) => [
                ...prev,
                {
                    id: created.id,
                    roleId: created.role.id,
                    roleName: created.role.name,
                    description: created.description || "",
                },
            ]);

            setNewRole("");
            setNewDesc("");
            toast.success("Papel adicionado!");
        } catch {
            toast.error("Erro ao adicionar papel");
        }
    }

    async function handleRemoveItem(itemId) {
        try {
            await removeRoleFromLineup(itemId);
            setItems((prev) => prev.filter((i) => i.id !== itemId));
            toast.success("Papel removido!");
        } catch {
            toast.error("Erro ao remover papel");
        }
    }

    async function handleUpdateDescription(itemId, newValue) {
        setItems((prev) =>
            prev.map((i) =>
                i.id === itemId ? { ...i, description: newValue } : i
            )
        );

        try {
            await updateLineupRole(itemId, { description: newValue });
        } catch {
            toast.error("Erro ao atualizar descrição");
        }
    }

    async function handleSaveAll() {
        try {
            await updateLineupName(lineupId, { name });

            // Agora sim recarrega dados externos
            onUpdated && onUpdated();

            toast.success("Alterações salvas!");
            handleAnimatedClose();
        } catch {
            toast.error("Erro ao salvar alterações");
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div
                className={`bg-[#1b1b1f] border border-[#2a2a30] rounded-xl p-6 w-[90%] max-w-xl max-h-[90vh] overflow-y-auto shadow-xl ${
                    closing ? "animate-fadeOut" : "animate-scaleIn"
                }`}
            >
                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl text-gray-100 font-semibold">
                        Editar Formação
                    </h2>
                    <button
                        onClick={handleAnimatedClose}
                        className="text-gray-400 hover:text-white"
                    >
                        <X size={22} />
                    </button>
                </div>

                {loading ? (
                    <p className="text-gray-400 text-sm">Carregando...</p>
                ) : (
                    <>
                        {/* Nome */}
                        <label className="text-gray-300 text-sm">
                            Nome da formação
                        </label>
                        <div className="flex gap-2 mb-4">
                            <input
                                className="flex-1 bg-[#121214] border border-[#2d2d35] rounded-lg px-3 py-2 text-gray-200"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                            />
                        </div>

                        {/* ROLES EXISTENTES */}
                        <p className="text-gray-300 text-sm mb-2">
                            Papéis da formação
                        </p>

                        <div className="space-y-3 mb-6">
                            {items.length === 0 && (
                                <p className="text-gray-500 text-sm">
                                    Nenhum papel ainda.
                                </p>
                            )}

                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-[#242428] border border-[#33333a] rounded-lg p-3"
                                >
                                    <div className="flex justify-between items-center">
                                        <p className="text-gray-200 font-medium">
                                            {
                                                item.roleName ||
                                                allRoles.find(r => String(r.id) === String(item.roleId))?.name ||
                                                "Papel"
                                            }
                                        </p>


                                        <button
                                            onClick={() =>
                                                handleRemoveItem(item.id)
                                            }
                                            className="bg-red-600 hover:bg-red-700 p-1 rounded"
                                        >
                                            <Trash2
                                                size={16}
                                                className="text-white"
                                            />
                                        </button>
                                    </div>

                                    <input
                                        className="mt-2 w-full bg-[#121214] border border-[#2d2d35] rounded-lg px-3 py-2 text-gray-200 text-sm"
                                        value={item.description}
                                        placeholder="Descrição"
                                        onChange={(e) =>
                                            handleUpdateDescription(
                                                item.id,
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            ))}
                        </div>

                        {/* ADICIONAR NOVO PAPEL */}
                        <p className="text-gray-300 text-sm mb-2">
                            Adicionar novo papel
                        </p>

                        <div className="flex gap-2 mb-4">
                            <select
                                className="w-48 bg-[#121214] border border-[#2d2d35] rounded-lg px-2 py-2 text-gray-200"
                                value={newRole}
                                onChange={(e) =>
                                    setNewRole(e.target.value)
                                }
                            >
                                <option value="">Selecione...</option>
                                {allRoles.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.name}
                                    </option>
                                ))}
                            </select>

                            <input
                                className="flex-1 bg-[#121214] border border-[#2d2d35] rounded-lg px-3 py-2 text-gray-200 text-sm"
                                placeholder="Descrição (opcional)"
                                value={newDesc}
                                onChange={(e) =>
                                    setNewDesc(e.target.value)
                                }
                            />

                            <button
                                onClick={handleAddItem}
                                className="bg-sf-primary hover:bg-sf-primary-600 text-white px-3 rounded-lg"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        {/* RODAPÉ — SALVAR & FECHAR */}
                        <div className="flex justify-end mt-6 gap-3">
                            <button
                                onClick={handleSaveAll}
                                className="px-4 py-2 bg-sf-primary hover:bg-sf-primary-600 text-white rounded-lg"
                            >
                                Salvar alterações
                            </button>

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
