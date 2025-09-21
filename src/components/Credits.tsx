import { useState } from "react";

export default function Credits() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-red-500 font-bold w-3 h-3 flex items-center justify-center transition hover:cursor-pointer"
      >
           ⓘ
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-gray-500/50 bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-[var(--background)] text-white p-6 rounded-lg max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h5 className="text-lg font-bold mb-4">credits</h5>
            <div className="text-sm space-y-2">
              <div>
                pokémon emerald sprites by <a href="https://www.spriters-resource.com/profile/a.j.+nitro/" target="_blank" rel="noopener noreferrer" className="underline text-red-500">a.j. nitro</a>
              </div>
              <div>
                pokémon platinum sprites by <a href="https://www.spriters-resource.com/profile/random+talking+bush/" target="_blank" rel="noopener noreferrer" className="underline text-red-500">random talking bush</a>
              </div>
              <div>
                pokémon black/white sprites by <a href="https://www.spriters-resource.com/profile/ploaj/" target="_blank" rel="noopener noreferrer" className="underline text-red-500">ploaj</a>
              </div>
              <div>
                pokémon scarlet/violet sprites by <a href="https://www.deviantart.com/ezerart" target="_blank" rel="noopener noreferrer" className="underline text-red-500">ezerart</a>
              </div>
              <div>
                all others by <a href="https://www.pokecommunity.com/threads/gen-vi-ds-style-64x64-pokemon-sprite-resource.314422/#post-7972072" target="_blank" rel="noopener noreferrer" className="underline text-red-500">poke community</a>
              </div>
              <div>
                <span className="font-bold mt-2 inline-block">
                  powered by <a href="https://www.last.fm/api" target="_blank" rel="noopener noreferrer" className="underline text-red-500">audioscrobbler/lastfm api</a>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
