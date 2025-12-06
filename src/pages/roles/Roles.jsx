import { useEffect, useState } from "react";
import { getRoles, deleteRole } from "../../services/rolesApi.js";
import RoleFormModal from "./RoleFormModal.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import Button from "../../components/Button.jsx";

export default function Roles() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const [openForm, setOpenForm] = useState(false);
    const [editingRole, setEditingRole] = useState(null);

    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        loadRoles();
    }, []);

    async function loadRoles() {
        try {
            setLoading(true);
            const data = await getRoles();

            // 🔥 Ordena alfabeticamente para manter a lista estável
            const sorted = (data || []).sort((a, b) =>
                a.name.localeCompare(b.name)
            );

            setRoles(sorted);
        } catch (err) {
            console.error("Erro ao carregar papéis:", err);
        } finally {
            setLoading(false);
        }
    }


    function handleOpenCreate() {
        setEditingRole(null);
        setOpenForm(true);
    }

    function handleOpenEdit(role) {
        setEditingRole(role);
        setOpenForm(true);
    }

    function getFiltered() {
        return roles.filter(r =>
            r.name.toLowerCase().includes(search.toLowerCase())
        );
    }

    const filtered = getFiltered();
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    async function handleConfirmDelete() {
        if (!deleteTarget) return;

        try {
            await deleteRole(deleteTarget.id);
        } catch (err) {
            console.error("Erro ao excluir papel:", err);
        } finally {
            setDeleteTarget(null);
            loadRoles();
        }
    }

    return (
        <div className="text-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Papéis</h1>

                <Button onClick={handleOpenCreate}>
                    + Novo papel
                </Button>
            </div>

            {/* Busca */}
            <input
                type="text"
                placeholder="Buscar papel..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                }}
                className="w-full mb-4 px-4 py-2 rounded-lg bg-[#1e1e22] border border-[#2a2a30] text-gray-200"
            />

            {/* Lista */}
            {loading ? (
                <p className="text-gray-400">Carregando papéis…</p>
            ) : filtered.length === 0 ? (
                <p className="text-gray-400">Nenhum papel encontrado.</p>
            ) : (
                <div className="space-y-3">
                    {paginated.map((role) => (
                        <div
                            key={role.id}
                            className="bg-[#1b1b1f] border border-[#2a2a30] p-4 rounded-lg flex justify-between items-center"
                        >
                            <div>
                                <p className="font-medium">{role.name}</p>
                                <p className="text-gray-500 text-sm">{role.slug}</p>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => handleOpenEdit(role)}
                                >
                                    Editar
                                </Button>

                                <Button
                                    intent="danger"
                                    onClick={() => setDeleteTarget(role)}
                                >
                                    Remover
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Paginação */}
            {filtered.length > pageSize && (
                <div className="flex justify-center mt-6 gap-2 items-center">
                    <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        Anterior
                    </Button>

                    <span className="text-sm text-gray-300">
                        Página {currentPage} de {totalPages}
                    </span>

                    <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                        }
                    >
                        Próxima
                    </Button>
                </div>
            )}

            {/* Modal de criar/editar */}
            <RoleFormModal
                open={openForm}
                onClose={() => setOpenForm(false)}
                onSaved={loadRoles}
                editingRole={editingRole}
            />

            {/* Modal de confirmação de exclusão */}
            <ConfirmDialog
                open={!!deleteTarget}
                title="Excluir papel"
                message={
                    deleteTarget
                        ? `Deseja excluir o papel "${deleteTarget.name}"?`
                        : ""
                }
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
