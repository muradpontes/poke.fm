'use client';
import { useEffect, useRef, useState } from 'react';
import { parseGIF, decompressFrames } from "gifuct-js";

interface UserInfo {
  artist_count: any;
  name: string;
  playcount: number;
  registered: { unixtime: string };
  image: { size: string; '#text': string }[];
  id: string;
}

interface Album {
  name: string;
  artist?: string;
  image: { size: string; '#text': string }[];
}

interface Props {
  username: string;
  data: {
    userInfo: UserInfo;
    topAlbums: Album[];
    charts: Record<string, { artists: any[]; albums: Album[] }>;
  };
}

export default function Card({ username, data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [useAltCard, setUseAltCard] = useState(false);
  const [randomId, setRandomId] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("7day");
  const [superUsers, setSuperUsers] = useState<string[]>([]);

  useEffect(() => {
    async function fetchSuperUsers() {
      try {
        const res = await fetch(`/api/super`);
        const json: string[] = await res.json();
        setSuperUsers(json.map(u => u.toLowerCase()));
      } catch { }
    }
    fetchSuperUsers();
  }, []);

  useEffect(() => {
    if (!data?.userInfo) return;
    setRandomId(Math.floor(Math.random() * 90000) + 10000);
  }, [data]);

  function drawCircularImage(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    centerX: number,
    centerY: number,
    radius: number
  ) {
    const size = radius * 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, centerX - radius, centerY - radius, size, size);
    ctx.restore();
  }

  async function drawGifAvatar(
    ctx: CanvasRenderingContext2D,
    url: string,
    centerX: number,
    centerY: number,
    radius: number
  ) {
    const size = radius * 2;
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const gif = parseGIF(buffer);
    const frames = decompressFrames(gif, true);

    let frameIndex = 0;
    function drawFrame() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.clearRect(centerX - radius, centerY - radius, size, size);

      const frame = frames[frameIndex];
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = frame.dims.width;
      tempCanvas.height = frame.dims.height;
      const tempCtx = tempCanvas.getContext("2d")!;
      const imageData = new ImageData(
        new Uint8ClampedArray(frame.patch),
        frame.dims.width,
        frame.dims.height
      );
      tempCtx.putImageData(imageData, 0, 0);
      ctx.drawImage(tempCanvas, centerX - radius, centerY - radius, size, size);
      ctx.restore();

      frameIndex = (frameIndex + 1) % frames.length;
      setTimeout(drawFrame, frame.delay || 100);
    }
    drawFrame();
  }

  useEffect(() => {
    const drawCard = async () => {
      const canvas = canvasRef.current;
      if (!canvas || !data?.userInfo || randomId === null) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const font = new FontFace('PokemonXY', 'url(/font.ttf)');
      await font.load();
      (document as any).fonts.add(font);

      const lowerUsername = username.toLowerCase();
      const isSuper = superUsers.includes(lowerUsername);

      const cardImageSrc =
        lowerUsername === "ohhhio"
          ? "cardo.png"
          : useAltCard
            ? isSuper
              ? "1stargreencard.png"
              : "cardup2.png"
            : isSuper
              ? "1starpinkcard.png"
              : "cardup.png";

      const baseImg = await loadImage(cardImageSrc);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(baseImg, 0, 0);

      const userData = data.userInfo;

      ctx.font = '36px PokemonXY';
      ctx.fillStyle = 'black';
      ctx.fillText(userData.name.toUpperCase(), 185, 171);
      ctx.fillText(
        lowerUsername === "ohhhio" ? "00001" : String(randomId),
        488,
        99
      );
      ctx.fillText(userData.playcount.toLocaleString(), 326, 243);
      ctx.fillText(userData.artist_count.toString(), 326, 292);
      ctx.fillText(
        new Date(parseInt(userData.registered.unixtime) * 1000).getFullYear().toString(),
        326,
        339
      );

      const avatarURL = userData.image?.find(i => i.size === "large")?.["#text"];
      if (avatarURL) {
        const gifURL = avatarURL.replace(".png", ".gif");
        if (lowerUsername === "ohhhio") {
          try {
            const res = await fetch(gifURL, { method: "HEAD" });
            if (res.ok) {
              await drawGifAvatar(ctx, gifURL, 552, 240, 76);
            } else {
              const avatar = await loadImage(avatarURL);
              drawCircularImage(ctx, avatar, 552, 240, 76);
            }
          } catch {
            const avatar = await loadImage(avatarURL);
            drawCircularImage(ctx, avatar, 552, 240, 76);
          }
        } else {
          const avatar = await loadImage(avatarURL);
          drawCircularImage(ctx, avatar, 552, 240, 76);
        }
      }

      const albumPositions = [
        { x: 96, y: 372 },
        { x: 168, y: 372 },
        { x: 240, y: 372 },
        { x: 312, y: 372 },
        { x: 384, y: 372 },
        { x: 456, y: 372 },
        { x: 528, y: 372 },
        { x: 600, y: 372 },
      ];

      const list =
        selectedPeriod === "overall"
          ? data.charts.overall?.albums || []
          : data.charts[selectedPeriod]?.albums || [];

      for (let i = 0; i < list.length && i < albumPositions.length; i++) {
        const album = list[i];
        const imgURL = album.image?.find(img => img.size === 'large')?.['#text'];
        if (!imgURL) continue;

        const img = await loadImage(imgURL);
        const pos = albumPositions[i];
        ctx.drawImage(img, pos.x, pos.y, 48, 48);
      }
    };

    drawCard();
  }, [data, randomId, useAltCard, selectedPeriod, superUsers]);

  return (
    <div className="text-center">
      <div className="flex justify-center gap-2 mb-2 flex-wrap">
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 text-base mb-4 border border-white rounded-md cursor-pointer bg-gray-800 text-white font-[PokemonXY]"
        >
          <option value="7day">7 days</option>
          <option value="1month">1 month</option>
          <option value="3month">3 months</option>
          <option value="6month">6 months</option>
          <option value="12month">12 months</option>
          <option value="overall">overall</option>
        </select>
        <button
          onClick={() => setUseAltCard(!useAltCard)}
          className="px-4 py-2 text-base mb-4 text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none cursor-pointer font-[PokemonXY]"
        >
          {useAltCard ? 'color' : 'color'}
        </button>
      </div>

      <canvas
        id="cardCanvas"
        ref={canvasRef}
        width={720}
        height={480}
        className="w-full h-auto border border-gray-800"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}
