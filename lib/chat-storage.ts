// 채팅 기록을 sessionStorage에 저장하고 불러오는 유틸리티

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  showCategoryButtons?: boolean;
}

const STORAGE_KEY = "ttw_chat_messages";
const SESSION_ID_KEY = "ttw_chat_session_id";

export function saveChatMessages(messages: ChatMessage[], sessionId: string) {
  if (typeof window === "undefined") return;
  
  try {
    const messagesToSave = messages.map((msg) => ({
      ...msg,
      timestamp: msg.timestamp.toISOString(),
    }));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToSave));
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  } catch (error) {
    console.error("Failed to save chat messages:", error);
  }
}

export function loadChatMessages(): { messages: ChatMessage[]; sessionId: string | null } {
  if (typeof window === "undefined") {
    return { messages: [], sessionId: null };
  }
  
  try {
    const messagesData = sessionStorage.getItem(STORAGE_KEY);
    const sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    
    if (!messagesData) {
      return { messages: [], sessionId: sessionId || null };
    }
    
    const parsed = JSON.parse(messagesData);
    const messages: ChatMessage[] = parsed.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
    
    return { messages, sessionId: sessionId || null };
  } catch (error) {
    console.error("Failed to load chat messages:", error);
    return { messages: [], sessionId: null };
  }
}

export function clearChatMessages() {
  if (typeof window === "undefined") return;
  
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_ID_KEY);
  } catch (error) {
    console.error("Failed to clear chat messages:", error);
  }
}

