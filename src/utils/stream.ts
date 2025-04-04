import { ClaudeStreamChunk, ClaudeStreamError, ClaudeStreamEnd } from '@/types/api';

// Hilfsfunktion zum Parsen von SSE-Nachrichten
export function parseSSE(data: string): ClaudeStreamChunk | ClaudeStreamError | ClaudeStreamEnd | null {
  try {
    // Entferne "data: " Präfix und parse JSON
    const jsonStr = data.replace(/^data: /, '').trim();
    if (!jsonStr) return null;
    
    const parsed = JSON.parse(jsonStr);
    return parsed;
  } catch (error) {
    console.error('Fehler beim Parsen der SSE-Nachricht:', error);
    return null;
  }
}

// Hilfsfunktion zum Validieren von Chunks
export function isValidChunk(chunk: any): chunk is ClaudeStreamChunk {
  return (
    chunk &&
    chunk.type === 'content_block_delta' &&
    chunk.delta &&
    typeof chunk.delta.text === 'string'
  );
}

// Hilfsfunktion zum Verarbeiten des Streams
export async function processStream(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  let result = '';
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // Konvertiere Uint8Array zu String
      const chunk = new TextDecoder().decode(value);
      
      // Verarbeite jede Zeile im Chunk
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        
        const parsed = parseSSE(line);
        if (!parsed) continue;
        
        if (isValidChunk(parsed)) {
          result += parsed.delta.text;
        } else if (parsed.type === 'error') {
          throw new Error(parsed.error.message);
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Fehler bei der Stream-Verarbeitung:', error);
    throw error;
  } finally {
    reader.releaseLock();
  }
} 