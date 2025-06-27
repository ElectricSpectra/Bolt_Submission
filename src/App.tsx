import { useEffect, useState } from 'react'
import { DailyProvider } from '@daily-co/daily-react'
import { WelcomeScreen } from '@/components/WelcomeScreen'
import { HairCheckScreen } from '@/components/HairCheckScreen'
import { CallScreen } from '@/components/CallScreen'
import { ExperimentLab } from '@/components/ExperimentLab'
import { createConversation, endConversation } from '@/api'
import { IConversation, SimulationData } from '@/types'
import { useToast } from "@/hooks/use-toast"

type Screen = 'welcome' | 'experimentLab' | 'hairCheck' | 'call';

function App() {
  const { toast } = useToast()
  const [screen, setScreen] = useState<Screen>('welcome')
  const [conversation, setConversation] = useState<IConversation | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentSimulation, setCurrentSimulation] = useState<SimulationData | null>(null)

  useEffect(() => {
    return () => {
      if (conversation) {
        void endConversation(conversation.conversation_id)
      }
    }
  }, [conversation])

  const handleStartVideoChat = async () => {
    try {
      setLoading(true)
      const conversation = await createConversation()
      setConversation(conversation)
      setScreen('hairCheck')
    } catch {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: 'Check console for details',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEnterLab = () => {
    setScreen('experimentLab')
  }

  const handleRequestAssistance = async (topic: string, simulation: SimulationData) => {
    setCurrentSimulation(simulation)
    
    // Show a message about what we're doing
    toast({
      title: "Connecting to Scientist Santa",
      description: `Preparing to discuss "${topic}" simulation with your lab assistant`,
    })
    
    // Start the video conversation
    await handleStartVideoChat()
  }

  const handleEnd = async () => {
    try {
      if (!conversation) return
      await endConversation(conversation.conversation_id)
    } catch (error) {
      console.error(error)
    } finally {
      setConversation(null)
      setCurrentSimulation(null)
      setScreen('welcome')
    }
  }

  const handleJoin = () => {
    setScreen('call')
  }

  const handleBackToLab = () => {
    setScreen('experimentLab')
  }

  const handleBackToHome = () => {
    setScreen('welcome');
    setCurrentSimulation(null);
    // Also cleanup any ongoing streams or conversations if needed
    if (conversation) {
      endConversation(conversation.conversation_id);
      setConversation(null);
    }
  };

  return (
    <main>
      <DailyProvider>
        {screen === 'welcome' && (
          <WelcomeScreen 
            onStart={handleStartVideoChat} 
            onEnterLab={handleEnterLab}
            loading={loading} 
          />
        )}
        
        {screen === 'experimentLab' && (
          <ExperimentLab 
            onRequestAssistance={handleRequestAssistance}
            onBackToHome={handleBackToHome}
          />
        )}
        
        {screen === 'hairCheck' && (
          <HairCheckScreen 
            handleEnd={handleEnd} 
            handleJoin={handleJoin}
            simulationContext={currentSimulation}
          />
        )}
        
        {screen === 'call' && conversation && (
          <CallScreen 
            conversation={conversation} 
            handleEnd={handleEnd}
            simulationContext={currentSimulation}
            onBackToLab={handleBackToLab}
          />
        )}
      </DailyProvider>
    </main>
  )
}

export default App