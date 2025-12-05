import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    getBandById,
    getBandJoinCode,
    regenerateJoinCode,
    getBandMembers
} from '../../services/bandApi'
import { getBandMusics } from '../../services/musicApi'
import Button from '../../components/Button.jsx'
import toast from 'react-hot-toast'
import { RotateCcw } from 'lucide-react'

export default function BandHome() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [band, setBand] = useState(null)
    const [musicCount, setMusicCount] = useState(0)
    const [memberCount, setMemberCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [regenLoading, setRegenLoading] = useState(false)

    // 🔥 Agora pegamos a role DIRETO do localStorage
    const role = localStorage.getItem("bandRole") || "MEMBER"

    useEffect(() => {
        async function load() {
            try {
                const bandData = await getBandById(id)

                // Carregar join code apenas se for ADMIN
                let joinCode = null
                if (role === "ADMIN") {
                    try {
                        const codeResp = await getBandJoinCode(id)
                        joinCode = codeResp?.joinCode || null
                    } catch (err) {
                        joinCode = null
                    }
                }

                const musics = await getBandMusics(id)
                const members = await getBandMembers(id)

                setBand({
                    ...bandData,
                    joinCode
                })
                setMusicCount(musics.length)
                setMemberCount(members.length)

            } catch (err) {
                console.error("Erro ao carregar banda:", err)
                toast.error("Erro ao carregar dados da banda.")
                setBand({ name: "Erro ao carregar", joinCode: null })
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [id, role])

    async function handleRegenerateCode() {
        setRegenLoading(true)
        try {
            const data = await regenerateJoinCode(id)
            setBand(prev => ({ ...prev, joinCode: data.joinCode }))
            toast.success("Novo código gerado com sucesso!")
        } catch (err) {
            console.error(err)
            toast.error("Erro ao regenerar o código.")
        } finally {
            setRegenLoading(false)
        }
    }

    if (loading) return <div className="p-8 text-gray-300">Carregando...</div>

    return (
        <div className="p-8 space-y-8 text-gray-100">
            {/* Cabeçalho */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-bold">{band?.name}</h1>

                    {role === "ADMIN" && (
                        <span className="text-sm bg-[#7c5fff]/20 text-[#a08cff] border border-[#7c5fff]/40 px-3 py-1 rounded-lg">
                            Admin
                        </span>
                    )}
                </div>

                {/* Mostrar join code apenas para ADMIN */}
                {role === "ADMIN" && band.joinCode && (
                    <div className="bg-[#1e1e22] border border-[#2a2a30] rounded-xl p-4 text-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Código da banda:</p>
                                <code className="bg-[#2a2a2f] px-3 py-1 rounded text-[#7c5fff] font-semibold">
                                    {band.joinCode}
                                </code>
                            </div>

                            <button
                                onClick={handleRegenerateCode}
                                disabled={regenLoading}
                                className={`flex items-center gap-2 bg-[#7c5fff]/20 border border-[#7c5fff]/40 
                                    text-[#a08cff] hover:bg-[#7c5fff]/30 transition-all px-4 py-2 rounded-lg font-medium
                                    ${regenLoading ? 'opacity-60 cursor-not-allowed' : ''}
                                `}
                            >
                                <RotateCcw className={`w-4 h-4 ${regenLoading ? 'animate-spin' : ''}`} />
                                {regenLoading ? "Gerando..." : "Regenerar Código"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard title="Músicas" value={musicCount} />
                <StatCard title="Integrantes" value={memberCount} />
                <StatCard title="Criada em" value={new Date().toLocaleDateString("pt-BR")} />
            </div>

            {/* Repertório */}
            <Button
                onClick={() => navigate(`/bands/${id}/repertoires`)}
                className="bg-[#7c5fff] hover:bg-[#6b4ef9] text-white mt-4"
            >
                Ir para o Repertório
            </Button>
        </div>
    )
}

function StatCard({ title, value }) {
    return (
        <div className="bg-[#1e1e22] border border-[#2a2a30] rounded-xl p-4 text-center">
            <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
            <p className="text-2xl font-bold text-gray-100">{value}</p>
        </div>
    )
}
