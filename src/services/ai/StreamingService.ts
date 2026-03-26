/**
 * Streaming Service
 * 药灵山谷v3.0 AI流式响应服务
 */

export type StreamChunkHandler = (chunk: string) => void;
export type StreamCompleteHandler = (fullText: string) => void;
export type StreamErrorHandler = (error: Error) => void;

export interface StreamingConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export class StreamingService {
  private config: StreamingConfig;
  private abortController: AbortController | null = null;

  constructor(config?: Partial<StreamingConfig>) {
    this.config = {
      apiKey: config?.apiKey || import.meta.env.VITE_GLM_API_KEY || '',
      baseURL: config?.baseURL || 'https://api.glm.cn/v1',
      model: config?.model || 'glm-4',
      maxTokens: config?.maxTokens || 500,
      temperature: config?.temperature || 0.7,
    };
  }

  /**
   * 流式调用AI服务
   * @param systemPrompt 系统提示词
   * @param userPrompt 用户提示词
   * @param onChunk 每次收到内容时的回调
   * @param onComplete 完成时的回调
   * @param onError 错误时的回调
   */
  async stream(
    systemPrompt: string,
    userPrompt: string,
    onChunk: StreamChunkHandler,
    onComplete?: StreamCompleteHandler,
    onError?: StreamErrorHandler
  ): Promise<void> {
    this.abortController = new AbortController();

    try {
      const response = await fetch(`${this.config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          stream: true,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let fullText = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                fullText += content;
                onChunk(content);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      if (onComplete) {
        onComplete(fullText);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Stream aborted');
        return;
      }
      console.error('Streaming error:', error);
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      this.abortController = null;
    }
  }

  /**
   * 中止当前流
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<StreamingConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// 默认实例
export const streamingService = new StreamingService();

// React Hook
import { useState, useCallback, useRef } from 'react';

export interface UseStreamingOptions {
  onChunk?: StreamChunkHandler;
  onComplete?: StreamCompleteHandler;
  onError?: StreamErrorHandler;
}

export function useStreaming(options?: UseStreamingOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const serviceRef = useRef(new StreamingService());

  const startStream = useCallback(
    async (systemPrompt: string, userPrompt: string) => {
      setIsStreaming(true);
      setStreamedText('');

      await serviceRef.current.stream(
        systemPrompt,
        userPrompt,
        (chunk) => {
          setStreamedText((prev) => prev + chunk);
          if (options?.onChunk) {
            options.onChunk(chunk);
          }
        },
        (fullText) => {
          setIsStreaming(false);
          if (options?.onComplete) {
            options.onComplete(fullText);
          }
        },
        (error) => {
          setIsStreaming(false);
          if (options?.onError) {
            options.onError(error);
          }
        }
      );
    },
    [options]
  );

  const abortStream = useCallback(() => {
    serviceRef.current.abort();
    setIsStreaming(false);
  }, []);

  return {
    isStreaming,
    streamedText,
    startStream,
    abortStream,
  };
}
