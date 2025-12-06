// src/pages/lineups/LineupDetailsModal.jsx
import { useEffect, useState } from "react";
import { getLineup } from "../../services/lineupApi.js";

import { X, Pencil, Trash2 } from "lucide-react";

export default function LineupDetailsModal({
                                               open,
                                               lineupId,
                                               onClose,
                                               onEdit,
                                               onDelete,
                                           }) {
    const [lineup, setLineup] = useState(null);
    const [loading, setLoading] = useState(true);

    const [closing, setClosing] = useState(false);

    function handleAnimatedClose(callback) {
        setClosing(true);

        setTimeout(() => {
            setClosing(false);
            onClose();
            callback && callback();
        }, 160);
    }

    useEffect(() => {
        if (!open || !lineupId) return;

        async function load() {
            try {
                setLoading(true);
                const data = await getLineup(lineupId);
                setLineup(data);
            } catch (err) {
                console.error("Erro ao carregar detalhes:", err);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [open, lineupId]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div
                className={`bg-[#1b1b1f] border border-[#2a2a30] rounded-xl p-6 w-[92%] max-w-lg shadow-xl transition-all
                ${closing ? "animate-fadeOut" : "animate-scaleIn"}`}
            >

                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-100">
                        Detalhes da formação
                    </h2>

                    <button
                        onClick={() => handleAnimatedClose()}
                        className="text-gray-400 hover:text-white transition"
                    >
                        <X size={22} />
                    </button>
                </div>

                {loading || !lineup ? (
                    <p className="text-gray-400 text-center py-6">Carregando...</p>
                ) : (
                    <>
                        {/* NOME */}
                        <div className="mb-4">
                            <p className="text-gray-300 text-sm">Nome</p>
                            <h3 className="text-lg font-semibold text-gray-100">
                                {lineup.name}
                            </h3>
                        </div>

                        {/* PAPÉIS */}
                        <div className="mb-4">
                            <p className="text-gray-300 text-sm mb-2">Papéis</p>
                            {(!lineup.roles || lineup.roles.length === 0) ? (
                                <p className="text-gray-500">Nenhum papel nesta formação.</p>
                            ) : (
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                    {lineup.roles.map((item) => (
                                        <div
                                            key={item.id}
                                            className="bg-[#26262b] border border-[#34343a] rounded-lg px-3 py-2"
                                        >
                                            <p className="text-gray-200 font-medium text-sm">
                                                {item.role.name}
                                            </p>
                                            {item.description && (
                                                <p className="text-gray-400 text-xs">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* BOTÕES */}
                        <div className="flex justify-between mt-6">
                            <button
                                onClick={() =>
                                    handleAnimatedClose(() => onEdit(lineup))
                                }
                                className="flex items-center gap-2 px-4 py-2 bg-sf-primary text-white rounded-lg hover:bg-sf-primary-600 transition"
                            >
                                <Pencil size={18} />
                                Editar
                            </button>

                            <button
                                onClick={() => onDelete(lineup)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                <Trash2 size={18} />
                                Excluir
                            </button>
                        </div>

                        <div className="flex justify-center mt-4">
                            <button
                                onClick={() => handleAnimatedClose()}
                                className="px-4 py-2 text-gray-300 hover:text-white transition"
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
