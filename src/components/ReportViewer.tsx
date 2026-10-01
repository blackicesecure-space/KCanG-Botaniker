import React, { useState } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  Printer,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Download,
  Share2,
  Calendar,
  Leaf,
  FileCheck,
} from 'lucide-react';

interface ReportViewerProps {
  reportText: string;
  onNewDiagnosis: () => void;
  strainName?: string;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  reportText,
  onNewDiagnosis,
  strainName,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<'all' | 'part1' | 'part2' | 'part3'>('all');

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Split report into sections if available
  const part1Index = reportText.indexOf('**Teil 1');
  const part2Index = reportText.indexOf('**Teil 2');
  const part3Index = reportText.indexOf('**Teil 3');

  let part1Text = reportText;
  let part2Text = '';
  let part3Text = '';

  if (part2Index !== -1) {
    part1Text = reportText.substring(0, part2Index);
    if (part3Index !== -1) {
      part2Text = reportText.substring(part2Index, part3Index);
      part3Text = reportText.substring(part3Index);
    } else {
      part2Text = reportText.substring(part2Index);
    }
  }

  const displayedContent =
    activeSection === 'part1'
      ? part1Text
      : activeSection === 'part2'
      ? part2Text
      : activeSection === 'part3'
      ? part3Text
      : reportText;

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck className="w-4 h-4" />
            Botanischer Experten-Befund
          </span>
          <h3 className="text-base font-bold text-white">
            Diagnose & Behandlungsplan ({strainName || 'Cannabis sativa L.'})
          </h3>
          <p className="text-xs text-slate-400">
            Erstellt nach den Richtlinien für Aeroponik-Kultivierung und KCanG Eigenanbau in Deutschland.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Print / PDF Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Druckansicht öffnen oder als PDF speichern"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Drucken / PDF</span>
          </button>

          {/* Copy Markdown */}
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Kopiert!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Markdown kopieren</span>
              </>
            )}
          </button>

          {/* New Diagnosis */}
          <button
            onClick={onNewDiagnosis}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Neuer Befund</span>
          </button>
        </div>
      </div>

      {/* Section Filter Pills (Hidden during print) */}
      <div className="flex items-center gap-2 print:hidden overflow-x-auto text-xs">
        <span className="text-slate-400 font-medium mr-1">Abschnitt:</span>
        <button
          onClick={() => setActiveSection('all')}
          className={`px-3 py-1.5 rounded-xl font-medium transition ${
            activeSection === 'all'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Vollständiger Bericht (Teil 1–3)
        </button>
        <button
          onClick={() => setActiveSection('part1')}
          className={`px-3 py-1.5 rounded-xl font-medium transition ${
            activeSection === 'part1'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Teil 1: Problemanalyse
        </button>
        <button
          onClick={() => setActiveSection('part2')}
          className={`px-3 py-1.5 rounded-xl font-medium transition ${
            activeSection === 'part2'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Teil 2: Behandlungsanleitung
        </button>
        <button
          onClick={() => setActiveSection('part3')}
          className={`px-3 py-1.5 rounded-xl font-medium transition ${
            activeSection === 'part3'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Teil 3: Erfolgskontrolle & Vorbeugung
        </button>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Print Header */}
        <div className="hidden print:block border-b-2 border-emerald-600 pb-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-slate-900">KCanG AeroBotaniker</h1>
              <p className="text-xs text-slate-600">
                Wissenschaftliche Diagnose & Behandlungsleitfaden für Cannabis sativa L. in Aeroponik-Systemen
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Datum: {new Date().toLocaleDateString('de-DE')}</p>
              <p>Rechtsrahmen: KCanG § 9 & § 10</p>
            </div>
          </div>
        </div>

        {/* Formatted Markdown Content */}
        <div className="prose prose-invert max-w-none print:prose-neutral">
          <MarkdownRenderer content={displayedContent} />
        </div>

        {/* Botanical Footer Note */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 text-xs text-slate-400 print:text-slate-600 flex flex-col sm:flex-row justify-between gap-2">
          <span>KCanG AeroBotaniker Suite • 20+ Jahre botanische Pflanzenkunde</span>
          <span>Hinweis: Alle Angaben ohne Gewähr. Keine Rechtsberatung. KCanG Richtlinien einhalten.</span>
        </div>
      </div>
    </div>
  );
};
