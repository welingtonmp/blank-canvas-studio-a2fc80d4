import { useEffect, useRef, useState } from "react";
import apLogo from "@/assets/ap-logo.png";
import badgeBg from "@/assets/badge-bg.jpg";

interface BadgeCanvasProps {
  name: string;
  phone: string;
  photoUrl: string;
  participantNumber: number;
  onReady?: (dataUrl: string) => void;
}

const BADGE_W = 600;
const BADGE_H = 900;

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number, fontWeight: string) {
  let size = fontSize;
  ctx.font = `${fontWeight} ${size}px Montserrat, sans-serif`;
  while (ctx.measureText(text).width > maxWidth && size > 16) {
    size -= 1;
    ctx.font = `${fontWeight} ${size}px Montserrat, sans-serif`;
  }
  return size;
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function BadgeCanvas({ name, phone, photoUrl, participantNumber, onReady }: BadgeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const draw = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      canvas.width = BADGE_W;
      canvas.height = BADGE_H;

      // Background
      try {
        const bg = await loadImg(badgeBg);
        ctx.drawImage(bg, 0, 0, BADGE_W, BADGE_H);
      } catch {
        // fallback gradient
        const grad = ctx.createLinearGradient(0, 0, 0, BADGE_H);
        grad.addColorStop(0, "#E91E63");
        grad.addColorStop(0.6, "#880E4F");
        grad.addColorStop(1, "#1a1a1a");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, BADGE_W, BADGE_H);
      }

      // Dark overlay for readability
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, BADGE_W, BADGE_H);

      // Gold top border
      ctx.fillStyle = "#C9A84C";
      ctx.fillRect(0, 0, BADGE_W, 6);

      // Logo
      try {
        const logo = await loadImg(apLogo);
        const logoH = 80;
        const logoW = 80;
        ctx.drawImage(logo, (BADGE_W - logoW) / 2, 30, logoW, logoH);
      } catch {}

      // "AP COSMÉTICOS" text
      ctx.fillStyle = "#C9A84C";
      ctx.font = "600 18px Montserrat, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("AP COSMÉTICOS", BADGE_W / 2, 130);

      // Participant photo - circular
      const photoSize = 200;
      const photoX = (BADGE_W - photoSize) / 2;
      const photoY = 160;

      try {
        const photo = await loadImg(photoUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        // Cover the circle
        const aspect = photo.width / photo.height;
        let sw = photoSize, sh = photoSize;
        if (aspect > 1) { sw = photoSize * aspect; } else { sh = photoSize / aspect; }
        ctx.drawImage(photo, photoX + (photoSize - sw) / 2, photoY + (photoSize - sh) / 2, sw, sh);
        ctx.restore();
      } catch {
        ctx.fillStyle = "#E91E63";
        ctx.beginPath();
        ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Gold ring around photo
      ctx.strokeStyle = "#C9A84C";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + 4, 0, Math.PI * 2);
      ctx.stroke();

      // Participant number
      ctx.fillStyle = "#C9A84C";
      ctx.font = "600 14px Montserrat, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`Nº ${String(participantNumber).padStart(3, "0")}`, BADGE_W / 2, photoY + photoSize + 40);

      // Name
      ctx.fillStyle = "#FFFFFF";
      const nameSize = wrapText(ctx, name.toUpperCase(), BADGE_W - 80, 36, "700");
      ctx.font = `700 ${nameSize}px Montserrat, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(name.toUpperCase(), BADGE_W / 2, photoY + photoSize + 80);

      // Divider
      ctx.strokeStyle = "#C9A84C";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(180, photoY + photoSize + 100);
      ctx.lineTo(BADGE_W - 180, photoY + photoSize + 100);
      ctx.stroke();

      // Phone
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "500 18px Montserrat, sans-serif";
      ctx.fillText(phone, BADGE_W / 2, photoY + photoSize + 130);

      // Event name
      ctx.fillStyle = "#E91E63";
      ctx.font = "700 20px Montserrat, sans-serif";
      ctx.fillText("REVENDEDORAS DE SUCESSO", BADGE_W / 2, BADGE_H - 120);

      // Sparkle line
      ctx.fillStyle = "#C9A84C";
      ctx.font = "600 14px Montserrat, sans-serif";
      ctx.fillText("✨ Evento Exclusivo ✨", BADGE_W / 2, BADGE_H - 90);

      // Gold bottom border
      ctx.fillStyle = "#C9A84C";
      ctx.fillRect(0, BADGE_H - 6, BADGE_W, 6);

      // Bottom text
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "400 12px Montserrat, sans-serif";
      ctx.fillText("Compartilhe nos stories e marque a AP Cosméticos", BADGE_W / 2, BADGE_H - 30);

      setLoading(false);

      const dataUrl = canvas.toDataURL("image/png");
      onReady?.(dataUrl);
    };

    draw();
  }, [name, phone, photoUrl, participantNumber, onReady]);

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
          <p className="text-muted-foreground animate-pulse">Gerando seu crachá…</p>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full max-w-[300px] mx-auto rounded-lg shadow-2xl"
        style={{ aspectRatio: "2/3" }}
      />
    </div>
  );
}
