import { useEffect, useRef, useState } from "react";
import apLogo from "@/assets/ap-logo.png";
import badgeBg from "@/assets/badge-bg.jpg";

interface BadgeCanvasProps {
  name: string;
  phone: string;
  photoUrl: string;
  participantNumber: number;
  isRevendedora: boolean;
  onReady?: (dataUrl: string) => void;
}

const W = 600;
const H = 960;

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxW: number, startSize: number, weight = "700", family = "Montserrat, sans-serif") {
  let s = startSize;
  ctx.font = `${weight} ${s}px ${family}`;
  while (ctx.measureText(text).width > maxW && s > 14) {
    s -= 1;
    ctx.font = `${weight} ${s}px ${family}`;
  }
  return s;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
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

      // === BACKGROUND ===
      try {
        const bg = await loadImg(badgeBg);
        ctx.drawImage(bg, 0, 0, W, H);
      } catch {
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, "#0a0a0a");
        grad.addColorStop(0.4, "#1a0a14");
        grad.addColorStop(1, "#880E4F");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }

      // Subtle dark overlay
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(0, 0, W, H);

      // === TOP GOLD ACCENT LINE ===
      const goldGrad = ctx.createLinearGradient(0, 0, W, 0);
      goldGrad.addColorStop(0, "transparent");
      goldGrad.addColorStop(0.2, "#C9A84C");
      goldGrad.addColorStop(0.5, "#F0D78C");
      goldGrad.addColorStop(0.8, "#C9A84C");
      goldGrad.addColorStop(1, "transparent");
      ctx.fillStyle = goldGrad;
      ctx.fillRect(0, 0, W, 4);

      // === LOGO ===
      try {
        const logo = await loadImg(apLogo);
        ctx.drawImage(logo, (W - 70) / 2, 28, 70, 70);
      } catch {}

      // "AP COSMÉTICOS" brand
      ctx.fillStyle = "#C9A84C";
      ctx.font = "700 16px Montserrat, sans-serif";
      ctx.textAlign = "center";
      ctx.letterSpacing = "4px";
      ctx.fillText("A P   C O S M É T I C O S", W / 2, 120);

      // Thin gold divider
      ctx.strokeStyle = "#C9A84C55";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(160, 138);
      ctx.lineTo(W - 160, 138);
      ctx.stroke();

      // === PHOTO ===
      const photoSize = 210;
      const photoCx = W / 2;
      const photoCy = 270;

      // Outer glow ring
      const glowGrad = ctx.createRadialGradient(photoCx, photoCy, photoSize / 2 - 5, photoCx, photoCy, photoSize / 2 + 20);
      glowGrad.addColorStop(0, "rgba(201,168,76,0.3)");
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(photoCx, photoCy, photoSize / 2 + 20, 0, Math.PI * 2);
      ctx.fill();

      // Gold border ring
      ctx.strokeStyle = "#C9A84C";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(photoCx, photoCy, photoSize / 2 + 5, 0, Math.PI * 2);
      ctx.stroke();

      // Photo clipped circle
      try {
        const photo = await loadImg(photoUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(photoCx, photoCy, photoSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        const aspect = photo.width / photo.height;
        let dw = photoSize, dh = photoSize;
        if (aspect > 1) dw = photoSize * aspect; else dh = photoSize / aspect;
        ctx.drawImage(photo, photoCx - dw / 2, photoCy - dh / 2, dw, dh);
        ctx.restore();
      } catch {
        ctx.fillStyle = "#E91E63";
        ctx.beginPath();
        ctx.arc(photoCx, photoCy, photoSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // === PARTICIPANT NUMBER BADGE ===
      const numY = photoCy + photoSize / 2 + 20;
      const numText = `Nº ${String(participantNumber).padStart(3, "0")}`;
      const numW = 90;
      const numH = 28;
      roundRect(ctx, (W - numW) / 2, numY - numH / 2, numW, numH, 14);
      ctx.fillStyle = "#C9A84C";
      ctx.fill();
      ctx.fillStyle = "#0a0a0a";
      ctx.font = "700 13px Montserrat, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(numText, W / 2, numY + 5);

      // === NAME ===
      const nameY = numY + 50;
      ctx.fillStyle = "#FFFFFF";
      const nameUpper = name.toUpperCase();
      const nameSize = fitText(ctx, nameUpper, W - 80, 38);
      ctx.font = `700 ${nameSize}px Montserrat, sans-serif`;
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 8;
      ctx.fillText(nameUpper, W / 2, nameY);
      ctx.shadowBlur = 0;

      // === ROLE TAG ===
      const roleY = nameY + 35;
      const roleText = isRevendedora ? "✨ REVENDEDORA AP COSMÉTICOS ✨" : "PARTICIPANTE";
      const roleW = ctx.measureText(roleText).width + 40;
      
      if (isRevendedora) {
        // Pink pill for revendedora
        roundRect(ctx, (W - roleW) / 2, roleY - 16, roleW, 30, 15);
        ctx.fillStyle = "#E91E63";
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "700 13px Montserrat, sans-serif";
        ctx.fillText(roleText, W / 2, roleY + 4);
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "500 13px Montserrat, sans-serif";
        ctx.fillText(roleText, W / 2, roleY + 4);
      }

      // === PHONE ===
      const phoneY = roleY + 45;
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "500 16px Montserrat, sans-serif";
      ctx.fillText("📞 " + phone, W / 2, phoneY);

      // === GOLD DIVIDER ===
      const divY = phoneY + 30;
      const divGrad = ctx.createLinearGradient(100, 0, W - 100, 0);
      divGrad.addColorStop(0, "transparent");
      divGrad.addColorStop(0.3, "#C9A84C");
      divGrad.addColorStop(0.7, "#C9A84C");
      divGrad.addColorStop(1, "transparent");
      ctx.strokeStyle = divGrad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(100, divY);
      ctx.lineTo(W - 100, divY);
      ctx.stroke();

      // === EVENT NAME ===
      const eventY = divY + 40;
      ctx.fillStyle = "#E91E63";
      ctx.font = "800 22px Montserrat, sans-serif";
      ctx.fillText("REVENDEDORAS", W / 2, eventY);
      ctx.fillStyle = "#C9A84C";
      ctx.font = "700 18px Montserrat, sans-serif";
      ctx.fillText("DE SUCESSO", W / 2, eventY + 28);

      // === BOTTOM SECTION ===
      // Share message
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "400 11px Montserrat, sans-serif";
      ctx.fillText("Compartilhe nos stories e marque @apcosmesticos", W / 2, H - 50);

      // Bottom gold line
      const bottomGrad = ctx.createLinearGradient(0, 0, W, 0);
      bottomGrad.addColorStop(0, "transparent");
      bottomGrad.addColorStop(0.2, "#C9A84C");
      bottomGrad.addColorStop(0.5, "#F0D78C");
      bottomGrad.addColorStop(0.8, "#C9A84C");
      bottomGrad.addColorStop(1, "transparent");
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, H - 4, W, 4);

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
