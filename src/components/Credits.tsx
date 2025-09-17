import { useState } from "react";

export default function Credits() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="text-red-500 font-bold rounded-full w-3 h-3 flex items-center justify-center border border-red-500 hover:bg-red-500 hover:text-white transition hover:cursor-pointer"
            >
                i
            </button>

            {open && (
                <div
                    className="fixed inset-0 bg-gray-500/50 bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="bg-gray-700 text-white p-6 rounded-lg max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h5 className="text-lg font-bold mb-4">sprite credits</h5>
                        <div className="text-sm space-y-2">
                            <div>
                                pokémon emerald sprites by <a href="https://www.spriters-resource.com/profile/a.j.+nitro/" target="_blank" rel="noopener noreferrer" className="underline text-red-500">a.j. nitro</a>
                            </div>
                            <div>
                                pokémon diamond/pearl sprites by <a href="https://www.spriters-resource.com/profile/random+talking+bush/" target="_blank" rel="noopener noreferrer" className="underline text-red-500">random talking bush</a>
                            </div>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="mt-4 px-4 py-2 bg-gray-600 border border-white rounded hover:bg-gray-800 hover:cursor-pointer"
                        >
                            close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
