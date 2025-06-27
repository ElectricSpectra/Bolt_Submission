import { useEffect } from 'react';
import { useDaily, useScreenShare } from '@daily-co/daily-react';
import { useLocalSessionId } from '@daily-co/daily-react';
import { CameraSettings } from '../CameraSettings';
import { Video } from '../Video';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Beaker, Sparkles, Monitor, FileText, Eye } from 'lucide-react';
import { SimulationData } from '@/types';

export const HairCheckScreen = ({ 
  handleJoin, 
  handleEnd,
  simulationContext 
}: {
  handleJoin: () => void;
  handleEnd: () => void;
  simulationContext?: SimulationData | null;
}) => {
  const localSessionId = useLocalSessionId();
  const daily = useDaily();
  const { screens } = useScreenShare();

  const isScreenSharing = screens.length > 0;

  useEffect(() => {
    if (daily) {
      daily?.startCamera({ startVideoOff: false, startAudioOff: false });
    }
  }, [daily, localSessionId]);

  return (
    <div className="min-h-screen w-screen bg-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Beaker className="w-10 h-10 text-orange-400" />
            <h1 className="text-4xl font-bold text-white">
              Preparing Lab Session
            </h1>
            <Sparkles className="w-10 h-10 text-orange-400" />
          </div>
          <p className="text-xl text-orange-200">
            Check your camera and microphone before meeting Scientist Santa
          </p>
          {isScreenSharing && (
            <div className="flex items-center justify-center gap-2 mt-3 bg-orange-500/20 px-4 py-2 rounded-full border border-orange-500/50 inline-flex">
              <Eye className="w-4 h-4 text-orange-400" />
              <span className="text-orange-200 text-sm font-medium">Screen sharing is active</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Preview */}
          <Card className="bg-gray-900/90 backdrop-blur-sm border-orange-500/30">
            <CardHeader>
              <CardTitle className="text-white">Camera Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Video id={localSessionId} className='max-h-[50vh] w-full rounded-lg border-2 border-orange-500/20' />
            </CardContent>
          </Card>

          {/* Context Information */}
          <Card className="bg-gray-900/90 backdrop-blur-sm border-orange-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-400" />
                Session Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {simulationContext && (
                <div className="bg-black/60 rounded-lg p-4 border border-orange-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Beaker className="w-4 h-4 text-orange-400" />
                    <h3 className="text-lg font-semibold text-white">
                      {simulationContext.topic}
                    </h3>
                  </div>
                  <p className="text-orange-200 text-sm leading-relaxed">
                    {simulationContext.concepts}
                  </p>
                </div>
              )}

              {/* Screen Sharing Feature */}
              <div className="bg-orange-900/30 rounded-lg p-4 border border-orange-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Monitor className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-semibold text-white">Screen Sharing Available</h3>
                </div>
                <p className="text-orange-200 text-sm mb-3">
                  Share your screen so Scientist Santa can see and help with:
                </p>
                <div className="space-y-2 text-sm text-orange-300">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-400" />
                    <span>PDF documents and research papers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-orange-400" />
                    <span>Web pages and online articles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Beaker className="w-4 h-4 text-orange-400" />
                    <span>Scientific simulations and experiments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span>Any educational content on your screen</span>
                  </div>
                </div>
              </div>

              <div className="text-center p-4 bg-gradient-to-r from-orange-900/40 to-red-900/40 rounded-lg border border-orange-500/30">
                <Sparkles className="w-10 h-10 text-orange-400 mx-auto mb-2" />
                <p className="text-orange-200 text-sm">
                  Scientist Santa is ready to provide real-time explanations and guidance for anything you share!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Camera Settings */}
        <div className="mt-8">
          <CameraSettings
            actionLabel='Join Lab Session'
            onAction={handleJoin}
            cancelLabel='Back to Welcome'
            onCancel={handleEnd}
          />
        </div>
      </div>
    </div>
  );
};