import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Loader2, Search, BookOpen, Cog, Beaker, Sparkles, Lightbulb, Monitor, Eye, Maximize2, Home } from 'lucide-react';
import { conductResearch, buildSimulation, callGeminiAPI } from '@/api/gemini'; // Add callGeminiAPI here
import { SimulationData, ProgressStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ExperimentLabProps {
  onRequestAssistance: (topic: string, simulation: SimulationData) => void;
  onBackToHome: () => void; // Add this prop
}

export const ExperimentLab = ({ onRequestAssistance, onBackToHome }: ExperimentLabProps) => {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [simulation, setSimulation] = useState<SimulationData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [stepStatuses, setStepStatuses] = useState<{
    research: ProgressStatus;
    analysis: ProgressStatus;
    simulation: ProgressStatus;
  }>({
    research: 'pending',
    analysis: 'pending',
    simulation: 'pending',
  });
  const [rawSimulationHtml, setRawSimulationHtml] = useState<string>('');

  // Store the current blob URL for cleanup
  const currentBlobUrl = useRef<string | null>(null);

  // Suggested topics for quick start
  const suggestedTopics = [
    'Pendulum Motion',
    'Wave Interference',
    'Planetary Orbits',
    'Double Slit Experiment',
    'Electromagnetic Induction',
    'Chemical Reactions',
    'DNA Replication',
    'Projectile Motion'
  ];

  const updateStepStatus = (step: keyof typeof stepStatuses, status: ProgressStatus) => {
    setStepStatuses(prev => ({ ...prev, [step]: status }));
  };

  const createBlobUrl = (htmlContent: string): string => {
    // Clean up the previous blob URL to prevent memory leaks
    if (currentBlobUrl.current) {
      URL.revokeObjectURL(currentBlobUrl.current);
    }

    // Create a new Blob from the HTML string
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    // Generate a temporary, unique URL for this Blob
    const blobUrl = URL.createObjectURL(blob);
    
    // Store the new URL for future cleanup
    currentBlobUrl.current = blobUrl;
    
    return blobUrl;
  };

  // Auto-start screen sharing when simulation is generated
  const startScreenShare = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
        
        setIsScreenSharing(true);
        
        // Handle when user stops screen sharing
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          setIsScreenSharing(false);
        });

        toast({
          title: "Screen sharing started!",
          description: "Your simulation is now visible to the AI assistant",
        });
      }
    } catch (error) {
      console.error('Error starting screen share:', error);
      toast({
        variant: "destructive",
        title: "Screen share failed",
        description: "Could not start screen sharing. You can manually share later.",
      });
    }
  };

  // Update the generateSimulation function
  const generateSimulation = async () => {
    if (!topic.trim()) {
      toast({
        variant: "destructive",
        title: "Please enter a topic",
        description: "Enter a scientific topic to generate a simulation",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setSimulation(null);
    setRawSimulationHtml(''); // Clear previous raw HTML
    
    // Reset all steps
    updateStepStatus('research', 'pending');
    updateStepStatus('analysis', 'pending');
    updateStepStatus('simulation', 'pending');

    try {
      // Phase 1: Research
      setCurrentStep('Researching Topic');
      updateStepStatus('research', 'active');
      setProgress(10);
      
      const researchData = await conductResearch(topic);
      updateStepStatus('research', 'completed');
      setProgress(40);

      // Phase 2: Analysis
      setCurrentStep('Analyzing Information');
      updateStepStatus('analysis', 'active');
      setProgress(50);
      
      // Extract concepts summary (first 150 chars)
      const concepts = researchData.length > 150 
        ? researchData.substring(0, 150) + '...'
        : researchData;
      
      updateStepStatus('analysis', 'completed');
      setProgress(70);

      // Phase 3: Simulation Building
      setCurrentStep('Building Interactive Simulation');
      updateStepStatus('simulation', 'active');
      setProgress(80);
      
      // Get the processed HTML (with injections) for iframe
      const processedHtmlCode = await buildSimulation(topic, researchData);
      
      // ALSO get the raw HTML directly from the AI for full-screen viewing
      // Use a more complete prompt that ensures proper CDN imports
      const rawHtmlFromAI = await callGeminiAPI(`Create ONE interactive HTML simulation for: "${topic}"

Research: ${researchData}

CRITICAL REQUIREMENTS:
- Complete, self-contained HTML document starting with <!DOCTYPE html>
- The simulation MUST be fully visible and responsive
- Dark theme with vibrant colors suitable for a science lab
- Only provide HTML code, no additional text or explanations

REQUIRED HTML STRUCTURE:
\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${topic} Simulation</title>
  <!-- CRITICAL: Include the exact CDN script for the library you're using -->
  <style>
    /* Your CSS here with dark theme */
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #111827; }
  </style>
</head>
<body>
  <!-- Your simulation content here -->
  <script>
    // Your JavaScript here
  </script>
</body>
</html>
\`\`\`

LIBRARY USAGE RULES:
- For Pixi.js: <script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.2.4/pixi.min.js"></script>
- For P5.js: <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js"></script>
- For Three.js: <script type="importmap">{"imports":{"three":"https://unpkg.com/three@0.158.0/build/three.module.js"}}</script>
- For D3.js: <script src="https://d3js.org/d3.v7.min.js"></script>

EXAMPLE FOR PIXI.JS:
\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.2.4/pixi.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #1a1a2e; }
    #container { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="container"></div>
  <script>
    // Wait for PIXI to load
    document.addEventListener('DOMContentLoaded', () => {
      const app = new PIXI.Application({
        backgroundColor: 0x1a1a2e,
        resizeTo: window
      });
      document.getElementById('container').appendChild(app.view);
      
      // Your Pixi.js simulation code here
      window.app = app; // Expose globally
    });
  </script>
</body>
</html>
\`\`\`

Make the simulation in pixi.js / p5.js / d3.js according to the need most of the time.
Choose pixi.js over p5.js for 2D simulations.
Use three.js only if the user has requested 3D simulation specifically.

Focus on core concept visualization with essential interactivity only.`);
    
      // Clean the raw HTML (remove markdown fences if present)
      let cleanedRawHtml = rawHtmlFromAI.trim();
      const markdownFenceRegex = /^```html\s*([\s\S]+?)\s*```$/;
      const match = cleanedRawHtml.match(markdownFenceRegex);
      if (match) {
        cleanedRawHtml = match[1].trim();
      }
      
      // Store the raw HTML for full-screen viewing
      setRawSimulationHtml(cleanedRawHtml);
      
      updateStepStatus('simulation', 'completed');
      setProgress(100);

      const simulationData: SimulationData = {
        topic,
        research: researchData,
        concepts,
        htmlCode: processedHtmlCode, // Use processed version for iframe
      };

      setSimulation(simulationData);
      setCurrentStep('Simulation Ready!');
      
      toast({
        title: "Simulation Generated!",
        description: `Interactive simulation for "${topic}" is ready for exploration`,
      });

      // Auto-start screen sharing for this page
      setTimeout(() => {
        startScreenShare();
      }, 1000);

    } catch (error) {
      console.error('Error generating simulation:', error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Failed to generate simulation. Please try again.",
      });
      
      // Mark current step as error
      if (stepStatuses.research === 'active') updateStepStatus('research', 'error');
      else if (stepStatuses.analysis === 'active') updateStepStatus('analysis', 'error');
      else if (stepStatuses.simulation === 'active') updateStepStatus('simulation', 'error');
      
    } finally {
      setIsGenerating(false);
    }
  };

  // The openFullScreen function should now work correctly
  const openFullScreen = () => {
    if (!rawSimulationHtml) {
      toast({
        variant: "destructive",
        title: "No raw simulation available",
        description: "Please generate a simulation first",
      });
      return;
    }
    
    const blob = new Blob([rawSimulationHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    // Clean up the blob URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const getStepIcon = (step: keyof typeof stepStatuses) => {
    const status = stepStatuses[step];
    const iconClass = "w-5 h-5";
    
    if (status === 'active') return <Loader2 className={`${iconClass} animate-spin text-orange-400`} />;
    if (status === 'completed') return getStepCompletedIcon(step);
    if (status === 'error') return <span className="text-red-500">✗</span>;
    
    return getStepDefaultIcon(step);
  };

  const getStepDefaultIcon = (step: keyof typeof stepStatuses) => {
    const iconClass = "w-5 h-5 text-gray-500";
    switch (step) {
      case 'research': return <Search className={iconClass} />;
      case 'analysis': return <BookOpen className={iconClass} />;
      case 'simulation': return <Cog className={iconClass} />;
    }
  };

  const getStepCompletedIcon = (step: keyof typeof stepStatuses) => {
    const iconClass = "w-5 h-5 text-orange-400";
    switch (step) {
      case 'research': return <Search className={iconClass} />;
      case 'analysis': return <BookOpen className={iconClass} />;
      case 'simulation': return <Cog className={iconClass} />;
    }
  };

  const getStepBgColor = (step: keyof typeof stepStatuses) => {
    const status = stepStatuses[step];
    if (status === 'active') return 'bg-orange-500/20 border-orange-400/50';
    if (status === 'completed') return 'bg-orange-500/10 border-orange-400/30';
    if (status === 'error') return 'bg-red-500/20 border-red-400/50';
    return 'bg-gray-800/50 border-gray-600/30';
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      {/* Header Section with integrated Back to Home Button */}
      <div className="flex-shrink-0 py-4 border-b border-orange-500/30 bg-black">
        <div className="text-center relative px-4">
          {/* Back to Home button positioned on the left inside header */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Button
              onClick={onBackToHome}
              variant="outline"
              size="sm"
              className="bg-gray-800/80 border-orange-500/50 text-orange-200 hover:bg-orange-500/20 hover:border-orange-400"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          {/* Screen sharing indicator positioned on the right */}
          {isScreenSharing && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/50">
                <Eye className="w-4 h-4 text-orange-400" />
                <span className="text-orange-200 text-sm font-medium">Screen sharing active</span>
              </div>
            </div>
          )}
          
          {/* Centered header content */}
          <div>
            <div className="flex items-center justify-center gap-3 mb-2">
              <Beaker className="w-7 h-7 text-orange-400" />
              <h1 className="text-3xl font-bold text-white">
                Scientist Santa's Experiment Lab
              </h1>
              <Sparkles className="w-7 h-7 text-orange-400" />
            </div>
            <p className="text-lg text-orange-200">
              Generate interactive scientific simulations with AI assistance
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Side - Large Simulation Preview */}
        <div className="flex-1 p-4 overflow-hidden min-w-0">
          <Card className="h-full bg-gray-900/90 backdrop-blur-sm border-orange-500/30 flex flex-col overflow-hidden">
            {/* The CardHeader has been removed to maximize space for the simulation */}
            <CardContent className="flex-1 overflow-hidden p-0">
              {simulation ? (
                <div className="bg-black rounded-lg overflow-hidden h-full w-full border-2 border-orange-500/20">
                  {/* Add full-screen button */}
                  <div className="flex justify-between items-center p-2 bg-gray-800 border-b border-orange-500/20">
                    <span className="text-orange-200 text-sm">Interactive Preview</span>
                    <button
                      onClick={openFullScreen}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
                      title="Open full-screen version in new tab"
                    >
                      <Maximize2 className="w-3 h-3" />
                      Full Screen
                    </button>
                  </div>
                  <div className="h-[calc(100%-2.5rem)]">
                    <iframe
                      src={createBlobUrl(simulation.htmlCode)}
                      className="w-full h-full border-0"
                      title={`${simulation.topic} Simulation`}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-orange-200 p-4">
                  <div className="text-center">
                    <Beaker className="w-20 h-20 mx-auto mb-4 opacity-50 text-orange-400" />
                    <p className="text-xl text-white">No simulation generated yet</p>
                    <p className="text-sm opacity-75">Enter a topic and click generate to start</p>
                    <div className="mt-4 bg-orange-900/30 rounded-lg p-4 border border-orange-500/30 max-w-md mx-auto">
                      <div className="flex items-center gap-2 mb-2">
                        <Monitor className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-200 text-sm font-medium">Auto Screen Share</span>
                      </div>
                      <p className="text-orange-300 text-xs">
                        When you generate a simulation, screen sharing will automatically start so the AI can see and help with your experiment!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Control Panel */}
        <div className="w-80 p-4 border-l border-orange-500/30 overflow-y-auto bg-black flex-shrink-0">
          <Card className="bg-gray-900/90 backdrop-blur-sm border-orange-500/30 h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-white flex items-center gap-2">
                <Cog className="w-5 h-5 text-orange-400" />
                Simulation Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 overflow-y-auto">
              {/* Topic Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-orange-200">
                  Enter Scientific Topic
                </label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., pendulum motion, wave interference..."
                  className="bg-gray-800/80 border-orange-500/50 text-white placeholder:text-orange-200/60 focus:border-orange-400"
                  disabled={isGenerating}
                />
              </div>

              {/* Quick Topic Suggestions */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-orange-200 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-orange-400" />
                  Quick Start Ideas
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {suggestedTopics.map((suggestedTopic) => (
                    <Button
                      key={suggestedTopic}
                      variant="outline"
                      size="sm"
                      onClick={() => setTopic(suggestedTopic)}
                      disabled={isGenerating}
                      className="bg-gray-800/60 border-orange-500/30 text-orange-200 hover:bg-orange-500/20 hover:border-orange-400 text-xs justify-start h-8"
                    >
                      {suggestedTopic}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateSimulation}
                disabled={isGenerating || !topic.trim()}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-black font-semibold"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Beaker className="w-4 h-4 mr-2" />
                    Generate Simulation
                  </>
                )}
              </Button>

              {/* Screen Share Info */}
              <div className="bg-orange-900/30 rounded-lg p-3 border border-orange-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-200 text-sm font-medium">Auto Screen Share</span>
                </div>
                <p className="text-orange-300 text-xs">
                  Screen sharing will automatically start when your simulation is ready, allowing the AI to see and help with your experiments in real-time.
                </p>
              </div>

              {/* Progress Steps */}
              {isGenerating && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-orange-200">
                      <span>{currentStep}</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="bg-gray-800 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-orange-400" />
                  </div>

                  <div className="space-y-2">
                    {/* Research Step */}
                    <div className={`flex items-center gap-3 p-2.5 rounded-lg border ${getStepBgColor('research')}`}>
                      {getStepIcon('research')}
                      <span className="font-medium text-white text-sm">Researching Topic</span>
                    </div>

                    {/* Analysis Step */}
                    <div className={`flex items-center gap-3 p-2.5 rounded-lg border ${getStepBgColor('analysis')}`}>
                      {getStepIcon('analysis')}
                      <span className="font-medium text-white text-sm">Analyzing Information</span>
                    </div>

                    {/* Simulation Step */}
                    <div className={`flex items-center gap-3 p-2.5 rounded-lg border ${getStepBgColor('simulation')}`}>
                      {getStepIcon('simulation')}
                      <span className="font-medium text-white text-sm">Building Interactive Simulation</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Request Assistance Button */}
              {simulation && (
                <div className="space-y-3">
                  <div className="text-center p-3 bg-gradient-to-r from-orange-900/40 to-orange-800/40 rounded-lg border border-orange-500/30">
                    <p className="text-orange-200 text-sm">
                      💡 Ready for guided exploration? Get help from Scientist Santa!
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => onRequestAssistance(topic, simulation)}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Guided Help from Scientist Santa
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
