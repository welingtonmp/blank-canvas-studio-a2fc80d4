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

const W = 600;
const H = 820;

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxW: number, startSize: number, font: string) {
  let s = startSize;
  ctx.font = `${s}px ${font}`;
  while (ctx.measureText(text).width > maxW && s > 14) {
    s -= 1;
    ctx.font = `${s}px ${font}`;
  }
  return s;
}

function drawSparkles(ctx: CanvasRenderingContext2D, count: number, x: number, y: number, w: number, h: number) {
  for (let i = 0; i < count; i++) {
    const sx = x + Math.random() * w;
    const sy = y + Math.random() * h;
    const size = Math.random() * 2.5 + 0.5;
    const alpha = Math.random() * 0.8 + 0.2;
    ctx.fillStyle = `rgba(255, 255, 220, ${alpha})`;
    ctx.beginPath();
    ctx.arc(sx, sy, size, 0, Math.PI * 2);
    ctx.fill();
    // Cross sparkle for bigger ones
    if (size > 1.8) {
      ctx.strokeStyle = `rgba(255, 255, 220, ${alpha * 0.6})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(sx - size * 2, sy);
      ctx.lineTo(sx + size * 2, sy);
      ctx.moveTo(sx, sy - size * 2);
      ctx.lineTo(sx, sy + size * 2);
      ctx.stroke();
    }
  }
}

function drawGoldWave(ctx: CanvasRenderingContext2D, y: number, flip = false) {
  const goldGrad = ctx.createLinearGradient(0, y - 15, 0, y + 15);
  goldGrad.addColorStop(0, "#F0D78C");
  goldGrad.addColorStop(0.3, "#C9A84C");
  goldGrad.addColorStop(0.5, "#F5E6A3");
  goldGrad.addColorStop(0.7, "#C9A84C");
  goldGrad.addColorStop(1, "#8B6914");

  ctx.fillStyle = goldGrad;
  ctx.beginPath();
  if (!flip) {
    ctx.moveTo(0, y + 20);
    ctx.quadraticCurveTo(W * 0.25, y - 25, W * 0.5, y);
    ctx.quadraticCurveTo(W * 0.75, y + 25, W, y - 10);
    ctx.lineTo(W, y + 20);
    ctx.lineTo(0, y + 20);
  } else {
    ctx.moveTo(0, y - 10);
    ctx.quadraticCurveTo(W * 0.3, y + 20, W * 0.5, y + 5);
    ctx.quadraticCurveTo(W * 0.7, y - 15, W, y + 10);
    ctx.lineTo(W, y - 10);
    ctx.lineTo(0, y - 10);
  }
  ctx.closePath();
  ctx.fill();
}

function drawPinkRibbon(ctx: CanvasRenderingContext2D, y: number, h: number) {
  // Multiple pink ribbon waves
  for (let i = 0; i < 3; i++) {
    const alpha = 0.3 + i * 0.15;
    const offset = i * 8;
    ctx.fillStyle = `rgba(233, 30, 99, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(0, y + offset + 10);
    ctx.quadraticCurveTo(W * 0.2, y + offset - 15, W * 0.4, y + offset + 5);
    ctx.quadraticCurveTo(W * 0.6, y + offset + 25, W * 0.8, y + offset);
    ctx.quadraticCurveTo(W * 0.9, y + offset - 10, W, y + offset + 10);
    ctx.lineTo(W, y + h);
    ctx.lineTo(0, y + h);
    ctx.closePath();
    ctx.fill();
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

      // === ROUNDED BADGE SHAPE (clip) ===
      const r = 24;
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(W - r, 0);
      ctx.quadraticCurveTo(W, 0, W, r);
      ctx.lineTo(W, H - r);
      ctx.quadraticCurveTo(W, H, W - r, H);
      ctx.lineTo(r, H);
      ctx.quadraticCurveTo(0, H, 0, H - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
      ctx.clip();

      // === PINK TOP SECTION ===
      const pinkGrad = ctx.createLinearGradient(0, 0, W, 0);
      pinkGrad.addColorStop(0, "#E8619A");
      pinkGrad.addColorStop(0.5, "#F48FB1");
      pinkGrad.addColorStop(1, "#E8619A");
      ctx.fillStyle = pinkGrad;
      ctx.fillRect(0, 0, W, 160);
      drawSparkles(ctx, 40, 0, 0, W, 160);

      // === BLACK SPARKLY CENTER ===
      const blackGrad = ctx.createRadialGradient(W / 2, 400, 50, W / 2, 400, 450);
      blackGrad.addColorStop(0, "#1a1a2e");
      blackGrad.addColorStop(1, "#0a0a0a");
      ctx.fillStyle = blackGrad;
      ctx.fillRect(0, 140, W, 520);
      drawSparkles(ctx, 120, 0, 140, W, 520);

      // === GOLD WAVE TOP (pink → black transition) ===
      drawGoldWave(ctx, 145);

      // === LANYARD HOLE ===
      const holeW = 60, holeH = 12, holeX = (W - holeW) / 2, holeY = 18;
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath();
      ctx.ellipse(holeX + holeW / 2, holeY + holeH / 2, holeW / 2, holeH / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.beginPath();
      ctx.ellipse(holeX + holeW / 2, holeY + holeH / 2, holeW / 2 - 4, holeH / 2 - 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // === LOGO ===
      try {
        const logo = await loadImg(apLogo);
        const logoH = 90;
        const logoW = 90;
        ctx.drawImage(logo, (W - logoW) / 2, 42, logoW, logoH);
      } catch {}

      // "COSMÉTICOS" text under logo
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "600 14px Montserrat, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("COSMÉTICOS", W / 2, 148);

      // === PHOTO with gold ring ===
      const photoR = 115;
      const photoCx = W / 2;
      const photoCy = 320;

      // Outer gold glow
      const glowGrad = ctx.createRadialGradient(photoCx, photoCy, photoR - 10, photoCx, photoCy, photoR + 25);
      glowGrad.addColorStop(0, "rgba(201,168,76,0.4)");
      glowGrad.addColorStop(0.7, "rgba(201,168,76,0.15)");
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(photoCx, photoCy, photoR + 25, 0, Math.PI * 2);
      ctx.fill();

      // Thick gold ring
      const ringGrad = ctx.createLinearGradient(photoCx - photoR, photoCy - photoR, photoCx + photoR, photoCy + photoR);
      ringGrad.addColorStop(0, "#F5E6A3");
      ringGrad.addColorStop(0.25, "#C9A84C");
      ringGrad.addColorStop(0.5, "#F0D78C");
      ringGrad.addColorStop(0.75, "#8B6914");
      ringGrad.addColorStop(1, "#F5E6A3");
      ctx.strokeStyle = ringGrad;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(photoCx, photoCy, photoR + 6, 0, Math.PI * 2);
      ctx.stroke();

      // Inner thin gold ring
      ctx.strokeStyle = "#C9A84C";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(photoCx, photoCy, photoR - 2, 0, Math.PI * 2);
      ctx.stroke();

      // Photo
      try {
        const photo = await loadImg(photoUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(photoCx, photoCy, photoR - 4, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        const aspect = photo.width / photo.height;
        let dw = photoR * 2, dh = photoR * 2;
        if (aspect > 1) dw = photoR * 2 * aspect; else dh = (photoR * 2) / aspect;
        ctx.drawImage(photo, photoCx - dw / 2, photoCy - dh / 2, dw, dh);
        ctx.restore();
      } catch {
        ctx.fillStyle = "#E91E63";
        ctx.beginPath();
        ctx.arc(photoCx, photoCy, photoR - 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // === NAME (cursive/script style) ===
      const nameY = photoCy + photoR + 55;
      ctx.fillStyle = "#F0D78C";
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 6;
      const nameDisplay = name;
      const nameSize = fitText(ctx, nameDisplay, W - 80, 44, "italic 700 Montserrat, Georgia, serif");
      ctx.font = `italic 700 ${nameSize}px Georgia, 'Times New Roman', serif`;
      ctx.textAlign = "center";
      ctx.fillText(nameDisplay, W / 2, nameY);
      ctx.shadowBlur = 0;

      // === PHONE ===
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "500 18px Montserrat, sans-serif";
      ctx.fillText(phone, W / 2, nameY + 32);

      // === REVENDEDORA TAG ===
      if (isRevendedora) {
        ctx.fillStyle = "#C9A84C";
        ctx.font = "700 12px Montserrat, sans-serif";
        ctx.fillText("★ REVENDEDORA AP COSMÉTICOS ★", W / 2, nameY + 58);
      }

      // === BOTTOM SECTION ===
      const bottomY = H - 130;

      // Gold wave bottom
      drawGoldWave(ctx, bottomY, true);

      // Pink ribbon area
      ctx.fillStyle = "#E91E63";
      ctx.fillRect(0, bottomY + 10, W, H - bottomY - 10);
      drawPinkRibbon(ctx, bottomY + 5, H - bottomY);
      drawSparkles(ctx, 50, 0, bottomY + 10, W, H - bottomY - 10);

      // "Revendedoras de Sucesso AP" text
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 4;
      ctx.font = "italic 700 28px Georgia, 'Times New Roman', serif";
      ctx.textAlign = "center";
      ctx.fillText("Revendedoras de Sucesso AP", W / 2, H - 55);
      ctx.shadowBlur = 0;

      // Participant number small
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "500 11px Montserrat, sans-serif";
      ctx.fillText(`Nº ${String(participantNumber).padStart(3, "0")}`, W / 2, H - 25);

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
          <p className="text-muted-foreground animate-pulse">Gerando seu crachá…</p>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full max-w-[300px] mx-auto rounded-xl shadow-2xl"
        style={{ aspectRatio: `${W}/${H}` }}
      />
    </div>
  );
}
