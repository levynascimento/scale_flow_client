export default function ConfirmDialog({
                                          open,
                                          title = 'Confirmar ação',
                                          message,
                                          onConfirm,
                                          onCancel
                                      }) {
    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#1e1e22] border border-[#2a2a30] rounded-xl p-6 w-[90%] max-w-md text-gray-100 shadow-xl">
                <h2 className="text-xl font-semibold mb-3">{title}</h2>
                <p className="text-gray-400 mb-6">{message}</p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg bg-[#2a2a2f] hover:bg-[#34343a] text-gray-300 border border-[#3a3a3f]"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium"
                    >
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    )
}
