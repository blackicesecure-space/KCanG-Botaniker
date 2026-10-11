import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Plus, Calendar, Tag, Trash2, ZoomIn, X, Sprout, Filter, Clock } from 'lucide-react';
import { Grow, currentGrowWeek } from '../data/growPlan';

interface PhotoEntry {
  id: string;
  imageUrl: string;
  timestamp: number;
  week: number;
  phase: string;
  strain: string;
  notes: string;
  tags: string[];
}

const STORAGE_KEY = 'kcang_photo_diary_v1';

const DEFAULT_PHOTOS: PhotoEntry[] = [
  {
    id: 'p1',
    imageUrl: 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?auto=format&fit=crop&w=800&q=80',
    timestamp: Date.now() - 14 * 86400000,
    week: 2,
    phase: 'Vegetative Phase',
    strain: 'Mimosa Zkittlez Auto',
    notes: 'Gesunder Wuchs, erstes echtes Blattpaar entwickelt sich optimal. EC 1.2, pH 6.0.',
    tags: ['Vegi', 'Gesund', 'Topf 20L'],
  },
  {
    id: 'p2',
    imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80',
    timestamp: Date.now() - 7 * 86400000,
    week: 4,
    phase: 'Vegetative Phase',
    strain: 'Mimosa Zkittlez Auto',
    notes: 'Starker Seitentrieb-Wuchs nach LST (Low Stress Training). Wurzeln weiß und kräftig.',
    tags: ['LST', 'Wurzeln', 'Vegi-Woche 4'],
  },
];

export const GrowPhotoDiary: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PHOTOS;
  });

  const [isAdding, setIsAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [filterWeek, setFilterWeek] = useState<string>('all');

  // Form state
  const [formImage, setFormImage] = useState<string>('');
  const [formWeek, setFormWeek] = useState<number>(4);
  const [formPhase, setFormPhase] = useState<string>('Vegetative Phase');
  const [formStrain, setFormStrain] = useState<string>('Mimosa Zkittlez Auto');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formTags, setFormTags] = useState<string>('Vegi, Top-Klima');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
    } catch {}
  }, [photos]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formImage) {
      alert('Bitte nimm ein Foto auf oder wähle ein Bild aus.');
      return;
    }

    const newEntry: PhotoEntry = {
      id: `photo-${Date.now()}`,
      imageUrl: formImage,
      timestamp: Date.now(),
      week: Number(formWeek) || 1,
      phase: formPhase,
      strain: formStrain || 'Autoflower',
      notes: formNotes || 'Keine Notizen erfasst.',
      tags: formTags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    setPhotos([newEntry, ...photos]);
    setIsAdding(false);
    // Reset form
    setFormImage('');
    setFormNotes('');
  };

  const handleDeletePhoto = (id: string) => {
    if (confirm('Möchtest du diesen Tagebucheintrag wirklich löschen?')) {
      setPhotos(photos.filter((p) => p.id !== id));
    }
  };

  const filteredPhotos = filterWeek === 'all' 
    ? photos 
    : photos.filter((p) => p.week.toString() === filterWeek);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                  Visuelles Grow-Tagebuch
                </span>
                <span className="text-xs text-slate-400 font-mono">{photos.length} Einträge</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mt-1">
                Pflanzen-Entwicklung & Kamera-Galerie
              </h2>
              <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
                Nimm direkt Fotos mit deiner Smartphone- oder Webcam-Kamera auf, dokumentiere den Fortschritt nach Wochen und verfolge das Wachstum visuell.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Neues Foto aufnehmen</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800 flex-wrap text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Filter nach Woche:</span>
          </span>
          <button
            onClick={() => setFilterWeek('all')}
            className={`px-3 py-1 rounded-lg font-bold transition ${
              filterWeek === 'all' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            Alle ({photos.length})
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => {
            const count = photos.filter((p) => p.week === w).length;
            if (count === 0 && filterWeek !== w.toString()) return null;
            return (
              <button
                key={w}
                onClick={() => setFilterWeek(w.toString())}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  filterWeek === w.toString() ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                Woche {w} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Photo Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <Camera className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Neues Foto ins Tagebuch aufnehmen</h3>
              </div>
              <button
                onClick={() => setIsAdding(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPhoto} className="space-y-4 text-xs">
              {/* Camera Capture / File Upload */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-semibold">Foto aufnehmen oder hochladen:</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl bg-slate-950/60 cursor-pointer transition group">
                    <Camera className="w-8 h-8 text-emerald-400 mb-2 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold text-slate-200">Kamera öffnen / Foto wählen</span>
                    <span className="text-[10px] text-slate-500 mt-1">Nimmt direkt Foto via Smartphone/Webcam auf</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {formImage && (
                <div className="relative rounded-xl overflow-hidden border border-slate-800 h-40 bg-slate-950">
                  <img src={formImage} alt="Vorschau" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono text-emerald-400 border border-slate-800">
                    Vorschau aktiv
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Grow-Woche:</label>
                  <select
                    value={formWeek}
                    onChange={(e) => setFormWeek(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                      <option key={w} value={w}>Woche {w}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phase:</label>
                  <select
                    value={formPhase}
                    onChange={(e) => setFormPhase(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  >
                    <option value="Keimlingsphase">Keimlingsphase</option>
                    <option value="Vegetative Phase">Vegetative Phase</option>
                    <option value="Frühe Blütephase">Frühe Blütephase</option>
                    <option value="Späte Blüte / Reifung">Späte Blüte / Reifung</option>
                    <option value="Ernte & Curing">Ernte & Curing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Sorte / Genetik:</label>
                <input
                  type="text"
                  value={formStrain}
                  onChange={(e) => setFormStrain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  placeholder="z.B. Mimosa Zkittlez Auto"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Beobachtungen & Notizen:</label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                  placeholder="Z.B. Wuchshöhe 25cm, EC 1.4, Blattfarbe sattgrün..."
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tags (kommagetrennt):</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  placeholder="Vegi, LST, Wurzeln, Top-Klima"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-lg shadow-emerald-500/20"
                >
                  Eintrag speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-emerald-500/40 transition flex flex-col group"
            >
              {/* Image Container */}
              <div className="relative h-56 bg-slate-950 overflow-hidden cursor-pointer" onClick={() => setSelectedImage(photo.imageUrl)}>
                <img
                  src={photo.imageUrl}
                  alt={photo.strain}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3">
                  <span className="text-xs text-white font-bold flex items-center gap-1 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
                    <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Vergrößern</span>
                  </span>
                </div>

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-[11px] font-mono text-emerald-400 font-bold border border-slate-800">
                    Woche {photo.week}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-[11px] text-slate-300 border border-slate-800">
                    {photo.phase}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePhoto(photo.id);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-slate-950/80 text-rose-400 hover:bg-rose-500 hover:text-white transition border border-slate-800 opacity-0 group-hover:opacity-100"
                  title="Eintrag löschen"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Details */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                    <span>{new Date(photo.timestamp).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    <span className="text-emerald-400 font-bold">{photo.strain}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed line-clamp-3">
                    {photo.notes}
                  </p>
                </div>

                {photo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                    {photo.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 text-[10px] font-mono border border-slate-800">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Keine Fotos für diese Woche gefunden</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Nimm ein neues Foto auf oder wähle einen anderen Wochenfilter aus, um das Grow-Tagebuch einzusehen.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20 inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Erstes Foto aufnehmen</span>
          </button>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-900 text-white hover:bg-rose-500 transition border border-slate-800 shadow-xl"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={selectedImage} alt="Vergrößerte Ansicht" className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-slate-800 shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
