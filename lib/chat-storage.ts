// 채팅 기록 저장 유틸리티
// 로그인 사용자는 localStorage, 비로그인 사용자는 sessionStorage를 사용합니다.

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
  allowAnonymous?: boolean;
}

interface PersistedChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  showCategoryButtons?: boolean;
}

const STORAGE_KEY_PREFIX = "ttw_chat_messages";
const SESSION_ID_KEY_PREFIX = "ttw_chat_session_id";
const LEGACY_STORAGE_KEY = "ttw_chat_messages";
const LEGACY_SESSION_ID_KEY = "ttw_chat_session_id";
const ANON_STORAGE_KEY = "ttw_chat_messages:anon";
const ANON_SESSION_ID_KEY = "ttw_chat_session_id:anon";

function getScopedKey(prefix: string, userId: string): string {
  return `${prefix}:${userId}`;
}

function isPersistedChatMessage(value: unknown): value is PersistedChatMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    (candidate.role === "user" || candidate.role === "assistant") &&
    typeof candidate.content === "string" &&
    typeof candidate.timestamp === "string"
  );
}

export function saveChatMessages(
  messages: ChatMessage[],
  sessionId: string,
  options?: ChatStorageOptions
) {
  if (typeof window === "undefined") return;
  if (options?.enabled === false) return;
  
  try {
    const isAnonymous = !options?.userId && options?.allowAnonymous;
    if (!options?.userId && !isAnonymous) return;

    const storageKey = options?.userId
      ? getScopedKey(STORAGE_KEY_PREFIX, options.userId)
      : ANON_STORAGE_KEY;
    const sessionKey = options?.userId
      ? getScopedKey(SESSION_ID_KEY_PREFIX, options.userId)
      : ANON_SESSION_ID_KEY;
    const storage = isAnonymous ? sessionStorage : localStorage;
    const messagesToSave = messages.map((msg) => ({
      ...msg,
      timestamp: msg.timestamp.toISOString(),
    }));
    storage.setItem(storageKey, JSON.stringify(messagesToSave));
    storage.setItem(sessionKey, sessionId);
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
  const isAnonymous = !options?.userId && options?.allowAnonymous;
  if (!options?.userId && !isAnonymous) {
    return { messages: [], sessionId: null };
  }
  
  try {
    const storageKey = options?.userId
      ? getScopedKey(STORAGE_KEY_PREFIX, options.userId)
      : ANON_STORAGE_KEY;
    const sessionKey = options?.userId
      ? getScopedKey(SESSION_ID_KEY_PREFIX, options.userId)
      : ANON_SESSION_ID_KEY;
    const storage = isAnonymous ? sessionStorage : localStorage;
    const messagesData = storage.getItem(storageKey);
    const sessionId = storage.getItem(sessionKey);
    
    if (!messagesData) {
      return { messages: [], sessionId: sessionId || null };
    }
    
    const parsed = JSON.parse(messagesData);
    if (!Array.isArray(parsed)) {
      return { messages: [], sessionId: sessionId || null };
    }

    const messages: ChatMessage[] = parsed
      .filter(isPersistedChatMessage)
      .map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        ...(msg.showCategoryButtons !== undefined && {
          showCategoryButtons: msg.showCategoryButtons,
        }),
      }));
    
    return { messages, sessionId: sessionId || null };
  } catch (error) {
    console.error("Failed to load chat messages:", error);
    return { messages: [], sessionId: null };
  }
}

export function clearChatMessages(options?: ChatStorageOptions) {
  if (typeof window === "undefined") return;
  
  try {
    const isAnonymous = !options?.userId && options?.allowAnonymous;
    if (!options?.userId && !isAnonymous) return;

    const storageKey = options?.userId
      ? getScopedKey(STORAGE_KEY_PREFIX, options.userId)
      : ANON_STORAGE_KEY;
    const sessionKey = options?.userId
      ? getScopedKey(SESSION_ID_KEY_PREFIX, options.userId)
      : ANON_SESSION_ID_KEY;
    const storage = isAnonymous ? sessionStorage : localStorage;
    storage.removeItem(storageKey);
    storage.removeItem(sessionKey);
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
