import { useEffect, useRef } from 'react';
import { useDaily, useScreenShare } from '@daily-co/daily-react';
import { IConversation, SimulationData } from '@/types';
import { CameraSettings } from '../CameraSettings';
import { Call } from '../Call';
import { Whiteboard } from '../Whiteboard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Beaker, ArrowLeft, Sparkles, Monitor, FileText, Eye, Pencil } from 'lucide-react';

export const CallScreen = ({ 
  conversation, 
  handleEnd,
  simulationContext,
  onBackToLab
}: { 
  conversation: IConversation;
  handleEnd: () => void;
  simulationContext?: SimulationData | null;
  onBackToLab?: () => void;
}) => {
  const daily = useDaily();
  const { screens } = useScreenShare();
  
  // Store the current blob URL for cleanup
  const currentBlobUrl = useRef<string | null>(null);

  const isScreenSharing = screens.length > 0;

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

  useEffect(() => {
    if (conversation && daily) {
      const { conversation_url } = conversation;
      daily.join({
        url: conversation_url,
      });
    }
  }, [daily, conversation]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (currentBlobUrl.current) {
        URL.revokeObjectURL(currentBlobUrl.current);
      }
    };
  }, []);

  const handleLeave = async () => {
    await daily?.leave();
    handleEnd();
  }

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-orange-500/30 bg-black flex-shrink-0">
        <div className="flex items-center gap-3">
          <Beaker className="w-6 h-6 text-orange-400" />
          <h1 className="text-xl font-bold text-white">
            Lab Session with Scientist Santa
          </h1>
          <Sparkles className="w-6 h-6 text-orange-400" />
          {isScreenSharing && (
            <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/50">
              <Eye className="w-4 h-4 text-orange-400" />
              <span className="text-orange-200 text-sm font-medium">AI can see your screen</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {onBackToLab && (
            <Button
              onClick={onBackToLab}
              variant="outline"
              size="sm"
              className="bg-gray-800/80 border-orange-500/50 text-orange-200 hover:bg-orange-500/20 hover:border-orange-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lab
            </Button>
          )}
          
          <Button
            onClick={handleLeave}
            variant="destructive"
            size="sm"
            className="bg-red-600 hover:bg-red-700"
          >
            End Session
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Side - Simulation OR Whiteboard (not both) */}
        <div className="flex-1 p-4 overflow-hidden min-w-0">
          {simulationContext ? (
            /* When there's a simulation - show only the simulation */
            <Card className="h-full bg-gray-900/90 backdrop-blur-sm border-orange-500/30 flex flex-col overflow-hidden">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Beaker className="w-5 h-5 text-orange-400" />
                  {simulationContext.topic}
                  {isScreenSharing && (
                    <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded text-sm border border-green-500/50">
                      <Eye className="w-3 h-3 text-green-400" />
                      <span className="text-green-200">Visible to AI</span>
                    </div>
                  )}
                </CardTitle>
                <p className="text-orange-200 text-sm">
                  {simulationContext.concepts}
                </p>
              </CardHeader>
              <CardContent className="flex-1 p-4 overflow-hidden">
                <div className="bg-white rounded-lg h-full overflow-hidden border-2 border-orange-500/20">
                  <iframe
                    src={createBlobUrl(simulationContext.htmlCode)}
                    className="w-full h-full border-0"
                    title={`${simulationContext.topic} Simulation`}
                    style={{ minHeight: '400px' }}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            /* When no simulation - show whiteboard for general chat */
            <div className="h-full flex flex-col gap-4">
              <div className="flex-1">
                <Whiteboard />
              </div>
            </div>
          )}
        </div>

        {/* Right Side Panel - Controls & Video */}
        <div className="w-80 p-4 flex flex-col gap-4 border-l border-orange-500/30 overflow-y-auto bg-black flex-shrink-0">
          {/* Scientist Santa Video */}
          <Card className="bg-gray-900/90 backdrop-blur-sm border-orange-500/30 flex-shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Sparkles className="w-4 h-4 text-orange-400" />
                Scientist Santa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="aspect-video bg-black/60 rounded-lg overflow-hidden border border-orange-500/20">
                <Call />
              </div>
            </CardContent>
          </Card>

          {/* Screen Sharing Guide */}
          <Card className="bg-gray-900/90 backdrop-blur-sm border-orange-500/30 flex-shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Monitor className="w-4 h-4 text-orange-400" />
                Screen Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isScreenSharing ? (
                <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-green-400" />
                    <span className="text-green-200 text-sm font-medium">Screen Sharing Active</span>
                  </div>
                  <p className="text-green-300 text-xs">
                    {simulationContext 
                      ? "The AI can see your simulation in real-time."
                      : "The AI can see your whiteboard and screen content."
                    }
                  </p>
                </div>
              ) : (
                <div className="bg-orange-900/30 rounded-lg p-3 border border-orange-500/30">
                  <p className="text-orange-200 text-sm mb-2">
                    Click the <Monitor className="w-3 h-3 inline mx-1" /> button in the video controls to share your screen.
                  </p>
                  <p className="text-orange-300 text-xs">
                    {simulationContext 
                      ? "Perfect for getting help with your simulation."
                      : "Perfect for getting help with your whiteboard drawings and notes."
                    }
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white">
                  What the AI can see:
                </h4>
                <div className="space-y-1 text-xs text-orange-200">
                  {simulationContext ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Beaker className="w-3 h-3 text-orange-400" />
                        <span>Interactive simulation: {simulationContext.topic}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-3 h-3 text-orange-400" />
                        <span>Any documents you open</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Monitor className="w-3 h-3 text-orange-400" />
                        <span>Web pages & articles</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Pencil className="w-3 h-3 text-orange-400" />
                        <span>Whiteboard drawings & notes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-3 h-3 text-orange-400" />
                        <span>Any documents you open</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Monitor className="w-3 h-3 text-orange-400" />
                        <span>Web pages & articles</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Context-specific guidance */}
          {simulationContext ? (
            /* Simulation-specific help panel */
            <Card className="bg-gray-900/90 backdrop-blur-sm border-orange-500/30 flex-1 min-h-0">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-white text-base">
                  Simulation Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 overflow-y-auto">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white">
                    Ask Scientist Santa:
                  </h4>
                  <div className="space-y-2 text-xs text-orange-200">
                    <div className="bg-orange-900/30 rounded p-2 cursor-pointer hover:bg-orange-900/50 transition-colors border border-orange-500/20">
                      🔧 "How do I adjust these parameters?"
                    </div>
                    <div className="bg-orange-900/30 rounded p-2 cursor-pointer hover:bg-orange-900/50 transition-colors border border-orange-500/20">
                      📊 "What should I observe in the results?"
                    </div>
                    <div className="bg-orange-900/30 rounded p-2 cursor-pointer hover:bg-orange-900/50 transition-colors border border-orange-500/20">
                      🎯 "Guide me through this experiment step by step"
                    </div>
                    <div className="bg-orange-900/30 rounded p-2 cursor-pointer hover:bg-orange-900/50 transition-colors border border-orange-500/20">
                      💡 "Explain the physics behind this simulation"
                    </div>
                  </div>
                </div>

                <div className="text-center p-3 bg-gradient-to-r from-orange-900/40 to-red-900/40 rounded-lg border border-orange-500/30">
                  <Sparkles className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                  <p className="text-orange-200 text-xs">
                    Scientist Santa can see your simulation through screen share and help you understand the experiment!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* General whiteboard guidance */
            <Card className="bg-gray-900/90 backdrop-blur-sm border-orange-500/30 flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Pencil className="w-4 h-4 text-orange-400" />
                  Whiteboard Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-orange-900/30 rounded-lg p-3 border border-orange-500/30">
                  <p className="text-orange-200 text-sm mb-2">
                    Use the whiteboard to:
                  </p>
                  <div className="space-y-1 text-xs text-orange-300">
                    <div>• Draw diagrams and explanations</div>
                    <div>• Write questions and notes</div>
                    <div>• Annotate concepts</div>
                    <div>• Create visual aids</div>
                  </div>
                </div>

                <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-green-400" />
                    <span className="text-green-200 text-sm font-medium">AI Visibility</span>
                  </div>
                  <p className="text-green-300 text-xs">
                    When screen sharing, the AI can see your whiteboard and provide feedback on your drawings and notes!
                  </p>
                </div>

                <div className="text-center p-3 bg-gradient-to-r from-orange-900/40 to-red-900/40 rounded-lg border border-orange-500/30">
                  <Sparkles className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                  <p className="text-orange-200 text-xs">
                    Scientist Santa is ready to assist with any science questions!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};