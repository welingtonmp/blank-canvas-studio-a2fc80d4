import { useState, useEffect } from "react";
import { getParticipants, type Participant } from "@/lib/participants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ArrowLeft, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function Admin() {
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    setParticipants(getParticipants());
  }, []);

  const downloadBadge = (p: Participant) => {
    if (!p.badgeUrl) return;
    const a = document.createElement("a");
    a.href = p.badgeUrl;
    a.download = `cracha-${p.name.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  };

  const downloadAll = async () => {
    const withBadge = participants.filter((p) => p.badgeUrl);
    if (withBadge.length === 0) return;
    // Download one by one (ZIP requires backend)
    for (const p of withBadge) {
      downloadBadge(p);
      await new Promise((r) => setTimeout(r, 500));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50">
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Área Admin</h1>
            <p className="text-gray-400 text-sm">AP Cosméticos — Participantes</p>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700 gap-1">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-600" />
            <span className="font-semibold text-foreground">{participants.length} participante(s)</span>
          </div>
          {participants.length > 0 && (
            <Button onClick={downloadAll} size="sm" className="bg-pink-600 hover:bg-pink-700 text-white gap-1">
              <Download className="w-4 h-4" /> Baixar todos
            </Button>
          )}
        </div>

        {participants.length === 0 ? (
          <Card className="border-pink-200">
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhuma participante cadastrada ainda.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.map((p) => (
              <Card key={p.id} className="border-pink-200 overflow-hidden">
                {p.badgeUrl && (
                  <img src={p.badgeUrl} alt={`Crachá ${p.name}`} className="w-full" loading="lazy" />
                )}
                <CardContent className="p-4">
                  <p className="font-semibold text-foreground truncate">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{p.phone}</p>
                  <p className="text-xs text-muted-foreground">Nº {String(p.number).padStart(3, "0")}</p>
                  {p.badgeUrl && (
                    <Button onClick={() => downloadBadge(p)} size="sm" variant="outline" className="mt-2 w-full border-pink-300 text-pink-700 gap-1">
                      <Download className="w-3 h-3" /> Baixar
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
