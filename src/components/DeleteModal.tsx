interface DeleteModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function DeleteModal({ title, message, onConfirm, onCancel }: DeleteModalProps) {
    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
            
            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl transform transition-all scale-100">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">{title}</h2>
                    <p className="text-gray-600 mb-6">{message}</p>
                    
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 cursor-pointer flex items-center gap-2"
                        >
                            Batal
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 cursor-pointer flex items-center gap-2 transform hover:scale-105"
                        >
                            Hapus
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
