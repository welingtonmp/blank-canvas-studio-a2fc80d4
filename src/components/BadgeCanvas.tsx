import { useEffect, useRef, useState } from "react";
import apLogo from "@/assets/ap-logo.png";

interface BadgeCanvasProps {
  name: string;
  phone: string;
  photoUrl: string;
  participantNumber: number;
  isRevendedora: boolean;
  onReady?: (dataUrl: string) => void;
}

// High resolution for quality
const W = 1200;
const H = 1640;

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxW: number, startSize: number, fontStyle: string) {
  let s = startSize;
  ctx.font = `${s}px ${fontStyle}`;
  while (ctx.measureText(text).width > maxW && s > 20) {
    s -= 2;
    ctx.font = `${s}px ${fontStyle}`;
  }
  return s;
}

// Draw gold gradient fill
function createGoldGradient(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  g.addColorStop(0, "#8B6914");
  g.addColorStop(0.15, "#C9A84C");
  g.addColorStop(0.3, "#F5E6A3");
  g.addColorStop(0.5, "#DFBE5C");
  g.addColorStop(0.7, "#F5E6A3");
  g.addColorStop(0.85, "#C9A84C");
  g.addColorStop(1, "#8B6914");
  return g;
}

function drawSparkles(ctx: CanvasRenderingContext2D, count: number, x: number, y: number, w: number, h: number, color = "rgba(255,255,240,") {
  for (let i = 0; i < count; i++) {
    const sx = x + Math.random() * w;
    const sy = y + Math.random() * h;
    const size = Math.random() * 4 + 1;
    const alpha = Math.random() * 0.9 + 0.1;

    // Glow
    const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 3);
    glow.addColorStop(0, `${color}${alpha})`);
    glow.addColorStop(1, `${color}0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sx, sy, size * 3, 0, Math.PI * 2);
    ctx.fill();

    // Core dot
    ctx.fillStyle = `${color}${Math.min(1, alpha + 0.3)})`;
    ctx.beginPath();
    ctx.arc(sx, sy, size, 0, Math.PI * 2);
    ctx.fill();

    // Star cross for bigger sparkles
    if (size > 3) {
      ctx.strokeStyle = `${color}${alpha * 0.7})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx - size * 4, sy);
      ctx.lineTo(sx + size * 4, sy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx, sy - size * 4);
      ctx.lineTo(sx, sy + size * 4);
      ctx.stroke();
    }
  }
}

export default function BadgeCanvas({ name, phone, photoUrl, participantNumber, isRevendedora, onReady }: BadgeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const draw = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      canvas.width = W;
      canvas.height = H;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // ========== ROUNDED CARD SHAPE ==========
      const radius = 48;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(W - radius, 0);
      ctx.quadraticCurveTo(W, 0, W, radius);
      ctx.lineTo(W, H - radius);
      ctx.quadraticCurveTo(W, H, W - radius, H);
      ctx.lineTo(radius, H);
      ctx.quadraticCurveTo(0, H, 0, H - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.save();
      ctx.clip();

      // ========== PINK TOP SECTION ==========
      const pinkH = 310;
      const pinkGrad = ctx.createLinearGradient(0, 0, W, pinkH);
      pinkGrad.addColorStop(0, "#D63384");
      pinkGrad.addColorStop(0.3, "#EC407A");
      pinkGrad.addColorStop(0.5, "#F48FB1");
      pinkGrad.addColorStop(0.7, "#EC407A");
      pinkGrad.addColorStop(1, "#D63384");
      ctx.fillStyle = pinkGrad;
      ctx.fillRect(0, 0, W, pinkH + 60);
      drawSparkles(ctx, 80, 0, 0, W, pinkH, "rgba(255,255,255,");

      // ========== BLACK CENTER AREA ==========
      ctx.fillStyle = "#080808";
      ctx.fillRect(0, pinkH - 20, W, H - pinkH - 200);

      // Black texture - subtle radial lighter center
      const blackRadial = ctx.createRadialGradient(W / 2, 700, 50, W / 2, 700, 600);
      blackRadial.addColorStop(0, "rgba(30,20,30,0.6)");
      blackRadial.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = blackRadial;
      ctx.fillRect(0, pinkH - 20, W, H - pinkH - 200);

      // Lots of sparkles on black area
      drawSparkles(ctx, 200, 0, pinkH, W, H - pinkH - 250, "rgba(255,255,220,");
      drawSparkles(ctx, 60, 0, pinkH, W, H - pinkH - 250, "rgba(255,200,100,");

      // ========== GOLD WAVE TOP (pink → black) ==========
      const waveY = pinkH;

      // Gold band - elegant S-curve
      ctx.save();
      for (let pass = 0; pass < 3; pass++) {
        const offset = pass * 4 - 4;
        const goldG = createGoldGradient(ctx, 0, waveY - 30 + offset, 0, waveY + 30 + offset);
        ctx.fillStyle = goldG;
        ctx.beginPath();
        ctx.moveTo(-10, waveY + 30 + offset);
        ctx.bezierCurveTo(W * 0.15, waveY - 40 + offset, W * 0.35, waveY + 50 + offset, W * 0.5, waveY + offset);
        ctx.bezierCurveTo(W * 0.65, waveY - 50 + offset, W * 0.85, waveY + 40 + offset, W + 10, waveY - 20 + offset);
        ctx.lineTo(W + 10, waveY + 35 + offset);
        ctx.bezierCurveTo(W * 0.85, waveY + 45 + offset, W * 0.65, waveY - 45 + offset, W * 0.5, waveY + 5 + offset);
        ctx.bezierCurveTo(W * 0.35, waveY + 55 + offset, W * 0.15, waveY - 35 + offset, -10, waveY + 35 + offset);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Fill pink above wave properly
      ctx.fillStyle = pinkGrad;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(W + 10, 0);
      ctx.lineTo(W + 10, waveY - 50);
      ctx.bezierCurveTo(W * 0.85, waveY + 30, W * 0.65, waveY - 60, W * 0.5, waveY - 10);
      ctx.bezierCurveTo(W * 0.35, waveY + 40, W * 0.15, waveY - 50, -10, waveY + 20);
      ctx.closePath();
      ctx.fill();
      drawSparkles(ctx, 40, 0, 0, W, waveY, "rgba(255,255,255,");

      // ========== LANYARD HOLE ==========
      const holeW = 120, holeH = 24;
      const holeCx = W / 2, holeCy = 40;
      // White pill shape
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.ellipse(holeCx, holeCy, holeW / 2, holeH / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Inner dark hole
      ctx.fillStyle = "rgba(80,40,60,0.5)";
      ctx.beginPath();
      ctx.ellipse(holeCx, holeCy, holeW / 2 - 8, holeH / 2 - 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // ========== LOGO ==========
      try {
        const logo = await loadImg(apLogo);
        const logoSize = 180;
        ctx.drawImage(logo, (W - logoSize) / 2, 70, logoSize, logoSize);
      } catch {}

      // "COSMÉTICOS" under logo (since logo already has it, skip if logo includes text)

      // ========== PHOTO WITH GOLD RING ==========
      const photoR = 220;
      const photoCx = W / 2;
      const photoCy = 620;

      // Outer glow
      const outerGlow = ctx.createRadialGradient(photoCx, photoCy, photoR, photoCx, photoCy, photoR + 60);
      outerGlow.addColorStop(0, "rgba(201,168,76,0.5)");
      outerGlow.addColorStop(0.5, "rgba(201,168,76,0.15)");
      outerGlow.addColorStop(1, "transparent");
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(photoCx, photoCy, photoR + 60, 0, Math.PI * 2);
      ctx.fill();

      // Thick gold ring
      const ringW = 14;
      const ringGrad = createGoldGradient(ctx, photoCx - photoR, photoCy - photoR, photoCx + photoR, photoCy + photoR);
      ctx.strokeStyle = ringGrad;
      ctx.lineWidth = ringW;
      ctx.beginPath();
      ctx.arc(photoCx, photoCy, photoR + ringW / 2 + 2, 0, Math.PI * 2);
      ctx.stroke();

      // Inner thin gold line
      ctx.strokeStyle = "#C9A84C";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(photoCx, photoCy, photoR - 4, 0, Math.PI * 2);
      ctx.stroke();

      // Photo clipped
      try {
        const photo = await loadImg(photoUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(photoCx, photoCy, photoR - 6, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        const aspect = photo.width / photo.height;
        let dw = photoR * 2, dh = photoR * 2;
        if (aspect > 1) dw = photoR * 2 * aspect; else dh = (photoR * 2) / aspect;
        ctx.drawImage(photo, photoCx - dw / 2, photoCy - dh / 2, dw, dh);
        ctx.restore();
      } catch {
        ctx.save();
        ctx.fillStyle = "#E91E63";
        ctx.beginPath();
        ctx.arc(photoCx, photoCy, photoR - 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ========== NAME (elegant cursive, gold) ==========
      const nameY = photoCy + photoR + 100;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Shadow
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;

      ctx.fillStyle = "#F0D78C";
      const nameSize = fitText(ctx, name, W - 160, 88, "italic 'Georgia', 'Times New Roman', serif");
      ctx.font = `italic ${nameSize}px 'Georgia', 'Times New Roman', serif`;
      ctx.fillText(name, W / 2, nameY);

      // Gold outline effect
      ctx.strokeStyle = "rgba(139,105,20,0.4)";
      ctx.lineWidth = 1.5;
      ctx.strokeText(name, W / 2, nameY);
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // ========== PHONE ==========
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "500 36px 'Montserrat', sans-serif";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 6;
      ctx.fillText(phone, W / 2, nameY + 65);
      ctx.shadowBlur = 0;

      // ========== REVENDEDORA TAG ==========
      if (isRevendedora) {
        const tagY = nameY + 120;
        const tagText = "★  REVENDEDORA AP COSMÉTICOS  ★";
        ctx.font = "700 24px 'Montserrat', sans-serif";
        const tagW = ctx.measureText(tagText).width + 60;
        const tagH = 44;

        // Gold pill background
        const pillX = (W - tagW) / 2;
        const pillR = tagH / 2;
        ctx.beginPath();
        ctx.moveTo(pillX + pillR, tagY - tagH / 2);
        ctx.lineTo(pillX + tagW - pillR, tagY - tagH / 2);
        ctx.quadraticCurveTo(pillX + tagW, tagY - tagH / 2, pillX + tagW, tagY);
        ctx.quadraticCurveTo(pillX + tagW, tagY + tagH / 2, pillX + tagW - pillR, tagY + tagH / 2);
        ctx.lineTo(pillX + pillR, tagY + tagH / 2);
        ctx.quadraticCurveTo(pillX, tagY + tagH / 2, pillX, tagY);
        ctx.quadraticCurveTo(pillX, tagY - tagH / 2, pillX + pillR, tagY - tagH / 2);
        ctx.closePath();
        ctx.fillStyle = createGoldGradient(ctx, pillX, tagY - tagH / 2, pillX + tagW, tagY + tagH / 2);
        ctx.fill();

        ctx.fillStyle = "#1a0a00";
        ctx.font = "700 22px 'Montserrat', sans-serif";
        ctx.fillText(tagText, W / 2, tagY + 2);
      }

      // ========== BOTTOM GOLD WAVE ==========
      const bottomWaveY = H - 280;

      // Gold band
      for (let pass = 0; pass < 3; pass++) {
        const offset = pass * 4 - 4;
        const gG = createGoldGradient(ctx, 0, bottomWaveY - 20 + offset, 0, bottomWaveY + 20 + offset);
        ctx.fillStyle = gG;
        ctx.beginPath();
        ctx.moveTo(-10, bottomWaveY + offset);
        ctx.bezierCurveTo(W * 0.2, bottomWaveY - 40 + offset, W * 0.4, bottomWaveY + 30 + offset, W * 0.55, bottomWaveY - 10 + offset);
        ctx.bezierCurveTo(W * 0.7, bottomWaveY - 50 + offset, W * 0.9, bottomWaveY + 20 + offset, W + 10, bottomWaveY - 30 + offset);
        ctx.lineTo(W + 10, bottomWaveY + 10 + offset);
        ctx.bezierCurveTo(W * 0.9, bottomWaveY + 30 + offset, W * 0.7, bottomWaveY - 40 + offset, W * 0.55, bottomWaveY + offset);
        ctx.bezierCurveTo(W * 0.4, bottomWaveY + 40 + offset, W * 0.2, bottomWaveY - 30 + offset, -10, bottomWaveY + 10 + offset);
        ctx.closePath();
        ctx.fill();
      }

      // ========== PINK BOTTOM SECTION ==========
      const pinkBottomY = bottomWaveY + 5;
      const pinkBotGrad = ctx.createLinearGradient(0, pinkBottomY, W, H);
      pinkBotGrad.addColorStop(0, "#C2185B");
      pinkBotGrad.addColorStop(0.3, "#E91E63");
      pinkBotGrad.addColorStop(0.5, "#F06292");
      pinkBotGrad.addColorStop(0.7, "#E91E63");
      pinkBotGrad.addColorStop(1, "#C2185B");
      ctx.fillStyle = pinkBotGrad;
      ctx.fillRect(0, pinkBottomY, W, H - pinkBottomY);

      // Pink ribbon waves
      for (let r = 0; r < 4; r++) {
        const ry = pinkBottomY + r * 15 + 20;
        const ribbonAlpha = 0.15 + r * 0.08;
        ctx.fillStyle = `rgba(255, 150, 200, ${ribbonAlpha})`;
        ctx.beginPath();
        ctx.moveTo(-10, ry + 30);
        ctx.bezierCurveTo(W * 0.2, ry - 20, W * 0.5, ry + 40, W * 0.7, ry);
        ctx.bezierCurveTo(W * 0.85, ry - 30, W * 0.95, ry + 20, W + 10, ry + 10);
        ctx.lineTo(W + 10, H + 10);
        ctx.lineTo(-10, H + 10);
        ctx.closePath();
        ctx.fill();
      }

      drawSparkles(ctx, 80, 0, pinkBottomY, W, H - pinkBottomY, "rgba(255,255,255,");
      drawSparkles(ctx, 30, 0, pinkBottomY, W, H - pinkBottomY, "rgba(255,220,180,");

      // ========== "Revendedoras de Sucesso AP" ==========
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "italic 700 56px 'Georgia', 'Times New Roman', serif";
      ctx.fillText("Revendedoras de Sucesso AP", W / 2, H - 160);

      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Participant number
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "500 22px 'Montserrat', sans-serif";
      ctx.fillText(`Nº ${String(participantNumber).padStart(3, "0")}`, W / 2, H - 80);

      // ========== CARD BORDER (subtle) ==========
      ctx.restore();
      ctx.strokeStyle = "rgba(201,168,76,0.3)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(W - radius, 0);
      ctx.quadraticCurveTo(W, 0, W, radius);
      ctx.lineTo(W, H - radius);
      ctx.quadraticCurveTo(W, H, W - radius, H);
      ctx.lineTo(radius, H);
      ctx.quadraticCurveTo(0, H, 0, H - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.stroke();

      setLoading(false);
      const dataUrl = canvas.toDataURL("image/png");
      onReady?.(dataUrl);
    };

    draw();
  }, [name, phone, photoUrl, participantNumber, isRevendedora, onReady]);

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Gerando seu crachá…</p>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full max-w-[320px] mx-auto rounded-xl shadow-2xl"
        style={{ aspectRatio: `${W}/${H}` }}
      />
    </div>
  );
}
