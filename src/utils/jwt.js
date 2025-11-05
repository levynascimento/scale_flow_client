export function decodeJWT(token) {
    try {
        const payload = token.split('.')[1]
        const decoded = JSON.parse(atob(payload))
        return decoded
    } catch (err) {
        console.error('Erro ao decodificar token:', err)
        return null
    }
}