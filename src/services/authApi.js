import api, { setAuthToken } from './api'
import { decodeJWT } from '../utils/jwt'

export async function loginUser(credentials) {
    const { data } = await api.post('/auth/login', credentials)
    const token = data.token

    // salva token e configura para o axios
    setAuthToken(token)
    localStorage.setItem('sf:token', token)

    // decodifica o token para obter o e-mail
    const decoded = decodeJWT(token)
    if (decoded) {
        localStorage.setItem('sf:userEmail', decoded.sub || '')
    }

    return decoded
}
