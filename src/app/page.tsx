'use client';
import { useState } from "react";
import Card from "@/components/Card";
import Team from "@/components/Team";
import WhatsNew from "@/components/WhatsNew";
import Credits from "@/components/Credits";

export default function Home() {
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [username, setUsername] = useState("");
  const [submittedUsername, setSubmittedUsername] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!username.trim()) return;
    setSubmittedUsername(username.trim());
    setLoading(true);

    try {
      const res = await fetch(`/api/usuario?user=${encodeURIComponent(username.trim())}`);

      if (!res.ok) throw new Error("user not found");

      const data = await res.json();
      setUserData(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setUserData(null);
      setError("user not found");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (hasDownloaded) return;

    const cardCanvas = document.querySelector('#cardCanvas') as HTMLCanvasElement;
    const teamCanvas = document.querySelector('#menu') as HTMLCanvasElement;
    if (!cardCanvas || !teamCanvas) return;

    const teamWidth = teamCanvas.width;
    const cardAspect = cardCanvas.width / cardCanvas.height;
    const cardHeight = teamWidth / cardAspect;

    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = teamWidth;
    combinedCanvas.height = cardHeight + teamCanvas.height;

    const ctx = combinedCanvas.getContext('2d')!;
    ctx.drawImage(cardCanvas, 0, 0, cardCanvas.width, cardCanvas.height, 0, 0, teamWidth, cardHeight);
    ctx.drawImage(teamCanvas, 0, cardHeight, teamWidth, teamCanvas.height);

    const link = document.createElement('a');
    link.download = 'poke-fm.png';
    link.href = combinedCanvas.toDataURL('image/png');
    link.click();

    setHasDownloaded(true);
  };

  return (
    <div className="flex flex-col min-h-screen font-[PokemonXY] text-white">

      <h2 className="text-2xl font-bold text-center mt-4">
        poke.fm
      </h2>

      <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
        <div id="inputContainer" className="flex justify-center gap-2 mx-auto my-4 px-4">
          <input
            type="text"
            id="usernameInput"
            placeholder="last.fm username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="flex-1 max-w-[8rem] px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-[var(--background)] text-white placeholder-gray-400"
          />

          <button
            id="fetchBtn"
            onClick={handleSubmit}
            disabled={!username.trim()}
            className={`px-4 py-2 text-base rounded-md focus:outline-none ${username.trim()
              ? 'bg-red-500 hover:bg-red-600 cursor-pointer'
              : 'bg-gray-500 cursor-not-allowed'
            }`}
          >
            submit!!!
          </button>

        </div>

        {loading && (
          <p className="text-center mb-4 text-gray-500">
            loading...
          </p>
        )}

        {!loading && error && (
          <p className="text-center mb-4 text-red-500">
            {error}
          </p>
        )}

        {submittedUsername && userData && (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-3xl">
              <Card username={submittedUsername} data={userData} />
            </div>

            <div className="w-full max-w-3xl">
              <Team username={submittedUsername} data={userData} />
            </div>

            <button
              onClick={handleSave}
              className="px-4 py-2 my-2 mt-4 text-white bg-red-500 rounded-md hover:bg-red-600 cursor-pointer"
            >
              save!!!
            </button>
          </div>
        )}
      </div>

      <footer className="mt-auto text-center py-5 text-sm text-gray-400">
        <div className="text-center my-4">
          <h3 className="font-[PokemonXY]">
            nintendo does not endorse or sponsor this project{" "}
            <span className="inline-block align-middle">
              <Credits/>
            </span>
          </h3>
        </div>
        ©{" "}
        <a href="https://www.last.fm/user/ohhhio" className="text-red-500 hover:text-red-400" target="_blank" rel="noopener noreferrer">
          ohhhio
        </a>{" "}
        {new Date().getFullYear()}
      </footer>

    </div>
  );
}
