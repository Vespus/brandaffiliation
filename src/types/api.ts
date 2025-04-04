// Claude API Response Types
export interface ClaudeStreamChunk {
  type: 'content_block_delta';
  delta: {
    text: string;
  };
}

export interface ClaudeStreamError {
  type: 'error';
  error: {
    message: string;
    code: string;
  };
}

export interface ClaudeStreamEnd {
  type: 'message_stop';
}

// API Response Types
export interface TextComparisonResponse {
  result: string;
  error?: string;
}

// Stream Status Types
export interface StreamStatus {
  isComplete: boolean;
  error: string | null;
  progress: number;
} 