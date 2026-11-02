export interface SimpleStorage {
  getItem: (name: string) => string | null | Promise<string | null>
  setItem: (name: string, value: string) => void | Promise<void>
  removeItem: (name: string) => void | Promise<void>
}

class MemoryStorage implements SimpleStorage {
  private map = new Map<string, string>()

  getItem(name: string): string | null {
    return this.map.get(name) ?? null
  }

  setItem(name: string, value: string): void {
    this.map.set(name, value)
  }

  removeItem(name: string): void {
    this.map.delete(name)
  }

  clear(): void {
    this.map.clear()
  }
}

export const inMemoryStorage = new MemoryStorage()

export function getSafeStorage(): SimpleStorage {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage) {
    return globalThis.localStorage
  }
  return inMemoryStorage
}
