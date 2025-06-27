import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Beaker, Video, Sparkles, FlaskConical, ExternalLink } from 'lucide-react';

export const WelcomeScreen = ({ 
  onStart, 
  onEnterLab, 
  loading 
}: { 
  onStart: () => void;
  onEnterLab: () => void;
  loading: boolean;
}) => {
  return (
    <div className="min-h-screen w-screen bg-black flex items-center justify-center p-6 relative">
      {/* Tavus Badge - Top Left Corner */}
      <a
        href="https://www.tavus.io/"
        target="_blank"
        rel="noopener noreferrer"
        className="group absolute top-6 left-6 z-10"
        title="Powered by Tavus"
      >
        <div className="bg-gray-900/80 backdrop-blur-sm border border-orange-500/30 rounded-lg p-3 hover:bg-gray-800/90 hover:border-orange-400/50 transition-all duration-300 group-hover:scale-105">
          <img 
            src="/assets/tavus.svg" 
            alt="Tavus" 
            className="h-12 w-auto opacity-90 group-hover:opacity-100 transition-opacity"
          />
          <ExternalLink className="w-3 h-3 text-orange-400 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </a>

      {/* Bolt Badge - Top Right Corner (2x size) */}
      <a
        href="https://bolt.new/"
        target="_blank"
        rel="noopener noreferrer"
        className="group absolute top-6 right-6 z-10"
        title="Built with Bolt"
      >
        <div className="bg-gray-900/80 backdrop-blur-sm border border-orange-500/30 rounded-xl p-6 hover:bg-gray-800/90 hover:border-orange-400/50 transition-all duration-300 group-hover:scale-105">
          <img 
            src="/assets/bolt.png" 
            alt="Bolt" 
            className="h-24 w-auto opacity-90 group-hover:opacity-100 transition-opacity"
          />
          <ExternalLink className="w-4 h-4 text-orange-400 absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </a>

      <div className="max-w-6xl mx-auto text-center">
        {/* Header - Now without partner badges */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <FlaskConical className="w-16 h-16 text-orange-400" />
            <h1 className="text-5xl lg:text-6xl font-bold text-white whitespace-nowrap">
              Scientist Santa's Lab
            </h1>
            <Sparkles className="w-16 h-16 text-orange-400" />
          </div>
          <p className="text-3xl text-orange-200 mb-8">
            Welcome to the ultimate interactive science experience!
          </p>
          <p className="text-xl text-orange-300 max-w-3xl mx-auto">
            Generate AI-powered scientific simulations and get personalized assistance 
            from Scientist Santa through our conversational video interface.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Experiment Lab Card */}
          <Card className="bg-gray-900/90 backdrop-blur-sm border-orange-500/30 hover:bg-gray-800/90 hover:border-orange-400/50 transition-all duration-300 cursor-pointer group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-center mb-4">
                <Beaker className="w-16 h-16 text-orange-400 group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-white text-3xl">
                Experiment Lab
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-orange-200 text-lg">
                Generate interactive scientific simulations using AI. 
                Explore physics, chemistry, and more with dynamic visualizations.
              </p>
              <ul className="text-orange-300 space-y-2 text-left">
                <li>• AI-powered research and simulation generation</li>
                <li>• Interactive controls and real-time parameters</li>
                <li>• Educational visualizations</li>
                <li>• Mobile-responsive design</li>
              </ul>
              <Button
                onClick={onEnterLab}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-black font-bold py-4 text-lg"
              >
                <Beaker className="w-6 h-6 mr-2" />
                Enter Experiment Lab
              </Button>
            </CardContent>
          </Card>

          {/* Video Assistant Card */}
          <Card className="bg-gray-900/90 backdrop-blur-sm border-orange-500/30 hover:bg-gray-800/90 hover:border-orange-400/50 transition-all duration-300 cursor-pointer group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-center mb-4">
                <Video className="w-16 h-16 text-orange-400 group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-white text-3xl">
                Video Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-orange-200 text-lg">
                Talk directly with Scientist Santa through our conversational 
                video interface for personalized science assistance.
              </p>
              <ul className="text-orange-300 space-y-2 text-left">
                <li>• Real-time video conversation</li>
                <li>• Personalized science explanations</li>
                <li>• Interactive Q&A sessions</li>
                <li>• Professional lab assistant experience</li>
              </ul>
              <Button
                onClick={onStart}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 text-lg"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Video className="w-6 h-6 mr-2" />
                    Start Video Chat
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Why Choose Scientist Santa's Lab?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-gray-900/60 rounded-lg p-8 border border-orange-500/30">
              <Sparkles className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">AI-Powered</h3>
              <p className="text-orange-200">
                Advanced AI generates custom simulations and provides intelligent assistance
              </p>
            </div>
            <div className="bg-gray-900/60 rounded-lg p-8 border border-orange-500/30">
              <FlaskConical className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Interactive</h3>
              <p className="text-orange-200">
                Hands-on simulations with real-time parameter control and visualization
              </p>
            </div>
            <div className="bg-gray-900/60 rounded-lg p-8 border border-orange-500/30">
              <Video className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Personal</h3>
              <p className="text-orange-200">
                One-on-one video conversations with your dedicated lab assistant
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};