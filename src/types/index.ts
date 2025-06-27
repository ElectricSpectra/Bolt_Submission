export enum ConversationStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  ERROR = 'error',
}

export type IConversation = {
  conversation_id: string;
  conversation_name: string;
  status: ConversationStatus;
  conversation_url: string;
  replica_id: string | null;
  persona_id: string | null;
  created_at: string;
};

export interface SimulationData {
  topic: string;
  research: string;
  concepts: string;
  htmlCode: string;
}

export type ProgressStep = 'research' | 'analysis' | 'simulation';
export type ProgressStatus = 'pending' | 'active' | 'completed' | 'error';