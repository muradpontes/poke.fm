import { useState } from "react";
import KofiButton from "kofi-button";

export const StyledKofiButton = () => {
  return (
    <KofiButton color="#ff38b8" title="buy me a coffee!!!" kofiID="pokefm" />
  )
}

export default function WhatsNew() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="text-center my-4">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 text-white rounded-md hover:text-red-500 font-[PokemonXY] cursor-pointer"
        >
          whats new
        </button>

      </div>


      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="rounded-lg p-6 w-11/12 max-w-lg relative bg-[#404040]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">new features</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>weekly / all time mode toggle</li>
              <li>change trainer card colors</li>
              <li>added save button</li>
              <li>your all time artist now faints if you didnt listen to them in the last week</li>
              <li>health bars now change according with plays</li>
            </ul>
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
