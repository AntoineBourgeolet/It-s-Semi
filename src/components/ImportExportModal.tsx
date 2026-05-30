import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Download, Upload, Copy, Check, AlertTriangle } from 'lucide-react';
import { type ClimateRegion } from '../data';
import { importGardenData } from '../utils/helpers';

export function ImportExportModal({
  onClose,
  myGarden,
  region,
  city,
  cityCoords,
  biome,
  onImportSuccess
}: {
  onClose: () => void;
  myGarden: string[];
  region: string | null;
  city: string | null;
  cityCoords: { lat: number; lng: number } | null;
  biome: ClimateRegion | null;
  onImportSuccess: (data: {
    myGarden: string[];
    region: string | null;
    city: string | null;
    cityCoords: { lat: number; lng: number } | null;
    biome: ClimateRegion | null;
  }) => void;
}) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState(false);
  const [pasteValue, setPasteValue] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  const exportDataObj = useMemo(() => {
    return {
      version: '1.0.0',
      myGarden,
      region,
      city,
      cityCoords,
      biome,
      exportedAt: new Date().toISOString()
    };
  }, [myGarden, region, city, cityCoords, biome]);

  const exportString = useMemo(() => {
    return JSON.stringify(exportDataObj, null, 2);
  }, [exportDataObj]);

  const handleCopy = () => {
    navigator.clipboard.writeText(exportString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportString);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `jardin_its_semi_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportText = () => {
    setImportError(null);
    setImportSuccessMsg(null);
    if (!pasteValue.trim()) {
      setImportError('Veuillez coller du texte ou charger un fichier JSON valide.');
      return;
    }
    const result = importGardenData(pasteValue);
    if (!result) {
      setImportError('Données de jardin invalides. Vérifiez que le texte est un JSON correct.');
      return;
    }
    
    onImportSuccess(result);
    setImportSuccessMsg(`Succès ! ${result.myGarden.length} plantes importées avec succès.`);
    setPasteValue('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const result = importGardenData(text);
      if (!result) {
        setImportError('Fichier JSON invalide. Vérifiez le format.');
        return;
      }
      onImportSuccess(result);
      setImportSuccessMsg(`Succès ! ${result.myGarden.length} plantes importées de "${file.name}".`);
    };
    reader.onerror = () => {
      setImportError('Erreur de lecture du fichier.');
    };
    reader.readAsText(file);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className="card-cartoon w-full max-w-lg bg-[#FCFAEF] relative flex flex-col max-h-[90vh]"
      >
        <button 
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 z-10 p-2 bg-red-400 rounded-full cartoon-border hover:bg-red-500 transition-colors cursor-pointer"
        >
          <X className="w-6 h-6 text-white" strokeWidth={3} />
        </button>

        <div className="p-6 md:p-8 overflow-y-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-[#2D3436] leading-tight mb-6 flex items-center gap-3 pr-8">
            <Heart className="w-8 h-8 text-pink-500 fill-pink-500 animate-pulse" /> Sauvegarder & restaurer
          </h2>

          <div className="flex gap-2 bg-[#F5F5F5] p-1 rounded-2xl cartoon-border mb-6">
            <button
              onClick={() => {
                setActiveTab('export');
                setImportError(null);
                setImportSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer ${
                activeTab === 'export'
                  ? 'bg-[#FFD93D] cartoon-border shadow-[2px_2px_0px_#2D3436]'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Export (Télécharger)
            </button>
            <button
              onClick={() => {
                setActiveTab('import');
                setImportError(null);
                setImportSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer ${
                activeTab === 'import'
                  ? 'bg-[#FFD93D] cartoon-border shadow-[2px_2px_0px_#2D3436]'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Import (Coller/Fichier)
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'export' ? (
              <motion.div
                key="export-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="bg-white p-4 rounded-2xl cartoon-border">
                  <p className="text-xs sm:text-sm font-bold text-gray-700 leading-relaxed mb-4">
                    Sauvegardez votre liste de plantes cultivées ({myGarden.length} espèces) et votre climat/localisation pour pouvoir les restaurer sur un autre appareil.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleDownload}
                      className="btn-cartoon bg-[#FF8B13] hover:bg-[#FF8B13]/90 text-white font-black py-3 px-2 flex flex-col items-center justify-center gap-2 text-center text-xs sm:text-sm cursor-pointer"
                    >
                      <Download className="w-5 h-5" />
                      Télécharger JSON
                    </button>
                    <button
                      onClick={handleCopy}
                      className="btn-cartoon bg-[#B2EBF2] hover:bg-[#80DEEA] text-[#2D3436] font-black py-3 px-2 flex flex-col items-center justify-center gap-2 text-center text-xs sm:text-sm cursor-pointer"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-700" strokeWidth={3} /> : <Copy className="w-5 h-5" />}
                      {copied ? 'Copié !' : 'Copier texte'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-500">Code de configuration brut</label>
                  <textarea
                    readOnly
                    value={exportString}
                    onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                    className="w-full h-28 p-3 text-[10px] font-mono cartoon-border rounded-xl bg-gray-50 focus:outline-none select-all custom-scrollbar"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="import-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="bg-white p-4 rounded-2xl cartoon-border">
                  <p className="text-xs sm:text-sm font-bold text-gray-700 leading-relaxed mb-4">
                    Importez votre jardin en chargeant un fichier sauvegarde JSON ou en collant le bloc de texte exporté.
                  </p>

                  <div className="relative overflow-hidden">
                    <button className="btn-cartoon bg-[#A8E6CF] text-green-900 w-full font-black py-3 px-4 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer">
                      <Upload className="w-5 h-5" />
                      Sélectionner un fichier .json
                    </button>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-500">Coller le texte brut</label>
                  <textarea
                    placeholder='Collez le texte JSON exporté ici...'
                    value={pasteValue}
                    onChange={(e) => setPasteValue(e.target.value)}
                    className="w-full h-28 p-3 text-[10px] font-mono cartoon-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8B13] custom-scrollbar"
                  />
                </div>

                {importError && (
                  <div className="p-3 bg-red-100 border-2 border-red-500 rounded-xl text-red-800 text-xs font-black leading-tight flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    {importError}
                  </div>
                )}

                {importSuccessMsg && (
                  <div className="p-3 bg-green-100 border-2 border-green-500 rounded-xl text-green-800 text-xs font-black leading-tight flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0 text-green-600" />
                    {importSuccessMsg}
                  </div>
                )}

                <button
                  onClick={handleImportText}
                  className="btn-cartoon bg-[#FFD93D] hover:bg-[#FFC619] text-[#2D3436] w-full py-3.5 font-black text-xs sm:text-sm uppercase cursor-pointer"
                >
                  Confirmer et importer
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
