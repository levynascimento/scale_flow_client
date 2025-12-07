import { useNavigate, useParams } from "react-router-dom";
import { KeyRound, Music, Calendar } from "lucide-react";

export default function Holyrics() {
    const { id } = useParams();
    const navigate = useNavigate();

    const cards = [
        {
            icon: KeyRound,
            title: "Credenciais",
            subtitle: "Configurar API Key e Token",
            path: "credentials",
        },
        {
            icon: Music,
            title: "Músicas",
            subtitle: "Consultar e importar do Holyrics",
            path: "musics",
        },
        {
            icon: Calendar,
            title: "Eventos",
            subtitle: "Consultar e importar do Holyrics",
            path: "events",
        },
    ];

    return (
        <div className="space-y-6">

            <h1 className="text-2xl font-semibold text-gray-100">Integração Holyrics</h1>
            <p className="text-gray-400">
                Importe músicas e eventos automaticamente para o ScaleFlow.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((c, i) => (
                    <div
                        key={i}
                        onClick={() => navigate(`/bands/${id}/holyrics/${c.path}`)}
                        className="cursor-pointer bg-[#1b1b1f] border border-[#2a2a30] p-6 rounded-xl hover:bg-[#25252a] transition"
                    >
                        <c.icon size={32} className="text-[#7c5fff] mb-3" />

                        <h2 className="text-lg font-semibold">{c.title}</h2>
                        <p className="text-gray-400 text-sm">{c.subtitle}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
