import { useEffect, useState } from "react";
import { getCurrentUser, updateUser, updatePassword, deleteUser } from "../../services/userApi.js";
import toast from "react-hot-toast";
import Button from "../../components/Button.jsx";
import Input from "../../components/Input.jsx";

export default function UserSettings() {
    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const u = await getCurrentUser();
                setUser(u);
                setName(u.name);
                setEmail(u.email);
            } catch (err) {
                toast.error("Erro ao carregar dados do usuário.");
            }
        }
        load();
    }, []);

    async function handleUpdateUser() {
        try {
            await updateUser({ name, email });
            toast.success("Dados atualizados!");
        } catch {
            toast.error("Erro ao atualizar usuário.");
        }
    }

    async function handleChangePassword() {
        if (!password.trim()) {
            toast.error("A senha não pode ser vazia.");
            return;
        }

        try {
            await updatePassword(password);
            toast.success("Senha alterada!");
            setPassword("");
        } catch {
            toast.error("Erro ao alterar senha.");
        }
    }

    async function handleDeleteAccount() {
        const confirmDelete = confirm("Tem certeza que deseja deletar sua conta?");
        if (!confirmDelete) return;

        try {
            await deleteUser();
            toast.success("Conta deletada!");
            localStorage.clear();
            window.location.href = "/auth/login";
        } catch {
            toast.error("Erro ao deletar conta.");
        }
    }

    if (!user) return <div className="p-8 text-gray-300">Carregando...</div>;

    return (
        <div className="p-8 space-y-10">

            <h1 className="text-3xl font-bold">Configurações da Conta</h1>

            {/* DADOS DO USUÁRIO */}
            <div className="bg-sf-card p-6 rounded-xl border border-sf-border space-y-4">

                <h2 className="text-xl font-semibold">Dados do Usuário</h2>

                <Input
                    label="Nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <Input
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <Button className="mt-2 bg-sf-primary hover:bg-sf-primary/80" onClick={handleUpdateUser}>
                    Salvar Alterações
                </Button>
            </div>

            {/* SENHA */}
            <div className="bg-sf-card p-6 rounded-xl border border-sf-border space-y-4">

                <h2 className="text-xl font-semibold">Alterar Senha</h2>

                <Input
                    label="Nova Senha"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Button className="mt-2 bg-blue-600 hover:bg-blue-700" onClick={handleChangePassword}>
                    Atualizar Senha
                </Button>
            </div>

            {/* ZONA DE PERIGO */}
            <div className="bg-sf-card p-6 rounded-xl border border-red-900/50 space-y-4">
                <h2 className="text-xl font-semibold text-red-400">Zona de Perigo</h2>

                <Button className="bg-red-600 hover:bg-red-700" onClick={handleDeleteAccount}>
                    Deletar Conta
                </Button>
            </div>

        </div>
    );
}
