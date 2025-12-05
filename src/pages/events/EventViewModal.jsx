// src_frontend/pages/events/EventViewModal.jsx

import Button from '../../components/Button.jsx'

function formatDateTime(value) {
    if (!value) return '-'
    const date = new Date(value)
    return date.toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
    })
}

export default function EventViewModal({ open, event, onClose, onEdit, onDelete }) {
    if (!open || !event) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div
                className="
          bg-[#1b1b1f] border border-[#2a2a30]
          rounded-2xl p-6 w-[95%] max-w-xl
          shadow-2xl transform transition-all duration-200
          translate-y-0 scale-100
        "
            >
                <h2 className="text-2xl font-semibold text-[#c4b5ff] mb-2">
                    {event.name}
                </h2>

                <p className="text-sm text-gray-400 mb-4">
                    {formatDateTime(event.startingTime)} &rarr; {formatDateTime(event.endingTime)}
                </p>

                <div className="flex flex-wrap gap-3 text-sm text-gray-300 mb-6">
          <span className="px-3 py-1 rounded-full bg-[#111118] border border-[#2a2a30]">
            Escalações: {event.escalationsCount ?? 0}
          </span>
                    <span className="px-3 py-1 rounded-full bg-[#111118] border border-[#2a2a30]">
            Sugestões: {event.suggestionsCount ?? 0}
          </span>
                    <span className="px-3 py-1 rounded-full bg-[#111118] border border-[#2a2a30]">
            Músicas escolhidas: {event.chosenMusicsCount ?? 0}
          </span>
                </div>

                <div className="flex justify-between items-center gap-3">
                    <Button
                        variant="outline"
                        className="border-[#2a2a30] text-gray-300 hover:bg-[#191920]"
                        onClick={onClose}
                    >
                        Fechar
                    </Button>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="border-[#2a2a30] text-gray-300 hover:bg-[#191920]"
                            onClick={onEdit}
                        >
                            Editar
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700"
                            onClick={onDelete}
                        >
                            Excluir
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
