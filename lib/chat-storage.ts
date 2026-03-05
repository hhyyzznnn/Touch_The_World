// 로그인 사용자 전용 채팅 기록 저장 유틸리티
// 비로그인 사용자는 기록을 저장하지 않습니다.

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  showCategoryButtons?: boolean;
}

interface ChatStorageOptions {
  userId?: string | null;
  enabled?: boolean;
}

const STORAGE_KEY_PREFIX = "ttw_chat_messages";
const SESSION_ID_KEY_PREFIX = "ttw_chat_session_id";
const LEGACY_STORAGE_KEY = "ttw_chat_messages";
const LEGACY_SESSION_ID_KEY = "ttw_chat_session_id";

function getScopedKey(prefix: string, userId: string): string {
  return `${prefix}:${userId}`;
}

export function saveChatMessages(
  messages: ChatMessage[],
  sessionId: string,
  options?: ChatStorageOptions
) {
  if (typeof window === "undefined") return;
  if (options?.enabled === false) return;
  if (!options?.userId) return;
  
  try {
    const storageKey = getScopedKey(STORAGE_KEY_PREFIX, options.userId);
    const sessionKey = getScopedKey(SESSION_ID_KEY_PREFIX, options.userId);
    const messagesToSave = messages.map((msg) => ({
      ...msg,
      timestamp: msg.timestamp.toISOString(),
    }));
    localStorage.setItem(storageKey, JSON.stringify(messagesToSave));
    localStorage.setItem(sessionKey, sessionId);
  } catch (error) {
    console.error("Failed to save chat messages:", error);
  }
}

export function loadChatMessages(options?: ChatStorageOptions): { messages: ChatMessage[]; sessionId: string | null } {
  if (typeof window === "undefined") {
    return { messages: [], sessionId: null };
  }
  if (options?.enabled === false) {
    return { messages: [], sessionId: null };
  }
  if (!options?.userId) {
    return { messages: [], sessionId: null };
  }
  
  try {
    const storageKey = getScopedKey(STORAGE_KEY_PREFIX, options.userId);
    const sessionKey = getScopedKey(SESSION_ID_KEY_PREFIX, options.userId);
    const messagesData = localStorage.getItem(storageKey);
    const sessionId = localStorage.getItem(sessionKey);
    
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

export function clearChatMessages(options?: ChatStorageOptions) {
  if (typeof window === "undefined") return;
  if (!options?.userId) return;
  
  try {
    const storageKey = getScopedKey(STORAGE_KEY_PREFIX, options.userId);
    const sessionKey = getScopedKey(SESSION_ID_KEY_PREFIX, options.userId);
    localStorage.removeItem(storageKey);
    localStorage.removeItem(sessionKey);
  } catch (error) {
    console.error("Failed to clear chat messages:", error);
  }
}

export function clearLegacyAnonymousChatMessages() {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(LEGACY_STORAGE_KEY);
    sessionStorage.removeItem(LEGACY_SESSION_ID_KEY);
  } catch (error) {
    console.error("Failed to clear chat messages:", error);
  }
}
