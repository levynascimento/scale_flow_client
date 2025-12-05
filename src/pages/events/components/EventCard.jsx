// src_frontend/pages/events/EventCard.jsx

function formatDateTime(value) {
    if (!value) return '-'
    const date = new Date(value)
    return date.toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
    })
}

export default function EventCard({ event, onClick }) {
    const {
        name,
        startingTime,
        endingTime,
        escalationsCount,
        suggestionsCount,
        chosenMusicsCount
    } = event

    return (
        <button
            onClick={onClick}
            className="
        w-full text-left
        bg-[#1b1b1f] border border-[#2a2a30]
        rounded-2xl p-4
        hover:border-[#7c5fff]
        hover:-translate-y-1 hover:shadow-lg
        transition-all duration-200
      "
        >
            <h3 className="text-lg font-semibold text-[#c4b5ff] mb-1">
                {name}
            </h3>

            <p className="text-xs text-gray-400 mb-2">
                {formatDateTime(startingTime)} &rarr; {formatDateTime(endingTime)}
            </p>

            <div className="flex items-center gap-3 text-xs text-gray-400 mt-3">
        <span className="px-2 py-1 rounded-full bg-[#111118] border border-[#2a2a30]">
          Escalações: {escalationsCount ?? 0}
        </span>
                <span className="px-2 py-1 rounded-full bg-[#111118] border border-[#2a2a30]">
          Sugestões: {suggestionsCount ?? 0}
        </span>
                <span className="px-2 py-1 rounded-full bg-[#111118] border border-[#2a2a30]">
          Músicas escolhidas: {chosenMusicsCount ?? 0}
        </span>
            </div>
        </button>
    )
}
