// src/pages/lineups/LineupCreateModal.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getRoles } from "../../services/rolesApi.js";
import { createLineup } from "../../services/lineupApi.js";

import { toast } from "react-toastify";
import { X } from "lucide-react";

export default function LineupCreateModal({
                                              open,
                                              onClose,
                                              onCreated
                                          }) {
    const { id: bandId } = useParams();

    const [name, setName] = useState("");
    const [roles, setRoles] = useState([]);
    const [selected, setSelected] = useState({});
    const [loading, setLoading] = useState(true);

    // animação
    const [closing, setClosing] = useState(false);

    function handleAnimatedClose() {
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            onClose();
        }, 150);
    }

    useEffect(() => {
        if (!open) return;

        async function load() {
            try {
                setLoading(true);
                const r = await getRoles();
                setRoles(r);
                setSelected({});
                setName("");
            } catch {
                toast.error("Erro ao carregar papéis");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [open]);

    async function handleCreate() {
        const chosen = Object.entries(selected)
            .filter(([_, v]) => v.checked)
            .map(([roleId, data]) => ({
                roleId,
                description: data.description || ""
            }));

        if (!name.trim()) return toast.warn("Digite um nome");
        if (chosen.length === 0) return toast.warn("Escolha pelo menos um papel");

        try {
            await createLineup(bandId, {
                name: name.trim(),
                roles: chosen
            });

            toast.success("Formação criada!");
            onCreated();

            handleAnimatedClose();

        } catch {
            toast.error("Erro ao criar formação");
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">

            <div className={`
                bg-[#1b1b1f]
                border border-[#2a2a30]
                rounded-xl
                p-6
                w-[90%]
                max-w-lg
                max-h-[90vh]
                overflow-y-auto
                shadow-xl
                ${closing ? "animate-fadeOut" : "animate-scaleIn"}
            `}>

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl text-gray-100 font-semibold">Nova Formação</h2>

                    <button
                        onClick={handleAnimatedClose}
                        className="text-gray-400 hover:text-white">
                        <X size={22} />
                    </button>
                </div>

                {/* NOME */}
                <label className="text-gray-300 text-sm">Nome da formação</label>
                <input
                    className="w-full bg-[#121214] border border-[#2d2d35] rounded-lg px-3 py-2 text-gray-200 mb-4"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                {/* ROLES */}
                <p className="text-gray-300 text-sm mb-2">Papéis</p>

                {loading ? (
                    <p className="text-gray-400 text-sm">Carregando...</p>
                ) : (
                    <div className="space-y-3 mb-4">
                        {roles.map((role) => (
                            <div key={role.id} className="bg-[#242428] border border-[#33333a] p-3 rounded-lg">
                                <label className="flex items-center gap-2 text-gray-200">
                                    <input
                                        type="checkbox"
                                        className="accent-sf-primary"
                                        checked={selected[role.id]?.checked || false}
                                        onChange={(e) =>
                                            setSelected((prev) => ({
                                                ...prev,
                                                [role.id]: {
                                                    ...(prev[role.id] || {}),
                                                    checked: e.target.checked,
                                                },
                                            }))
                                        }
                                    />
                                    {role.name}
                                </label>

                                {selected[role.id]?.checked && (
                                    <input
                                        placeholder="Descrição (opcional)"
                                        className="mt-2 w-full bg-[#121214] border border-[#2d2d35] rounded-lg px-3 py-2 text-gray-200 text-sm"
                                        value={selected[role.id]?.description || ""}
                                        onChange={(e) =>
                                            setSelected((prev) => ({
                                                ...prev,
                                                [role.id]: {
                                                    ...(prev[role.id] || {}),
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
                )}

                <button
                    onClick={handleCreate}
                    className="w-full px-4 py-2 bg-sf-primary text-white rounded-lg hover:bg-sf-primary-600">
                    Criar
                </button>

                <div className="flex justify-center mt-4">
                    <button
                        onClick={handleAnimatedClose}
                        className="px-4 py-2 text-gray-300 hover:text-white">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
