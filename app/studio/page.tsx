'use client';

import { useState } from 'react';
import { 
  Video, Image, Mic, FileText, Presentation, Sparkles, 
  Wand2, Download, Loader2, Play, Volume2, Eye,
  Film, ImagePlus, FileAudio, FileType, LayoutTemplate, Megaphone
} from 'lucide-react';

type CreationType = 'video' | 'image' | 'voice' | 'presentation' | 'pdf' | 'ad';

interface CreationResult {
  type: CreationType;
  url?: string;
  content?: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  message?: string;
}

const creationTypes = [
  { 
    id: 'video' as CreationType, 
    name: 'Video', 
    icon: Film, 
    description: 'Text to Video with Runway',
    placeholder: 'A golden sunrise over mountains, cinematic drone shot...',
    color: 'from-purple-500 to-pink-500'
  },
  { 
    id: 'image' as CreationType, 
    name: 'Image', 
    icon: ImagePlus, 
    description: 'Text to Image with FLUX/SD',
    placeholder: 'A futuristic city skyline at night, neon lights reflecting...',
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    id: 'voice' as CreationType, 
    name: 'Voice', 
    icon: FileAudio, 
    description: 'Text to Speech with ElevenLabs',
    placeholder: 'Welcome to SaintSal, the future of AI-powered business...',
    color: 'from-green-500 to-emerald-500'
  },
  { 
    id: 'presentation' as CreationType, 
    name: 'Presentation', 
    icon: LayoutTemplate, 
    description: 'Text to PPTX Slides',
    placeholder: 'Create a 10-slide pitch deck about AI automation for SMBs...',
    color: 'from-orange-500 to-yellow-500'
  },
  { 
    id: 'pdf' as CreationType, 
    name: 'PDF', 
    icon: FileType, 
    description: 'Text to PDF Document',
    placeholder: 'Generate a professional proposal for commercial lending services...',
    color: 'from-red-500 to-orange-500'
  },
  { 
    id: 'ad' as CreationType, 
    name: 'Video Ad', 
    icon: Megaphone, 
    description: 'Text to Video Ad with Voice',
    placeholder: 'Create a 30-second ad for a luxury real estate listing in Malibu...',
    color: 'from-gold-400 to-gold-600'
  },
];

export default function StudioPage() {
  const [selectedType, setSelectedType] = useState<CreationType>('image');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<CreationResult[]>([]);
  const [activeResult, setActiveResult] = useState<CreationResult | null>(null);

  // Voice-specific options
  const [voiceId, setVoiceId] = useState('21m00Tcm4TlvDq8ikWAM'); // Rachel
  const voices = [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel - Calm' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella - Soft' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni - Warm' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli - Young' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh - Deep' },
    { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold - Strong' },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam - Narrator' },
    { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam - Dynamic' },
  ];

  // Image-specific options
  const [imageModel, setImageModel] = useState('flux');
  const [imageSize, setImageSize] = useState('1024x1024');

  // Video-specific options
  const [videoDuration, setVideoDuration] = useState('5');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    const newResult: CreationResult = {
      type: selectedType,
      status: 'processing',
    };
    setResults(prev => [newResult, ...prev]);

    try {
      const response = await fetch(`/api/create/${selectedType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          voiceId: selectedType === 'voice' || selectedType === 'ad' ? voiceId : undefined,
          model: selectedType === 'image' ? imageModel : undefined,
          size: selectedType === 'image' ? imageSize : undefined,
          duration: selectedType === 'video' || selectedType === 'ad' ? videoDuration : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const completedResult: CreationResult = {
          type: selectedType,
          url: data.url,
          content: data.content,
          status: 'complete',
        };
        setResults(prev => [completedResult, ...prev.slice(1)]);
        setActiveResult(completedResult);
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error: any) {
      const errorResult: CreationResult = {
        type: selectedType,
        status: 'error',
        message: error.message,
      };
      setResults(prev => [errorResult, ...prev.slice(1)]);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedConfig = creationTypes.find(t => t.id === selectedType)!;

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Header */}
      <header className="border-b border-dark-800 bg-dark-900/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                Creative Studio
              </h1>
              <p className="text-xs text-dark-400">Powered by SaintSal™</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-dark-400 bg-dark-800 px-3 py-1.5 rounded-full">
              {results.filter(r => r.status === 'complete').length} creations
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Creation Type Selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {creationTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                selectedType === type.id
                  ? 'border-gold-500 bg-gold-500/10 shadow-lg shadow-gold-500/20'
                  : 'border-dark-700 bg-dark-900 hover:border-dark-600'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center mb-3 mx-auto`}>
                <type.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-center">{type.name}</h3>
              <p className="text-xs text-dark-400 text-center mt-1 line-clamp-2">{type.description}</p>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="space-y-6">
            {/* Main Prompt */}
            <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
              <label className="block text-sm font-medium text-dark-300 mb-3">
                Describe what you want to create
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={selectedConfig.placeholder}
                rows={5}
                className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 resize-none transition-all"
              />
              
              {/* Type-specific Options */}
              <div className="mt-4 space-y-4">
                {/* Voice Options */}
                {(selectedType === 'voice' || selectedType === 'ad') && (
                  <div>
                    <label className="block text-xs text-dark-400 mb-2">Voice</label>
                    <select
                      value={voiceId}
                      onChange={(e) => setVoiceId(e.target.value)}
                      className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:border-gold-500"
                    >
                      {voices.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Image Options */}
                {selectedType === 'image' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-dark-400 mb-2">Model</label>
                      <select
                        value={imageModel}
                        onChange={(e) => setImageModel(e.target.value)}
                        className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:border-gold-500"
                      >
                        <option value="flux">FLUX Pro</option>
                        <option value="sdxl">Stable Diffusion XL</option>
                        <option value="sd3">Stable Diffusion 3</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-dark-400 mb-2">Size</label>
                      <select
                        value={imageSize}
                        onChange={(e) => setImageSize(e.target.value)}
                        className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:border-gold-500"
                      >
                        <option value="1024x1024">1024×1024 (Square)</option>
                        <option value="1024x576">1024×576 (16:9)</option>
                        <option value="576x1024">576×1024 (9:16)</option>
                        <option value="1536x1024">1536×1024 (3:2)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Video Options */}
                {(selectedType === 'video' || selectedType === 'ad') && (
                  <div>
                    <label className="block text-xs text-dark-400 mb-2">Duration</label>
                    <select
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(e.target.value)}
                      className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:border-gold-500"
                    >
                      <option value="5">5 seconds</option>
                      <option value="10">10 seconds</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full mt-6 py-4 rounded-xl font-semibold text-black bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-500 hover:to-gold-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-gold-500/25"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate {selectedConfig.name}
                  </>
                )}
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
              <h3 className="text-sm font-medium text-dark-300 mb-3">Quick Prompts</h3>
              <div className="flex flex-wrap gap-2">
                {selectedType === 'image' && (
                  <>
                    <button onClick={() => setPrompt('Professional headshot of a business executive, studio lighting, white background')} className="px-3 py-1.5 text-xs bg-dark-800 hover:bg-dark-700 rounded-full transition-colors">Business Headshot</button>
                    <button onClick={() => setPrompt('Modern luxury real estate property, aerial drone shot, golden hour lighting')} className="px-3 py-1.5 text-xs bg-dark-800 hover:bg-dark-700 rounded-full transition-colors">Real Estate</button>
                    <button onClick={() => setPrompt('Minimalist logo design, golden and black colors, elegant typography')} className="px-3 py-1.5 text-xs bg-dark-800 hover:bg-dark-700 rounded-full transition-colors">Logo Design</button>
                  </>
                )}
                {selectedType === 'video' && (
                  <>
                    <button onClick={() => setPrompt('Cinematic drone shot flying over a luxury beachfront property at sunset')} className="px-3 py-1.5 text-xs bg-dark-800 hover:bg-dark-700 rounded-full transition-colors">Property Tour</button>
                    <button onClick={() => setPrompt('Abstract 3D animation of golden particles forming a company logo')} className="px-3 py-1.5 text-xs bg-dark-800 hover:bg-dark-700 rounded-full transition-colors">Logo Animation</button>
                    <button onClick={() => setPrompt('Professional business meeting in a modern office, soft natural lighting')} className="px-3 py-1.5 text-xs bg-dark-800 hover:bg-dark-700 rounded-full transition-colors">Corporate</button>
                  </>
                )}
                {selectedType === 'voice' && (
                  <>
                    <button onClick={() => setPrompt('Welcome to SaintSal, the most advanced AI platform for business professionals. Let me show you how we can transform your workflow.')} className="px-3 py-1.5 text-xs bg-dark-800 hover:bg-dark-700 rounded-full transition-colors">Welcome Message</button>
                    <button onClick={() => setPrompt('Thank you for your inquiry. A member of our team will be in touch within 24 hours to discuss your needs.')} className="px-3 py-1.5 text-xs bg-dark-800 hover:bg-dark-700 rounded-full transition-colors">Auto-Response</button>
                  </>
                )}
                {selectedType === 'presentation' && (
                  <>
                    <button onClick={() => setPrompt('Create a 10-slide investor pitch deck for an AI startup, include market size, problem, solution, traction, team, and ask')} className="px-3 py-1.5 text-xs bg-dark-800 hover:bg-dark-700 rounded-full transition-colors">Investor Pitch</button>
                    <button onClick={() => setPrompt('Create a sales presentation for commercial real estate lending services, focus on speed, rates, and experience')} className="px-3 py-1.5 text-xs bg-dark-800 hover:bg-dark-700 rounded-full transition-colors">Sales Deck</button>
                  </>
                )}
                {selectedType === 'pdf' && (
                  <>
                    <button onClick={() => setPrompt('Generate a professional business proposal for AI consulting services, include scope, timeline, pricing, and terms')} className="px-3 py-1.5 text-xs bg-dark-800 hover:bg-dark-700 rounded-full transition-colors">Business Proposal</button>
                    <button onClick={() => setPrompt('Create a comprehensive market analysis report for commercial real estate in Southern California')} className="px-3 py-1.5 text-xs bg-dark-800 hover:bg-dark-700 rounded-full transition-colors">Market Report</button>
                  </>
                )}
                {selectedType === 'ad' && (
                  <>
                    <button onClick={() => setPrompt('Create a 30-second video ad for a luxury real estate listing: 5 bedroom oceanfront home in Malibu, $12M, featuring stunning views and modern architecture')} className="px-3 py-1.5 text-xs bg-dark-800 hover:bg-dark-700 rounded-full transition-colors">Real Estate Ad</button>
                    <button onClick={() => setPrompt('Create a promotional video for SaintSal AI platform: Introducing the future of business automation, unlimited AI power at your fingertips')} className="px-3 py-1.5 text-xs bg-dark-800 hover:bg-dark-700 rounded-full transition-colors">Product Promo</button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-dark-800 flex items-center justify-between">
                <h3 className="font-medium">Preview</h3>
                {activeResult?.url && (
                  <a
                    href={activeResult.url}
                    download
                    className="flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                )}
              </div>
              <div className="aspect-video bg-dark-950 flex items-center justify-center">
                {isGenerating ? (
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-gold-400 animate-spin mx-auto mb-4" />
                    <p className="text-dark-400">Creating your {selectedConfig.name.toLowerCase()}...</p>
                    <p className="text-xs text-dark-500 mt-2">This may take a moment</p>
                  </div>
                ) : activeResult?.status === 'complete' ? (
                  <>
                    {(activeResult.type === 'image') && activeResult.url && (
                      <img src={activeResult.url} alt="Generated" className="max-w-full max-h-full object-contain" />
                    )}
                    {(activeResult.type === 'video' || activeResult.type === 'ad') && activeResult.url && (
                      <video src={activeResult.url} controls className="max-w-full max-h-full" />
                    )}
                    {activeResult.type === 'voice' && activeResult.url && (
                      <div className="text-center p-8">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-4">
                          <Volume2 className="w-10 h-10 text-black" />
                        </div>
                        <audio src={activeResult.url} controls className="mx-auto" />
                      </div>
                    )}
                    {(activeResult.type === 'presentation' || activeResult.type === 'pdf') && (
                      <div className="text-center p-8">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-10 h-10 text-black" />
                        </div>
                        <p className="text-dark-300 mb-4">Your {activeResult.type === 'presentation' ? 'presentation' : 'PDF'} is ready!</p>
                        <a
                          href={activeResult.url}
                          download
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 text-black font-semibold rounded-lg hover:bg-gold-400 transition-colors"
                        >
                          <Download className="w-5 h-5" />
                          Download File
                        </a>
                      </div>
                    )}
                  </>
                ) : activeResult?.status === 'error' ? (
                  <div className="text-center text-red-400">
                    <p>Generation failed</p>
                    <p className="text-sm text-dark-400 mt-2">{activeResult.message}</p>
                  </div>
                ) : (
                  <div className="text-center text-dark-500">
                    <selectedConfig.icon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Your {selectedConfig.name.toLowerCase()} will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* History */}
            <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
              <h3 className="font-medium mb-4">Recent Creations</h3>
              {results.length === 0 ? (
                <p className="text-dark-500 text-sm text-center py-8">No creations yet. Start generating!</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {results.slice(0, 10).map((result, i) => {
                    const config = creationTypes.find(t => t.id === result.type)!;
                    return (
                      <button
                        key={i}
                        onClick={() => result.status === 'complete' && setActiveResult(result)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          result.status === 'complete' 
                            ? 'bg-dark-800 hover:bg-dark-700 cursor-pointer' 
                            : 'bg-dark-850 opacity-60'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}>
                          <config.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">{config.name}</p>
                          <p className="text-xs text-dark-400 capitalize">{result.status}</p>
                        </div>
                        {result.status === 'processing' && (
                          <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                        )}
                        {result.status === 'complete' && (
                          <Eye className="w-4 h-4 text-dark-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
