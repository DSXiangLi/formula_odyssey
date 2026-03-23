# 音效设计

## 1. 音效原则

### 1.1 设计目标

- **氛围营造** - 五行场景沉浸感
- **反馈清晰** - 操作有响应
- **不干扰学习** - 背景音乐舒缓
- **中医韵味** - 传统乐器为主

### 1.2 音量规范

```
背景音乐：30-40%（可调节）
环境音效：20-30%
UI音效：50-60%
战斗音效：60-70%
重要提示：80%
```

## 2. 背景音乐

### 2.1 五行主题音乐

**青木林（木行）**
```
风格：竹笛清音，古筝伴奏
情绪：清新、生机、宁静
乐器：竹笛、古筝、古琴、鸟鸣
节奏：舒缓，60-80 BPM
循环：无缝循环
```

**赤焰峰（火行）**
```
风格：战鼓激昂，琵琶热情
情绪：热烈、奔放、激情
乐器：战鼓、琵琶、二胡
节奏：中快，100-120 BPM
循环：无缝循环
```

**黄土丘（土行）**
```
风格：埙声厚重，笙箫平和
情绪：沉稳、厚重、丰收
乐器：埙、笙、箫、古筝
节奏：慢速，50-70 BPM
循环：无缝循环
```

**白金原（金行）**
```
风格：钟磬清越，古琴肃静
情绪：肃杀、清冽、庄严
乐器：编钟、编磬、古琴
节奏：缓慢，40-60 BPM
循环：无缝循环
```

**黑水潭（水行）**
```
风格：古琴低沉，流水潺潺
情绪：幽深、静谧、神秘
乐器：古琴、箫、水声采样
节奏：极慢，30-50 BPM
循环：无缝循环
```

### 2.2 场景音乐切换

```typescript
// 音乐切换管理
class MusicManager {
  private currentMusic: HTMLAudioElement | null = null;
  private fadeDuration: number = 2000; // 2秒淡入淡出

  async switchMusic(newMusic: string): Promise<void> {
    // 1. 淡出当前音乐
    if (this.currentMusic) {
      await this.fadeOut(this.currentMusic);
    }

    // 2. 加载新音乐
    const audio = new Audio(newMusic);
    audio.loop = true;

    // 3. 淡入新音乐
    await this.fadeIn(audio);

    this.currentMusic = audio;
  }

  private fadeOut(audio: HTMLAudioElement): Promise<void> {
    return new Promise(resolve => {
      const startVolume = audio.volume;
      const step = startVolume / (this.fadeDuration / 50);

      const fade = setInterval(() => {
        audio.volume -= step;
        if (audio.volume <= 0) {
          clearInterval(fade);
          audio.pause();
          resolve();
        }
      }, 50);
    });
  }

  private fadeIn(audio: HTMLAudioElement): Promise<void> {
    return new Promise(resolve => {
      audio.volume = 0;
      audio.play();

      const targetVolume = 0.4; // 40%
      const step = targetVolume / (this.fadeDuration / 50);

      const fade = setInterval(() => {
        audio.volume += step;
        if (audio.volume >= targetVolume) {
          clearInterval(fade);
          resolve();
        }
      }, 50);
    });
  }
}
```

## 3. UI音效

### 3.1 按钮音效

| 操作 | 音效 | 描述 |
|------|------|------|
| 悬停 | hover.mp3 | 轻微滑音，100ms |
| 点击 | click.mp3 | 清脆点击，80ms |
| 确认 | confirm.mp3 | 成功确认，150ms |
| 取消 | cancel.mp3 | 低沉取消，100ms |
| 禁用 | disabled.mp3 | 沉闷拒绝，80ms |

### 3.2 状态音效

| 状态 | 音效 | 描述 |
|------|------|------|
| 成功 | success.mp3 | 成功音效，上升音阶，200ms |
| 失败 | fail.mp3 | 失败音效，下降音阶，200ms |
| 警告 | warning.mp3 | 警示音，150ms |
| 提示 | notification.mp3 | 提示音，100ms |
| 获得 | acquire.mp3 | 获得物品，清脆，200ms |

### 3.3 输入音效

**打字音效**
```
每次按键：轻微"嗒"声
连击音效：连续清脆音
错误音效：沉闷"咚"声
```

**采集小游戏**
```
挖掘：土石摩擦声
敲击：金属撞击声
套索：风声+绳索声
```

## 4. 战斗音效

### 4.1 输入反馈

```
正确输入：清脆"叮" + 音高递增
错误输入：沉闷"咚"
连击保持：连续"叮叮叮"
连击中断：断音
```

### 4.2 战斗动作

| 动作 | 音效 | 描述 |
|------|------|------|
| 发射药气波 | whoosh.mp3 | 气浪声，200ms |
| 击中敌人 | hit.mp3 | 打击声，100ms |
| 敌人被击退 | poof.mp3 | 消散声，150ms |
| 技能释放 | skill.mp3 | 特效音，500ms |
| 受到伤害 | damage.mp3 | 受伤声，150ms |
| 生命恢复 | heal.mp3 | 治愈声，200ms |

### 4.3 波次提示

```
波次开始：鼓点提示
Boss出现：威严音效
战斗胜利：胜利音乐（5秒）
战斗失败：失败音乐（3秒）
```

## 5. 环境音效

### 5.1 场景环境

**青木林**
```
鸟鸣：随机触发
风声：持续低音量
溪流：远处水声
竹叶沙沙：风声关联
```

**赤焰峰**
```
火焰噼啪：持续
岩浆流动：远处
蒸汽喷发：随机
热风呼啸：风声
```

**黄土丘**
```
风声：麦浪声
虫鸣：随机
远处人声：偶尔
石磨转动：可交互
```

**白金原**
```
风声：寒冷
冰裂声：偶尔
金属共鸣：特殊
寂静：主要
```

**黑水潭**
```
水声：持续
气泡声：偶尔
极光音效：特殊
深海压迫：低频
```

### 5.2 动态环境音

```typescript
// 环境音管理
class AmbientSound {
  private sounds: Map<string, HTMLAudioElement>;

  constructor() {
    this.sounds = new Map();
  }

  play(weather: Weather, time: GameTime): void {
    // 根据天气调整
    if (weather === 'rainy') {
      this.sounds.get('rain')?.play();
      this.sounds.get('wind')?.volume = 0.3;
    }

    // 根据时间调整
    if (time === 'night') {
      this.sounds.get('crickets')?.play();
      this.sounds.get('birds')?.pause();
    }
  }
}
```

## 6. 角色语音

### 6.1 AI导师语音

**语音风格**
```
语言：中文普通话
语气：温和、耐心、有磁性
语速：中等偏慢
情感：鼓励为主
```

**语音触发**
```
开场白：语音播放
鼓励：简短语音
纠正：温和提醒
庆祝：喜悦语气
```

### 6.2 语音合成

```typescript
// TTS集成（可选）
class TTSService {
  async speak(text: string, emotion: Emotion): Promise<void> {
    // 调用TTS API
    const audio = await fetchTTS({
      text,
      voice: 'gentle_old_man',
      emotion,
      speed: 0.9,
    });

    // 播放
    const audioElement = new Audio(audio);
    await audioElement.play();
  }
}
```

## 7. 音效资源列表

### 7.1 必需资源

```
audio/
├── bgm/                      # 背景音乐
│   ├── wood_theme.mp3        # 青木林
│   ├── fire_theme.mp3        # 赤焰峰
│   ├── earth_theme.mp3       # 黄土丘
│   ├── metal_theme.mp3       # 白金原
│   ├── water_theme.mp3       # 黑水潭
│   ├── battle_theme.mp3      # 战斗音乐
│   ├── victory_theme.mp3     # 胜利音乐
│   └── defeat_theme.mp3      # 失败音乐
├── sfx/                      # 音效
│   ├── ui/                   # UI音效
│   │   ├── click.mp3
│   │   ├── confirm.mp3
│   │   ├── cancel.mp3
│   │   ├── success.mp3
│   │   └── fail.mp3
│   ├── battle/               # 战斗音效
│   │   ├── type_key.mp3
│   │   ├── type_correct.mp3
│   │   ├── type_error.mp3
│   │   ├── projectile.mp3
│   │   ├── hit.mp3
│   │   └── skill.mp3
│   └── ambient/              # 环境音效
│       ├── wind.mp3
│       ├── rain.mp3
│       ├── birds.mp3
│       └── water.mp3
└── voice/                    # 语音（可选）
    └── mentor/
        ├── greeting_1.mp3
        ├── encouragement_1.mp3
        └── celebration_1.mp3
```

### 7.2 资源规格

| 类型 | 格式 | 码率 | 循环 |
|------|------|------|------|
| 背景音乐 | MP3 | 192kbps | 无缝 |
| 音效 | MP3/WAV | 128kbps | 否 |
| 语音 | MP3 | 192kbps | 否 |
| 环境 | OGG | 96kbps | 无缝 |

## 8. 音效管理

### 8.1 音频管理器

```typescript
class AudioManager {
  private bgmVolume: number = 0.4;
  private sfxVolume: number = 0.6;
  private voiceVolume: number = 0.8;

  // 播放背景音乐
  playBGM(music: string): void {
    const audio = new Audio(music);
    audio.loop = true;
    audio.volume = this.bgmVolume;
    audio.play();
  }

  // 播放音效
  playSFX(sound: string): void {
    const audio = new Audio(sound);
    audio.volume = this.sfxVolume;
    audio.play();
  }

  // 设置音量
  setVolume(type: 'bgm' | 'sfx' | 'voice', volume: number): void {
    switch (type) {
      case 'bgm': this.bgmVolume = volume; break;
      case 'sfx': this.sfxVolume = volume; break;
      case 'voice': this.voiceVolume = volume; break;
    }
  }
}
```

### 8.2 预加载

```typescript
// 音频预加载
function preloadAudio(): void {
  const audioFiles = [
    'bgm/wood_theme.mp3',
    'sfx/ui/click.mp3',
    'sfx/battle/type_key.mp3',
    // ...
  ];

  audioFiles.forEach(file => {
    const audio = new Audio();
    audio.src = file;
    audio.preload = 'auto';
  });
}
```

## 9. 设置面板

```
┌─────────────────────────────────┐
│  ⚙️ 设置                         │
├─────────────────────────────────┤
│                                 │
│  【音量设置】                    │
│                                 │
│  背景音乐  [══════░░░░] 60%    │
│  音效      [████████░░] 80%    │
│  语音      [████████░░] 80%    │
│                                 │
│  【音频选项】                    │
│                                 │
│  ☑ 背景音乐                     │
│  ☑ 音效                         │
│  ☐ 语音（TTS）                  │
│                                 │
│  【音频质量】                    │
│                                 │
│  ○ 高（下载所有语音）           │
│  ● 中（仅下载关键语音）         │
│  ○ 低（关闭语音）               │
│                                 │
└─────────────────────────────────┘
```

## 10. 版权与来源

### 10.1 音乐来源

- **原创音乐**：委托作曲（推荐）
- **免费资源**：[爱给网](https://www.aigei.com/)、[淘声网](https://www.tosound.com/)
- **商业授权**：AudioJungle、Epic Stock Media

### 10.2 音效来源

- **UI音效**：Freesound、Zapsplat
- **战斗音效**：游戏音效包
- **环境音效**：实地录音或音效库

### 10.3 语音合成

- **TTS服务**：阿里云、腾讯云、讯飞
- **离线方案**：Edge-TTS（免费）

---

*文档状态: 详细设计*
*核心: 氛围营造 + 清晰反馈 + 中医韵味*
