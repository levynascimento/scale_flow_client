
export default function EventDetailsCard({ event }) {
    return (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-lg p-8 max-w-3xl mx-auto border border-neutral-200 dark:border-neutral-700">

            <h1 className="text-3xl font-bold text-violet-600 dark:text-violet-400 mb-3">
                {event.title}
            </h1>

            <p className="text-neutral-600 dark:text-neutral-300 text-lg mb-4">
                📅 {event.date}
            </p>

            <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed mb-6 text-lg">
                {event.description}
            </p>

            {event.location && (
                <p className="text-neutral-700 dark:text-neutral-300">
                    📍 <strong>Local:</strong> {event.location}
                </p>
            )}

            {event.participants?.length > 0 && (
                <div className="mt-6">
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                        Participantes:
                    </h3>
                    <ul className="list-disc ml-6 text-neutral-700 dark:text-neutral-300">
                        {event.participants.map(p => (
                            <li key={p.id}>{p.name}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
