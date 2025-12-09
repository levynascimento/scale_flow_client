import api from "./api";

// 🧑 Buscar dados do usuário logado
export async function getCurrentUser() {
    const { data } = await api.get("/users");
    return data;
}

// ✏️ Atualizar nome e email
export async function updateUser(body) {
    const { data } = await api.put("/users", body);
    return data;
}

// 🔒 Atualizar senha
export async function updatePassword(password) {
    const { data } = await api.put("/users/password", { password });
    return data;
}

// ❌ Deletar conta do usuário logado
export async function deleteUser() {
    await api.delete("/users");
}
