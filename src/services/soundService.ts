// 音效系统
// 使用Web Audio API生成音效

class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private enabled: boolean = true;

  constructor() {
    // 延迟初始化AudioContext，直到用户交互
    this.enabled = localStorage.getItem('sound-enabled') !== 'false';
  }

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // 生成简单音效
  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine'): AudioBuffer {
    this.initAudioContext();
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });

    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // 添加包络
      const envelope = t < 0.1 ? t / 0.1 : Math.exp(-(t - 0.1) * 5);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }

    return buffer;
  }

  // 播放音效
  play(name: string) {
    if (!this.enabled) return;
    this.initAudioContext();
    if (!this.audioContext) return;

    const soundEffects: Record<string, () => AudioBuffer> = {
      'seed-hover': () => this.createTone(880, 0.1, 'sine'),
      'seed-collect': () => this.createTone(1760, 0.3, 'sine'),
      'button-click': () => this.createTone(440, 0.05, 'square'),
      'explore-success': () => this.createTone(523.25, 0.4, 'sine'), // C5
      'explore-fail': () => this.createTone(220, 0.3, 'sawtooth'),
      'modal-open': () => this.createTone(330, 0.15, 'sine'),
      'modal-close': () => this.createTone(294, 0.15, 'sine'),
      'achievement': () => this.createTone(784, 0.5, 'sine'), // G5
    };

    const generator = soundEffects[name];
    if (!generator) return;

    const buffer = generator();
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start();
  }

  // 播放背景音乐（简化版）
  playAmbient() {
    if (!this.enabled) return;
    // 实际项目中可以使用更复杂的音频文件
    // 这里仅作为占位
  }

  // 设置音效开关
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('sound-enabled', String(enabled));
  }

  isEnabled() {
    return this.enabled;
  }
}

export const soundManager = new SoundManager();

// React Hook
import { useCallback } from 'react';

export function useSound() {
  const play = useCallback((name: string) => {
    soundManager.play(name);
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    soundManager.setEnabled(enabled);
  }, []);

  return {
    play,
    setEnabled,
    isEnabled: soundManager.isEnabled(),
  };
}
