import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import BadgeCanvas from "@/components/BadgeCanvas";
import { saveParticipant, getNextNumber, updateParticipantBadge } from "@/lib/participants";
import { Download, Sparkles, Camera, User, Phone, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isRevendedora, setIsRevendedora] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [badgeData, setBadgeData] = useState<{
    name: string; phone: string; photoUrl: string; number: number; id: string; isRevendedora: boolean;
  } | null>(null);
  const [badgeUrl, setBadgeUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Formato inválido", description: "Envie apenas imagens JPG ou PNG.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Imagem muito grande", description: "O limite é 5MB.", variant: "destructive" });
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !photoPreview) {
      toast({ title: "Preencha todos os campos", description: "Nome, telefone e foto são obrigatórios.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const num = getNextNumber();
    const id = crypto.randomUUID();
    saveParticipant({
      id, name: name.trim(), phone: phone.trim(), photoUrl: photoPreview,
      isRevendedora, createdAt: new Date().toISOString(), number: num,
    });
    setBadgeData({ name: name.trim(), phone: phone.trim(), photoUrl: photoPreview, number: num, id, isRevendedora });
  };

  const handleBadgeReady = useCallback((dataUrl: string) => {
    setBadgeUrl(dataUrl);
    setSubmitting(false);
    if (badgeData) updateParticipantBadge(badgeData.id, dataUrl);
  }, [badgeData]);

  const downloadBadge = () => {
    if (!badgeUrl) return;
    const a = document.createElement("a");
    a.href = badgeUrl;
    a.download = `cracha-${name.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  };

  const reset = () => {
    setName(""); setPhone(""); setIsRevendedora(false);
    setPhotoFile(null); setPhotoPreview(null);
    setBadgeData(null); setBadgeUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50">
      <header className="bg-gradient-to-r from-pink-600 to-pink-700 py-6 px-4 shadow-lg">
        <div className="max-w-lg mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-5 h-5" style={{ color: "#C9A84C" }} />
            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: "white" }}>
              AP Cosméticos
            </h1>
            <Sparkles className="w-5 h-5" style={{ color: "#C9A84C" }} />
          </div>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>Evento Revendedoras de Sucesso</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {!badgeData ? (
          <Card className="animate-fade-in border-pink-200 shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-foreground">Gere seu Crachá</h2>
                <p className="text-sm text-muted-foreground mt-1">Preencha seus dados para participar</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" style={{ color: "#E91E63" }} /> Nome completo
                  </Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" maxLength={60} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" style={{ color: "#E91E63" }} /> Telefone
                  </Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" maxLength={20} required />
                </div>

                {/* Revendedora toggle */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" style={{ color: "#E91E63" }} /> Você é revendedora AP Cosméticos?
                  </Label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsRevendedora(true)}
                      className={`flex-1 py-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                        isRevendedora
                          ? "border-pink-500 bg-pink-50 text-pink-700"
                          : "border-border bg-background text-muted-foreground hover:border-pink-300"
                      }`}
                    >
                      ✅ Sim, sou revendedora
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRevendedora(false)}
                      className={`flex-1 py-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                        !isRevendedora
                          ? "border-pink-500 bg-pink-50 text-pink-700"
                          : "border-border bg-background text-muted-foreground hover:border-pink-300"
                      }`}
                    >
                      Não, sou visitante
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo" className="flex items-center gap-2">
                    <Camera className="w-4 h-4" style={{ color: "#E91E63" }} /> Sua foto
                  </Label>
                  <div
                    className="border-2 border-dashed border-pink-300 rounded-xl p-6 text-center cursor-pointer hover:border-pink-500 transition-colors"
                    onClick={() => fileRef.current?.click()}
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover mx-auto" />
                    ) : (
                      <div className="text-muted-foreground">
                        <Camera className="w-10 h-10 mx-auto mb-2" style={{ color: "rgba(236,64,122,0.4)" }} />
                        <p className="text-sm">Clique para enviar sua foto</p>
                        <p className="text-xs text-muted-foreground mt-1">JPG ou PNG, máx 5MB</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} id="photo" type="file" accept="image/jpeg,image/png" onChange={handlePhoto} className="hidden" />
                </div>

                <Button
                  type="submit"
                  className="w-full font-semibold py-3 text-base"
                  style={{ backgroundColor: "#E91E63", color: "white" }}
                  disabled={submitting}
                >
                  {submitting ? "Gerando..." : "✨ Gerar meu crachá"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="animate-slide-up space-y-6">
            <BadgeCanvas
              name={badgeData.name}
              phone={badgeData.phone}
              photoUrl={badgeData.photoUrl}
              participantNumber={badgeData.number}
              isRevendedora={badgeData.isRevendedora}
              onReady={handleBadgeReady}
            />

            {badgeUrl && (
              <div className="space-y-3">
                <Button
                  onClick={downloadBadge}
                  className="w-full font-semibold py-3 gap-2"
                  style={{ backgroundColor: "#E91E63", color: "white" }}
                >
                  <Download className="w-5 h-5" /> Baixar crachá (PNG)
                </Button>
                <Button onClick={reset} variant="outline" className="w-full border-pink-300 hover:bg-pink-50" style={{ color: "#E91E63" }}>
                  Gerar outro crachá
                </Button>
                <p className="text-center text-sm font-medium mt-4" style={{ color: "#E91E63" }}>
                  Seu crachá está pronto! Agora você faz parte do time que cresce e lucra 💄✨
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="text-center py-4 text-xs text-muted-foreground">
        <Link to="/admin" className="transition-colors" style={{ color: "inherit" }}>Área Admin</Link>
      </footer>
    </div>
  );
}
