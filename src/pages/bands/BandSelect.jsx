import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBands, createBand, joinBand } from '../../services/bandApi'
import { Music } from 'lucide-react'
import Button from '../../components/Button.jsx'

export default function BandSelect() {
    const [bands, setBands] = useState([])
    const [newBandName, setNewBandName] = useState('')
    const [joinCode, setJoinCode] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function loadBands() {
        try {
            setBands(await getBands())
        } catch (err) {
            console.error('Erro ao carregar bandas:', err)
        }
    }

    useEffect(() => { loadBands() }, [])

    async function handleCreateBand(e) {
        e.preventDefault()
        if (!newBandName) return
        setLoading(true)
        try {
            const band = await createBand({ name: newBandName })

            // atualiza a lista para exibir a banda nova quando voltar pra tela
            await loadBands()

            // manda o usuário pra home da banda criada
            navigate(`/bands/${band.id}/home`)
        } catch (err) {
            console.error('Erro ao criar banda:', err)
            alert('Erro ao criar banda.')
        } finally {
            setLoading(false)
        }
    }


    async function handleJoinBand(e) {
        e.preventDefault()
        if (!joinCode) return
        setLoading(true)
        try {
            const membership = await joinBand(joinCode)
            navigate(`/bands/${membership.bandId}/repertoires`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen flex flex-col items-center py-20 px-6 text-gray-100 bg-[#0e0e10] overflow-hidden">
            {/* 🎵 Fundo animado com notas musicais */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                {[...Array(15)].map((_, i) => (
                    <span
                        key={i}
                        className="absolute text-[2rem] text-white opacity-[0.05] animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 10}s`,
                            animationDuration: `${10 + Math.random() * 10}s`,
                            filter: 'blur(1px)',
                        }}
                    >
            🎵
          </span>
                ))}
            </div>

            {/* Brilho gradiente no topo */}
            <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-[#7c5fff33] to-transparent blur-3xl opacity-40"></div>

            {/* Cabeçalho */}
            <div className="relative text-center mb-10 z-10">
                <h1 className="text-4xl md:text-5xl font-bold">
                    Selecione sua <span className="text-[#7c5fff]">Banda</span>
                </h1>
                <p className="text-gray-400 mt-3 text-base md:text-lg">
                    Gerencie grupos e repertórios em um só lugar.
                </p>
            </div>

            {/* Painéis */}
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl z-10">
                {/* Minhas bandas */}
                <div className="bg-gradient-to-br from-[#1b1b1f] to-[#131316] border border-[#2a2a30] rounded-2xl p-6 shadow-[0_0_25px_rgba(124,95,255,0.1)] backdrop-blur-md">
                    <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
                        <Music className="text-[#7c5fff]" /> Minhas Bandas
                    </h2>

                    {bands.length === 0 ? (
                        <p className="text-gray-400 text-sm">
                            Você ainda não participa de nenhuma banda.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {bands.map((integration) => (
                                <li
                                    key={integration.band.id}
                                    onClick={() => navigate(`/bands/${integration.band.id}/home`)}
                                    className="flex justify-between items-center border border-[#3a3a3f] rounded-lg px-4 py-3 hover:bg-[#2a2a2f] cursor-pointer"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-gray-100 font-medium">
                                          {integration.band.name}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                          Papel: {integration.type === 'ADMIN' ? 'Administrador' : integration.type}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Nova banda */}
                <div className="bg-gradient-to-br from-[#1b1b1f] to-[#131316] border border-[#2a2a30] rounded-2xl p-6 shadow-[0_0_25px_rgba(124,95,255,0.1)] backdrop-blur-md">
                    <h2 className="text-xl font-semibold mb-5 text-gray-100">Nova Banda</h2>

                    <form onSubmit={handleCreateBand} className="flex gap-2 mb-6">
                        <input
                            className="flex-1 bg-[#1b1b1f] border border-[#2a2a30] rounded-lg p-2 text-gray-100 placeholder-gray-500
                         focus:ring-2 focus:ring-[#7c5fff] outline-none"
                            placeholder="Nome da banda"
                            value={newBandName}
                            onChange={(e) => setNewBandName(e.target.value)}
                        />
                        <Button type="submit" disabled={loading}>Criar</Button>
                    </form>

                    <hr className="border-[#2a2a30] mb-6" />

                    <h2 className="text-xl font-semibold mb-4 text-gray-100">Entrar com Código</h2>
                    <form onSubmit={handleJoinBand} className="flex gap-2">
                        <input
                            className="flex-1 bg-[#1b1b1f] border border-[#2a2a30] rounded-lg p-2 text-gray-100 placeholder-gray-500
                         focus:ring-2 focus:ring-[#7c5fff] outline-none"
                            placeholder="Código da banda"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                        />
                        <Button variant="outline" disabled={loading}>Entrar</Button>
                    </form>
                </div>
            </div>

            {/* Animação customizada via Tailwind */}
            <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0.1; }
          50% { opacity: 0.25; }
          100% { transform: translateY(-200px) rotate(10deg); opacity: 0.1; }
        }
        .animate-float {
          animation-name: float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>
        </div>
    )
}
