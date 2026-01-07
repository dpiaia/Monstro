import React, { useState, useRef } from 'react';
import { Camera, ArrowLeft, Upload, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { analyzeEquipmentImage } from '../services/geminiService';

interface EquipmentAnalyzerProps {
    onBack: () => void;
}

const EquipmentAnalyzer: React.FC<EquipmentAnalyzerProps> = ({ onBack }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImagePreview(base64String);
                setResult(null); // Reset previous result
                handleAnalyze(base64String);
            };
            
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async (base64Full: string) => {
        setIsAnalyzing(true);
        // Remove data URL prefix for API
        const base64Data = base64Full.split(',')[1];
        
        const analysis = await analyzeEquipmentImage(base64Data);
        setResult(analysis);
        setIsAnalyzing(false);
    };

    const triggerCamera = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="h-full flex flex-col bg-neutral-950 p-6 animate-fade-in pb-24">
            <header className="flex items-center space-x-4 mb-6">
                <button 
                    onClick={onBack}
                    className="p-2 rounded-full bg-neutral-800 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Analisar Equipamento</h1>
                    <p className="text-gray-400 text-sm">Tire uma foto para aprender a usar</p>
                </div>
            </header>

            <div className="flex-1 flex flex-col space-y-6">
                
                {/* Image Area */}
                <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-neutral-900 border-2 border-dashed border-neutral-800 flex flex-col items-center justify-center">
                    {imagePreview ? (
                        <img 
                            src={imagePreview} 
                            alt="Equipamento" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-center p-6 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-neon-purple">
                                <Camera size={32} />
                            </div>
                            <div>
                                <p className="text-white font-bold">Tire uma foto</p>
                                <p className="text-sm text-gray-500">ou escolha da galeria</p>
                            </div>
                        </div>
                    )}

                    {/* Loading Overlay */}
                    {isAnalyzing && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                             <div className="w-12 h-12 rounded-full border-4 border-t-neon-bright border-r-transparent border-b-neutral-800 border-l-neutral-800 animate-spin mb-4"></div>
                             <p className="text-neon-bright font-bold animate-pulse">IA Analisando...</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                {!isAnalyzing && (
                    <div className="flex space-x-3">
                         <button 
                            onClick={triggerCamera}
                            className="flex-1 py-4 bg-neon-purple hover:bg-purple-600 text-white rounded-xl font-bold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-purple-900/20"
                        >
                            <Camera size={20} />
                            <span>{imagePreview ? 'Tirar Outra' : 'Abrir Câmera'}</span>
                        </button>
                        <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment" // Prefer rear camera on mobile
                            ref={fileInputRef} 
                            className="hidden" 
                            onChange={handleFileSelect}
                        />
                    </div>
                )}

                {/* Result Area */}
                {result && (
                    <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 animate-fade-in shadow-xl">
                        <div className="flex items-center space-x-2 mb-4">
                            <Info className="text-neon-bright" size={20} />
                            <h3 className="text-lg font-bold text-white">Análise do Treinador</h3>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-line">
                            {result}
                        </div>
                    </div>
                )}

                {!result && !isAnalyzing && !imagePreview && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start space-x-3">
                        <AlertCircle className="text-blue-400 flex-shrink-0" size={20} />
                        <p className="text-sm text-blue-200">
                            Aponte a câmera para qualquer máquina da academia para descobrir para que serve e como executar o movimento com segurança.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EquipmentAnalyzer;