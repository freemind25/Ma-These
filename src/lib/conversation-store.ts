/**
 * Shared in-memory conversation store with TTL eviction.
 * Eliminates duplication across ai-writing, thesis-assistant, directeur-chat routes.
 */

export interface ConversationEntry {
  messages: Array<{ role: string; content: string }>
  lastActivity: number
}

export class ConversationStore {
  private store = new Map<string, ConversationEntry>()
  private ttlMs: number

  constructor(ttlMs = 30 * 60 * 1000) {
    this.ttlMs = ttlMs
  }

  /** Remove entries older than TTL */
  evict(): void {
    const now = Date.now()
    for (const [key, val] of this.store) {
      if (now - val.lastActivity > this.ttlMs) {
        this.store.delete(key)
      }
    }
  }

  get(sid: string): ConversationEntry | undefined {
    return this.store.get(sid)
  }

  set(sid: string, messages: Array<{ role: string; content: string }>): void {
    this.store.set(sid, { messages, lastActivity: Date.now() })
  }

  delete(sid: string): void {
    this.store.delete(sid)
  }

  clear(): void {
    this.store.clear()
  }

  /** Get history or create new with system prompt. Evicts before access. */
  getOrCreate(sid: string, systemPrompt: string): Array<{ role: string; content: string }> {
    this.evict()
    const entry = this.store.get(sid)
    if (!entry) {
      const messages = [{ role: 'system' as const, content: systemPrompt }]
      this.set(sid, messages)
      return messages
    }
    return entry.messages
  }

  /** If first message (system prompt) differs, reset history. */
  resetIfNeeded(sid: string, systemPrompt: string): Array<{ role: string; content: string }> {
    const entry = this.store.get(sid)
    if (entry && entry.messages[0]?.content !== systemPrompt) {
      const messages = [{ role: 'system' as const, content: systemPrompt }]
      this.set(sid, messages)
      return messages
    }
    return entry ? entry.messages : [{ role: 'system' as const, content: systemPrompt }]
  }

  /** Add message, trim to maxMessages (plus system), persist, return new history. */
  addAndTrim(
    sid: string,
    role: string,
    content: string,
    maxMessages: number,
  ): Array<{ role: string; content: string }> {
    const entry = this.store.get(sid)
    let messages = entry ? [...entry.messages] : []
    messages.push({ role, content })

    // Trim: keep system prompt + last maxMessages
    if (messages.length > maxMessages + 1) {
      messages = [messages[0], ...messages.slice(-(maxMessages))]
    }

    this.set(sid, messages)
    return messages
  }

  /** Get or create, then reset if system prompt changed. Evicts first. */
  createOrReset(sid: string, systemPrompt: string): Array<{ role: string; content: string }> {
    this.evict()
    let history = this.getOrCreate(sid, systemPrompt)
    history = this.resetIfNeeded(sid, systemPrompt)
    return history
  }
}

/** Factory function for creating named conversation stores. */
export function createConversationStore(ttlMs?: number): ConversationStore {
  return new ConversationStore(ttlMs)
}
