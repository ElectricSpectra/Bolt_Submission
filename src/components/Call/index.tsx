import { useState } from 'react';
import { DailyAudio, useParticipantIds, useLocalSessionId, useScreenShare, useDaily } from '@daily-co/daily-react';
import { Minimize, Maximize, Volume2, VolumeX, Monitor, MonitorOff, Camera, CameraOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Video } from '../Video';
import { Button } from '../ui/button';

export const Call = () => {
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' });
  const localSessionId = useLocalSessionId();
  const { screens, startScreenShare, stopScreenShare } = useScreenShare();
  const daily = useDaily();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const isScreenSharing = screens.length > 0;
  const localScreenId = screens.find(screen => screen.session_id === localSessionId)?.session_id;

  const handleToggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  const handleToggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const handleToggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await stopScreenShare();
      } else {
        await startScreenShare();
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  const handleToggleCamera = () => {
    if (daily) {
      const currentVideoState = daily.localVideo();
      daily.setLocalVideo(!currentVideoState);
    }
  };

  return (
    <>
      <div className={cn("relative w-full h-full", {
        'fixed inset-4 z-50 bg-black/90 backdrop-blur-sm rounded-lg': isExpanded,
      })}>
        {/* Controls Overlay */}
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <Button 
            variant='outline' 
            onClick={handleToggleMute} 
            className='bg-black/50 border-white/20 text-white hover:bg-black/70' 
            size='sm'
          >
            {isMuted ? <VolumeX className='size-3' /> : <Volume2 className='size-3' />}
          </Button>
          
          <Button 
            variant='outline' 
            onClick={handleToggleCamera} 
            className='bg-black/50 border-white/20 text-white hover:bg-black/70' 
            size='sm'
          >
            <Camera className='size-3' />
          </Button>

          <Button 
            variant='outline' 
            onClick={handleToggleScreenShare} 
            className={cn('bg-black/50 border-white/20 text-white hover:bg-black/70', {
              'bg-orange-500/50 border-orange-400/50': isScreenSharing
            })} 
            size='sm'
            title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
          >
            {isScreenSharing ? <MonitorOff className='size-3' /> : <Monitor className='size-3' />}
          </Button>
          
          <Button 
            variant='outline' 
            onClick={handleToggleExpand} 
            className='bg-black/50 border-white/20 text-white hover:bg-black/70' 
            size='sm'
          >
            {isExpanded ? <Minimize className='size-3' /> : <Maximize className='size-3' />}
          </Button>
        </div>

        {/* Screen Share Indicator */}
        {isScreenSharing && (
          <div className="absolute top-2 left-2 z-10 bg-orange-500/80 text-white px-2 py-1 rounded text-xs font-medium">
            <Monitor className="w-3 h-3 inline mr-1" />
            Screen Sharing
          </div>
        )}

        {/* Video Content */}
        <div className="w-full h-full relative">
          {remoteParticipantIds.length > 0 ? (
            <Video
              id={remoteParticipantIds[0]}
              className={cn("w-full h-full object-cover", {
                'rounded-lg': !isExpanded,
              })}
            />
          ) : (
            <div className='flex items-center justify-center w-full h-full bg-slate-800 rounded-lg'>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">🎅</span>
                </div>
                <p className='text-sm text-white'>Scientist Santa is joining...</p>
                {isScreenSharing && (
                  <p className='text-xs text-orange-300 mt-1'>Screen sharing active - AI can see your screen</p>
                )}
              </div>
            </div>
          )}
          
          {/* Local Video/Screen Share Preview */}
          {localSessionId && (
            <div className={cn('absolute bottom-2 right-2 border-2 border-white/30 rounded', {
              'max-h-20 max-w-20': !isExpanded,
              'max-h-32 max-w-32': isExpanded,
            })}>
              {localScreenId ? (
                <Video
                  id={localScreenId}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <Video
                  id={localSessionId}
                  className="w-full h-full object-cover rounded"
                />
              )}
            </div>
          )}
        </div>

        {/* Expanded Mode Close Area */}
        {isExpanded && (
          <div 
            className="absolute inset-0 -z-10" 
            onClick={handleToggleExpand}
          />
        )}
      </div>
      
      <DailyAudio />
    </>
  );
};