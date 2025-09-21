'use client';
import { useState, useRef } from "react";
import Card from "@/components/Card";
import Team from "@/components/Team";
import WhatsNew from "@/components/WhatsNew";
import Credits from "@/components/Credits";

import { SpeedInsights } from "@vercel/speed-insights/next"

export default function Home() {
  //const [hasDownloaded, setHasDownloaded] = useState(false);
  const [username, setUsername] = useState("");
  const [submittedUsername, setSubmittedUsername] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null)
  const [showGif, setShowGif] = useState(true);
  const teamRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    setShowGif(false);
    if (!username.trim()) return;
    setSubmittedUsername(username.trim());
    setLoading(true);

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE || '';
      const res = await fetch(`${baseURL}/api/usuario?user=${encodeURIComponent(username.trim())}`);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message = errorData?.error || "user not found!!!";
        throw new Error(message);
      }

      const data = await res.json();
      setUserData(data);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "unknown error";
      console.error("error fetching data: ", message);
      setUserData(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const handleBase = async () => {
    if (!teamRef.current) return;

    const cardCanvas = document.getElementById('cardCanvas') as HTMLCanvasElement | null;
    const menuCanvas = document.getElementById('menu') as HTMLCanvasElement | null;
    if (!cardCanvas || !menuCanvas) return;

    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>(res => {
        const img = new Image();
        img.src = src;
        img.onload = () => res(img);
        img.onerror = () => res(img);
      });

    const baseImg = await loadImage('/base.png');

    const canvas = document.createElement('canvas');
    canvas.width = baseImg.width;
    canvas.height = baseImg.height;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(baseImg, 0, 0);

    const combinedCanvas = document.createElement('canvas');
    const teamWidth = menuCanvas.width;
    const cardAspect = cardCanvas.width / cardCanvas.height;
    const cardHeight = teamWidth / cardAspect;

    combinedCanvas.width = teamWidth;
    combinedCanvas.height = cardHeight + menuCanvas.height;

    const ctxCombined = combinedCanvas.getContext('2d')!;
    ctxCombined.drawImage(cardCanvas, 0, 0, cardCanvas.width, cardCanvas.height, 0, 0, teamWidth, cardHeight);
    ctxCombined.drawImage(menuCanvas, 0, cardHeight, teamWidth, menuCanvas.height);

    const scale = canvas.width / combinedCanvas.width;
    const newWidth = canvas.width;
    const newHeight = combinedCanvas.height * scale;
    ctx.drawImage(combinedCanvas, 0, 195, newWidth, newHeight);

    const selects = teamRef.current.querySelectorAll('select') as NodeListOf<HTMLSelectElement>;
    const firstVal = selects[0]?.value ?? '';
    const secondVal = selects[1]?.value ?? '';

    const periodLabels: Record<string, string> = {
      '7day': '7 days',
      '1month': '1 month',
      '3month': '3 months',
      '6month': '6 months',
      '12month': '12 months',
      'overall': 'overall'
    };
    const firstLabel = periodLabels[firstVal] ?? firstVal;
    const secondLabel = periodLabels[secondVal] ?? secondVal;

    const text = `${submittedUsername} | ${firstLabel} / ${secondLabel}`;
    ctx.font = "48px 'PokemonXY'";
    ctx.lineWidth = 6;
    ctx.strokeStyle = "black";
    ctx.strokeText(text, 58, 1844);
    ctx.fillStyle = "white";
    ctx.fillText(text, 58, 1844);

    const link = document.createElement('a');
    link.download = 'stories.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleSave = () => {

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
    link.download = 'pokefm.png';
    link.href = combinedCanvas.toDataURL('image/png');
    link.click();
  };

  const handleShare = () => {

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

    combinedCanvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], 'pokefm.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'pokefm',
            text: 'check my pokefm chart!',
          });
        } catch (err) {
          console.error('erro ao compartilhar:', err);
        }
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'pokefm.png';
        link.click();
        URL.revokeObjectURL(link.href);
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SpeedInsights />
      <h1 className="text-6xl text-center">
        poke.fm
      </h1>

      <h3 className="text-center mb-4 mt-4">
        pokemon trainer card and team with your overall{" "}
        <a
          href="https://www.last.fm/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-600 underline hover:text-red-800"
        >
          last.fm
        </a>{" "}
        stats
      </h3>

      <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 mb-4">
        <div id="inputContainer" className="flex justify-center gap-2 mx-auto px-4 mb-4">
          <input
            type="text"
            id="usernameInput"
            placeholder="last.fm username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="flex-1 max-w-[8rem] px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-gray-400  bg-[#404040]"
          />


          <button
            id="fetchBtn"
            onClick={handleSubmit}
            disabled={!username.trim()}
            className={`px-4 py-2 text-base text-white rounded-md focus:outline-none  ${username.trim()
              ? "bg-red-800 hover:bg-red-500 cursor-pointer"
              : "bg-gray-500 cursor-not-allowed"
              }`}
          >
            submit!!
          </button>


        </div>

        {loading && (
          <p className="text-center mb-4 text-white ">
            loading
            <span className="animate-pulse">.</span>
            <span className="animate-pulse delay-200">.</span>
            <span className="animate-pulse delay-400">.</span>
          </p>
        )}


        {!loading && error && (
          <p className="text-center mb-4 text-red-500">
            {error}
          </p>
        )}

        {showGif && (
          <div className="flex flex-col items-center justify-center mt-3 min-h-[20vh]">
            <img src="/team.gif" alt="loading" />
          </div>
        )}


        {submittedUsername && userData && (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-3xl">
              <Card username={submittedUsername} data={userData} />
            </div>

            <div className="w-full max-w-3xl" ref={teamRef}>
              <Team username={submittedUsername} data={userData} />
            </div>

            <div className="flex gap-2 mb-4">
              <a
                onClick={handleSave}
                className="bg-blue-500 w-8 h-8 rounded-md hover:bg-blue-700 cursor-pointer inline-flex items-center justify-center"
              >
                <img
                  src="/down.png"
                  alt="download icon"
                  className="w-4 h-4 filter invert"
                />
              </a>

              <a
                onClick={handleShare}
                className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center hover:bg-blue-700 cursor-pointer"
              >
                <img
                  src="/share.png"
                  alt="share icon"
                  className="w-4   h-4 filter invert"
                />
              </a>

              <a
                onClick={handleBase}
                className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center hover:bg-green-700 cursor-pointer"
              >
                <img
                  src="/share.png"
                  alt="share icon"
                  className="w-4 h-4 filter invert"
                />
              </a>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-auto text-center py-3 text-sm text-white-500">
        <div className="text-center my-4">
          <WhatsNew></WhatsNew>
          <h2>
            nintendo does not endorse or sponsor this project{" "}
            <span className="inline-block align-middle">
              <Credits />
            </span>
          </h2>
        </div>
        leave a shout to{" "}
        <a href="https://www.last.fm/user/ohhhio" className="text-red-500 hover:text-red-700" target="_blank" rel="noopener noreferrer">
          ohhhio
        </a> !!
      </footer>

    </div>

  );
}
