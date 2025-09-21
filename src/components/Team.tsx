'use client'
import { useEffect, useState } from 'react'

interface Artist {
    name: string
    rank: number | null
    playcount: number
    overallPlaycount: number
}

interface TeamProps {
    username: string
    data: {
        userInfo: any
        charts: Record<string, { artists: Artist[]; albums: any[] }>
    }
}

type RenderArtist = Artist & {
    sprite: { row?: number; col?: number; customImage?: HTMLImageElement } | null
    sex: 'macho' | 'femea' | 'trans'
    level: number
    hp: number
    maxHp: number
}

export default function Team({ username, data }: TeamProps) {
    const periods: ('7day' | '1month' | '3month' | '6month' | '12month' | 'overall')[] = ['7day', '1month', '3month', '6month', '12month', 'overall']
    const periodLabels: Record<string, string> = {
        '7day': '7 days',
        '1month': '1 month',
        '3month': '3 months',
        '6month': '6 months',
        '12month': '12 months',
        'overall': 'overall'
    }
    const [period, setPeriod] = useState<'7day' | '1month' | '3month' | '6month' | '12month' | 'overall'>('7day')
    const [maxHpPeriod, setMaxHpPeriod] = useState<'1month' | '3month' | '6month' | '12month' | 'overall'>('1month')
    const [hpPeriod, setHpPeriod] = useState<'7day' | '1month' | '3month' | '6month' | '12month'>('7day')
    const [artists, setArtists] = useState<RenderArtist[]>([])

    useEffect(() => {
        if (period !== 'overall') {
            const allowedMaxHpPeriods = periods.slice(periods.indexOf(period) + 1)
            if (!allowedMaxHpPeriods.includes(maxHpPeriod)) setMaxHpPeriod(allowedMaxHpPeriods[0] as any)
            setHpPeriod(period)
        } else {
            if (!hpPeriod) setHpPeriod('7day')
        }

        const chartArtists = (data.charts[period]?.artists ?? []).filter(a => a.rank !== null)
        const maxHpChartArtists = data.charts[maxHpPeriod !== 'overall' ? maxHpPeriod : '12month']?.artists ?? []
        const hpChartArtists = data.charts[hpPeriod]?.artists ?? []

        const maxHpMap = new Map(maxHpChartArtists.map(a => [a.name, maxHpPeriod === 'overall' ? a.overallPlaycount : a.playcount]))
        const hpMap = new Map(hpChartArtists.map(a => [a.name, a.playcount]))

        const newArtists: RenderArtist[] = chartArtists.map(a => {
            const hp = hpMap.get(a.name) ?? 0
            const maxHp = maxHpMap.get(a.name) ?? a.overallPlaycount ?? 1
            const level = Math.max(1, Math.floor((hp / Math.max(maxHp, 1)) * 100))

            return {
                ...a,
                level,
                hp,
                maxHp,
                sprite: null,
                sex: ['macho', 'femea', 'trans'][Math.floor(Math.random() * 3)] as 'macho' | 'femea' | 'trans'
            }
        })

        setArtists(newArtists)
    }, [period, maxHpPeriod, hpPeriod, data])

    useEffect(() => {
        const canvas = document.getElementById('menu') as HTMLCanvasElement
        const ctx = canvas.getContext('2d')!
        ctx.imageSmoothingEnabled = false

        const menuImg = new Image(); menuImg.src = 'menu.png'
        const spriteSheet = new Image(); spriteSheet.src = 'sprites.png'
        const dropdownSpriteSheet = new Image(); dropdownSpriteSheet.src = 'sprites.png'
        const healthbarImg = new Image(); healthbarImg.src = 'healthbar.png'
        const fntImg = new Image(); fntImg.src = "fnt.png"
        const redImg = new Image(); redImg.src = 'red.png'
        const orangeImg = new Image(); orangeImg.src = 'orange.png'
        const greenImg = new Image(); greenImg.src = 'green.png'

        const sexImages: Record<string, HTMLImageElement> = { macho: new Image(), femea: new Image(), trans: new Image() }
        sexImages.macho.src = 'machos.png'
        sexImages.femea.src = 'femeas.png'
        sexImages.trans.src = 'trans.png'

        const sexKeys: ('macho' | 'femea' | 'trans')[] = ['macho', 'femea', 'trans']

        const positions = [
            { x: 9, y: 90, nameX: 80, nameY: 194, lvlX: 160, lvlY: 240, hpX: 194, hpY: 322, sexX: 270, sexY: 210 },
            { x: 357, y: 60, nameX: 432, nameY: 90, lvlX: 470, lvlY: 132, hpX: 805, hpY: 136, sexX: 600, sexY: 103 },
            { x: 357, y: 168, nameX: 432, nameY: 198, lvlX: 470, lvlY: 240, hpX: 805, hpY: 244, sexX: 600, sexY: 210 },
            { x: 357, y: 276, nameX: 432, nameY: 306, lvlX: 470, lvlY: 348, hpX: 805, hpY: 352, sexX: 600, sexY: 318 },
            { x: 357, y: 384, nameX: 432, nameY: 414, lvlX: 470, lvlY: 456, hpX: 805, hpY: 460, sexX: 600, sexY: 426 },
            { x: 357, y: 492, nameX: 432, nameY: 522, lvlX: 470, lvlY: 564, hpX: 805, hpY: 568, sexX: 600, sexY: 534 },
        ]
        const healthbarCoords: Record<number, { x: number, y: number }> = { 0: { x: 32, y: 66 }, 1: { x: 184, y: 20 }, 2: { x: 184, y: 47 }, 3: { x: 184, y: 74 }, 4: { x: 184, y: 101 }, 5: { x: 184, y: 129 } }

        const spriteSize = 96
        let selectedArtist: number | null = null

        function loadImage(img: HTMLImageElement) { return new Promise<HTMLImageElement>(resolve => { if (img.complete && img.naturalHeight !== 0) resolve(img); else { img.onload = () => resolve(img); img.onerror = () => resolve(img) } }) }

        function formatName(name: string) { const maxChars = 18; return name.length > maxChars ? name.substring(0, maxChars) + '...' : name }

        function assignRandomSprites() {
            const rows = Math.floor(spriteSheet.height / spriteSize)
            const cols = Math.floor(spriteSheet.width / spriteSize)
            artists.forEach(a => { a.sprite = { row: Math.floor(Math.random() * rows), col: Math.floor(Math.random() * cols) } })
        }

        function drawHealthBar(ctx: CanvasRenderingContext2D, emptyImg: HTMLImageElement, redImg: HTMLImageElement, orangeImg: HTMLImageElement, greenImg: HTMLImageElement, x: number, y: number, hp: number, maxHp: number, scale: number = 4) {
            const totalWidth = 48, height = 4, ratio = hp / maxHp, filled = hp === 0 ? 0 : Math.max(1, Math.floor(ratio * totalWidth))
            ctx.drawImage(emptyImg, x, y, totalWidth * scale, height * scale)
            let colorImg: HTMLImageElement
            if (hp === 0) colorImg = emptyImg
            else if (ratio >= 2 / 3) colorImg = greenImg
            else if (ratio >= 1 / 3) colorImg = orangeImg
            else colorImg = redImg
            for (let i = 0; i < filled; i++) ctx.drawImage(colorImg, 0, 0, 1, height, x + i * scale, y, scale, height * scale)
        }

        function drawMenu() {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(menuImg, 0, 0, canvas.width, canvas.height)
            artists.forEach((artist, i) => {
                const pos = positions[i]
                if (!pos) return
                if (artist.sprite) ctx.drawImage(artist.sprite.customImage || spriteSheet, artist.sprite.col! * spriteSize, artist.sprite.row! * spriteSize, spriteSize, spriteSize, pos.x, pos.y, spriteSize, spriteSize)
                if (selectedArtist === i) { ctx.strokeStyle = "white"; ctx.lineWidth = 4; ctx.strokeRect(pos.x - 2, pos.y - 2, spriteSize + 4, spriteSize + 4) }
                ctx.font = "32px 'PokemonXY'"
                ctx.fillStyle = "white"

                if (artist.hp > 0) {
                    ctx.fillText("LVL " + artist.level, pos.lvlX, pos.lvlY)
                } else if (fntImg.complete) {
                    const scale = 4
                    const width = fntImg.width * scale
                    const height = fntImg.height * scale
                    ctx.drawImage(fntImg, pos.lvlX - width / 2 + 37, pos.lvlY - height, width, height)
                }

                ctx.fillText(formatName(artist.name.toUpperCase()), pos.nameX, pos.nameY)
                ctx.fillText(`${artist.hp} / ${artist.maxHp}`, pos.hpX, pos.hpY)
                const coords = healthbarCoords[i]
                if (coords) drawHealthBar(ctx, healthbarImg, redImg, orangeImg, greenImg, coords.x * 4, coords.y * 4, artist.hp, artist.maxHp)
                if (artist.sex && pos.sexX && pos.sexY) ctx.drawImage(sexImages[artist.sex], pos.sexX, pos.sexY, 32, 32)
            })
        }

        function buildDropdown() {
            const grid = document.getElementById('grid')!
            grid.innerHTML = ''
            const rows = Math.floor(dropdownSpriteSheet.height / spriteSize)
            const cols = Math.floor(dropdownSpriteSheet.width / spriteSize)
            const scale = 0.75
            const displaySize = Math.max(1, Math.round(spriteSize * scale))
            grid.style.display = 'grid'
            grid.style.gridTemplateColumns = `repeat(${cols},${displaySize}px)`
            grid.style.width = 'auto'

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const spriteCanvas = document.createElement('canvas')
                    spriteCanvas.width = displaySize
                    spriteCanvas.height = displaySize
                    spriteCanvas.style.cursor = 'pointer'
                    spriteCanvas.style.imageRendering = 'pixelated'
                    const sctx = spriteCanvas.getContext('2d')!
                    sctx.imageSmoothingEnabled = false
                    sctx.drawImage(dropdownSpriteSheet, c * spriteSize, r * spriteSize, spriteSize, spriteSize, 0, 0, displaySize, displaySize)
                    spriteCanvas.addEventListener('click', ev => {
                        ev.stopPropagation()
                        if (selectedArtist !== null) { artists[selectedArtist].sprite = { row: r, col: c }; selectedArtist = null; drawMenu(); closeDropdown() }
                    })
                    grid.appendChild(spriteCanvas)
                }
            }
        }

        function openDropdown() { document.getElementById('dropdown')!.style.display = 'block' }
        function closeDropdown() { document.getElementById('dropdown')!.style.display = 'none'; selectedArtist = null; drawMenu() }

        canvas.addEventListener('click', e => {
            const rect = canvas.getBoundingClientRect()
            const scaleX = canvas.width / rect.width
            const scaleY = canvas.height / rect.height
            const mx = (e.clientX - rect.left) * scaleX
            const my = (e.clientY - rect.top) * scaleY
            let hoveredSex = false
            artists.forEach((artist, i) => {
                const pos = positions[i]; if (!pos) return
                if (mx >= pos.x && mx <= pos.x + spriteSize && my >= pos.y && my <= pos.y + spriteSize) { selectedArtist = i; openDropdown(); drawMenu() }
                if (mx >= pos.sexX && mx <= pos.sexX + 32 && my >= pos.sexY && my <= pos.sexY + 32) { const idx = sexKeys.indexOf(artist.sex); artist.sex = sexKeys[(idx + 1) % sexKeys.length]; drawMenu() }
                if (mx >= pos.sexX && mx <= pos.sexX + 32 && my >= pos.sexY && my <= pos.sexY + 32) hoveredSex = true
            })
            canvas.style.cursor = hoveredSex ? 'pointer' : 'default'
        })

        document.addEventListener('click', e => {
            const dropdown = document.getElementById('dropdown')!
            const target = e.target as Element | null
            if (!target) return
            if (!dropdown.contains(target) && !(target.closest && target.closest('#menu')))
                closeDropdown()
        })

        document.getElementById('closeBtn')!.addEventListener('pointerdown', ev => { ev.stopPropagation(); closeDropdown() })

        if (username.toLowerCase() === "ohhhio" && artists[0]) { const nessImg = new Image(); nessImg.src = "ness.png"; artists[0].sprite = { customImage: nessImg } }

        Promise.all([loadImage(menuImg), loadImage(spriteSheet), loadImage(dropdownSpriteSheet), loadImage(sexImages.macho), loadImage(sexImages.femea), loadImage(sexImages.trans), loadImage(healthbarImg), loadImage(redImg), loadImage(orangeImg), loadImage(greenImg)]).then(() => { assignRandomSprites(); drawMenu(); buildDropdown() })
    }, [artists, username])

    return (
        <div className="relative max-h-screen overflow-visible">
            <div className="flex justify-center gap-2 mb-4 mt-4">
                <select
                    value={period}
                    onChange={e => setPeriod(e.target.value as any)}
                    className="px-4 py-2 text-base rounded-md cursor-pointer bg-[#404040] text-white border border-white"
                >

                    {periods.map(p => <option key={p} value={p}>{periodLabels[p]}</option>)}
                </select>

                {period !== 'overall' && (
                    <select
                        value={maxHpPeriod}
                        onChange={e => setMaxHpPeriod(e.target.value as any)}
                        className="px-4 py-2 text-base rounded-md cursor-pointer bg-[#404040] text-white border border-white"
                    >

                        {periods.slice(periods.indexOf(period) + 1).map(p => <option key={p} value={p}>{periodLabels[p]}</option>)}
                    </select>
                )}

                {period === 'overall' && (
                    <select
                        value={hpPeriod}
                        onChange={e => setHpPeriod(e.target.value as any)}
                        className="px-4 py-2 text-base rounded-md cursor-pointer bg-[#404040] text-white border border-white"
                    >

                        {periods.slice(0, periods.length - 1).map(p => <option key={p} value={p}>{periodLabels[p]}</option>)}
                    </select>
                )}
            </div>
            <canvas
                id="menu"
                width={960}
                height={720}
                className="w-full h-auto block max-w-full"
                style={{ imageRendering: 'pixelated' }}
            />

            <div id="dropdown" className="hidden absolute top-0 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-4xl max-h-[80vh] bg-black/80 border-2 border-black rounded-lg overflow-y-auto overscroll-contain touch-pan-y p-2 scrollbar-none">
                <div id="grid" className="grid gap-2 justify-center scale-40 sm:scale-100 origin-top" />
                <button id="closeBtn" className="mt-3 block mx-auto px-4 py-1 bg-black text-white rounded-md hover:bg-gray-800 cursor-pointer">close</button>
            </div>
            <div className="text-center my-4">
                <h3 className="font-[PokemonXY]">tip: you can change pokemon sprite and gender!</h3>
            </div>

        </div>
    )
}
