import React, { useRef } from 'react';
import { ArrowLeft, Download, Upload, Trash2, Database, AlertTriangle, FileJson } from 'lucide-react';

interface SettingsProps {
    onBack: () => void;
    onImport: (file: File) => void;
    onExport: () => void;
    onClear: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack, onImport, onExport, onClear }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (confirm("Importar dados irá substituir todos os seus dados atuais. Deseja continuar?")) {
                onImport(e.target.files[0]);
            }
        }
    };

    const handleClearClick = () => {
        if (confirm("ATENÇÃO: Isso apagará todo o seu progresso e histórico. Essa ação é irreversível. Deseja realmente resetar o aplicativo?")) {
            onClear();
        }
    };

    return (
        <div className="p-6 space-y-8 animate-fade-in pb-32">
            <header className="flex items-center space-x-4 mb-8">
                <button 
                    onClick={onBack}
                    className="p-2 rounded-full bg-neutral-800 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Configurações</h1>
                    <p className="text-gray-400 text-sm">Gerenciamento de Dados</p>
                </div>
            </header>

            <div className="space-y-6">
                {/* Backup Section */}
                <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center space-x-3 mb-2">
                        <Database className="text-neon-purple" size={24} />
                        <h2 className="text-lg font-bold text-white">Backup & Dados</h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                        Seus dados são salvos automaticamente no seu navegador. Use as opções abaixo para trocar de dispositivo.
                    </p>

                    <button 
                        onClick={onExport}
                        className="w-full flex items-center justify-between p-4 bg-neutral-800/50 hover:bg-neutral-800 rounded-xl border border-neutral-700 transition-all group"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-neon-purple/10 rounded-lg text-neon-purple group-hover:bg-neon-purple group-hover:text-white transition-colors">
                                <Download size={20} />
                            </div>
                            <div className="text-left">
                                <div className="text-white font-medium text-sm">Exportar Dados</div>
                                <div className="text-xs text-gray-500">Baixar arquivo JSON</div>
                            </div>
                        </div>
                        <FileJson size={16} className="text-gray-600" />
                    </button>

                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-between p-4 bg-neutral-800/50 hover:bg-neutral-800 rounded-xl border border-neutral-700 transition-all group"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-neon-bright/10 rounded-lg text-neon-bright group-hover:bg-neon-bright group-hover:text-black transition-colors">
                                <Upload size={20} />
                            </div>
                            <div className="text-left">
                                <div className="text-white font-medium text-sm">Importar Dados</div>
                                <div className="text-xs text-gray-500">Restaurar de arquivo JSON</div>
                            </div>
                        </div>
                        <FileJson size={16} className="text-gray-600" />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept=".json"
                        onChange={handleFileChange}
                    />
                </section>

                {/* Danger Zone */}
                <section className="bg-red-950/20 border border-red-900/30 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center space-x-3 mb-2">
                        <AlertTriangle className="text-red-500" size={24} />
                        <h2 className="text-lg font-bold text-white">Zona de Perigo</h2>
                    </div>
                    
                    <button 
                        onClick={handleClearClick}
                        className="w-full flex items-center justify-center space-x-2 p-4 bg-red-600/10 hover:bg-red-600 hover:text-white text-red-500 rounded-xl border border-red-900/50 transition-all"
                    >
                        <Trash2 size={20} />
                        <span className="font-bold text-sm">Apagar Tudo e Resetar</span>
                    </button>
                </section>
            </div>
            
            <div className="text-center text-xs text-neutral-700 mt-8">
                Eu Monstro Gym Tracker v1.0 <br/>
                Local Data Storage
            </div>
        </div>
    );
};

export default Settings;