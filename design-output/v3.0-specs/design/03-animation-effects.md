# 动画效果设计

## 1. 动画原则

### 1.1 设计目标

- **反馈清晰** - 操作有响应
- **流畅自然** - 60fps流畅
- **适度克制** - 不过度动画
- **中医韵味** - 符合文化氛围

### 1.2 性能目标

- 目标帧率：60fps
- 最大节点数：1000
- GPU加速：优先使用transform
- 内存占用：<100MB

## 2. 场景动画

### 2.1 环境粒子

**青木林 - 飘落竹叶**
```typescript
// 粒子系统
interface ParticleSystem {
  particles: Particle[];

  update(deltaTime: number): void {
    this.particles.forEach(p => {
      p.y += p.speedY * deltaTime;
      p.x += Math.sin(p.time) * p.sway * deltaTime;
      p.rotation += p.rotationSpeed * deltaTime;

      // 循环
      if (p.y > SCREEN_HEIGHT) {
        p.y = -50;
        p.x = Math.random() * SCREEN_WIDTH;
      }
    });
  }
}

// 参数
const bambooLeaf = {
  count: 30,
  speedY: 20-40,      // 下落速度
  sway: 10-20,        // 摇摆幅度
  rotationSpeed: 0.5-1,
  opacity: 0.6-0.8,
};
```

**赤焰峰 - 上升热气**
```typescript
const heatWave = {
  count: 20,
  speedY: 30-50,      // 上升速度
  scale: 0.5-1.5,     // 大小变化
  opacity: 0.3-0.6,
  fadeOut: true,      // 渐隐
};
```

**黄土丘 - 飘落麦穗**
```typescript
const wheatEar = {
  count: 25,
  speedY: 15-30,
  rotation: 0-360,
  sway: 5-15,
};
```

**白金原 - 飘落雪花**
```typescript
const snowflake = {
  count: 50,
  speedY: 10-25,
  sway: 20-40,        // 雪花摇摆更大
  rotation: 0-360,
};
```

**黑水潭 - 极光流动**
```typescript
const aurora = {
  count: 5,           // 大范围极光
  speedX: 10-20,      // 水平流动
  wave: 50-100,       // 波浪幅度
  colorShift: true,   // 颜色渐变
};
```

### 2.2 场景切换

```typescript
// 场景切换动画
function transitionScene(from: Scene, to: Scene): void {
  // 1. 当前场景淡出
  from.animate({
    opacity: 0,
    duration: 500,
    easing: 'easeOut',
  });

  // 2. 加载新场景
  loadScene(to);

  // 3. 新场景淡入
  to.animate({
    opacity: 1,
    duration: 500,
    easing: 'easeIn',
  });
}
```

## 3. UI动画

### 3.1 按钮动画

**悬停效果**
```css
.btn {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.btn:active {
  transform: translateY(0) scale(0.95);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

**点击涟漪**
```typescript
function rippleEffect(button: HTMLElement, x: number, y: number): void {
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  button.appendChild(ripple);

  // 动画结束移除
  setTimeout(() => ripple.remove(), 600);
}
```

### 3.2 卡片动画

**入场动画**
```css
@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.card-enter {
  animation: cardEnter 0.3s ease;
}
```

**选中动画**
```css
.card-selected {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  border-color: var(--primary-color);
  transition: all 0.2s ease;
}
```

### 3.3 输入反馈

**正确输入**
```css
@keyframes correctInput {
  0% { background: white; }
  50% { background: #E8F5E9; }
  100% { background: white; }
}

.input-correct {
  animation: correctInput 0.3s ease;
}
```

**错误输入**
```css
@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.input-error {
  animation: errorShake 0.3s ease;
  border-color: #F44336;
}
```

## 4. 采药动画

### 4.1 移动动画

**地块移动**
```typescript
function movePlayer(from: Position, to: Position): void {
  const player = getPlayerElement();

  // 计算距离和方向
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx*dx + dy*dy);
  const duration = distance * 200; // 200ms per unit

  // 移动动画
  player.animate({
    transform: `translate(${to.x * TILE_SIZE}px, ${to.y * TILE_SIZE}px)`,
    duration,
    easing: 'easeInOut',
  });
}
```

**探索动画**
```css
@keyframes exploreReveal {
  from {
    filter: blur(10px);
    opacity: 0;
  }
  to {
    filter: blur(0);
    opacity: 1;
  }
}

.tile-explored {
  animation: exploreReveal 0.5s ease;
}
```

### 4.2 采集小游戏

**挖掘时机 - 力度条**
```typescript
function animatePowerBar(): void {
  const bar = getPowerBar();
  let power = 0;
  let direction = 1;

  const animate = () => {
    power += direction * 2; // 速度

    if (power >= 100) direction = -1;
    if (power <= 0) direction = 1;

    bar.style.width = `${power}%`;

    // 颜色变化
    if (power >= 60 && power <= 80) {
      bar.style.background = '#4CAF50'; // 绿色（完美）
    } else if (power >= 50 && power <= 90) {
      bar.style.background = '#FF9800'; // 黄色（良好）
    } else {
      bar.style.background = '#F44336'; // 红色（失败）
    }

    requestAnimationFrame(animate);
  };

  animate();
}
```

**节奏游戏 - 音符下落**
```typescript
function animateNotes(): void {
  const notes = getNotes();

  notes.forEach(note => {
    note.y += note.speed;

    // 到达判定线
    if (note.y >= JUDGE_LINE) {
      checkHit(note);
    }
  });
}
```

## 5. 战斗动画

### 5.1 敌人移动

```typescript
function updateEnemyMovement(enemies: Enemy[]): void {
  enemies.forEach(enemy => {
    // 向底部移动
    enemy.y += enemy.speed;

    // 摇摆效果
    enemy.x += Math.sin(enemy.time * 0.05) * 0.5;

    // 更新DOM
    enemy.element.style.transform =
      `translate(${enemy.x}px, ${enemy.y}px)`;
  });
}
```

### 5.2 药气波发射

```css
@keyframes projectileLaunch {
  from {
    transform: translateY(0) scale(0.5);
    opacity: 1;
  }
  to {
    transform: translateY(-300px) scale(1);
    opacity: 0;
  }
}

.projectile {
  animation: projectileLaunch 0.5s ease-out;
}
```

### 5.3 敌人被击退

```css
@keyframes enemyDefeat {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}

.enemy-defeated {
  animation: enemyDefeat 0.3s ease;
}
```

### 5.4 连击效果

```css
@keyframes comboPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.combo-display {
  animation: comboPulse 0.3s ease;
}

/* 数字跳动 */
@keyframes numberPop {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
```

### 5.5 技能释放

```css
@keyframes skillBurst {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  50% {
    transform: scale(2);
    opacity: 0.8;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}

.skill-effect {
  animation: skillBurst 0.5s ease-out;
}
```

## 6. 对话框动画

### 6.1 打字机效果

```typescript
function typewriterEffect(element: HTMLElement, text: string): void {
  let index = 0;
  element.textContent = '';

  const type = () => {
    if (index < text.length) {
      element.textContent += text[index];
      index++;
      setTimeout(type, 50); // 每个字50ms
    }
  };

  type();
}
```

### 6.2 表情切换

```css
.mentor-avatar {
  transition: opacity 0.3s ease;
}

.mentor-avatar.change {
  opacity: 0;
}

.mentor-avatar.new-expression {
  opacity: 1;
}
```

## 7. 转场动画

### 7.1 页面切换

```typescript
// 页面切换管理器
class PageTransition {
  async transition(from: Page, to: Page): Promise<void> {
    // 1. 当前页面淡出
    await from.animate({
      opacity: 0,
      transform: 'scale(0.98)',
      duration: 200,
    });

    // 2. 隐藏当前页面
    from.hide();

    // 3. 显示新页面
    to.show();

    // 4. 新页面淡入
    await to.animate({
      opacity: [0, 1],
      transform: ['scale(1.02)', 'scale(1)'],
      duration: 200,
    });
  }
}
```

### 7.2 弹窗出现

```css
@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-enter {
  animation: modalAppear 0.3s ease;
}

/* 背景遮罩 */
@keyframes overlayFade {
  from { opacity: 0; }
  to { opacity: 0.5; }
}
```

## 8. 特殊效果

### 8.1 获得物品

```typescript
function animateItemAcquired(item: Item): void {
  // 物品飞入背包
  const element = createFlyingItem(item);

  element.animate({
    transform: [
      `translate(${item.x}px, ${item.y}px) scale(1)`,
      `translate(${BAG_X}px, ${BAG_Y}px) scale(0.5)`,
    ],
    duration: 800,
    easing: 'easeInOut',
  }).then(() => {
    // 到达后闪烁
    bagIcon.animate({
      transform: ['scale(1)', 'scale(1.2)', 'scale(1)'],
      duration: 300,
    });
    element.remove();
  });
}
```

### 8.2 升级特效

```css
@keyframes levelUp {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.1);
    filter: brightness(1.5);
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
}

.level-up {
  animation: levelUp 0.5s ease;
}

/* 光柱效果 */
@keyframes lightBeam {
  from {
    transform: scaleY(0);
    opacity: 0;
  }
  to {
    transform: scaleY(1);
    opacity: 0.6;
  }
}
```

### 8.3 成就解锁

```typescript
function showAchievement(achievement: Achievement): void {
  const toast = createAchievementToast(achievement);

  // 滑入
  toast.animate({
    transform: ['translateX(100%)', 'translateX(0)'],
    duration: 300,
    easing: 'easeOut',
  });

  // 停留3秒
  setTimeout(() => {
    // 滑出
    toast.animate({
      transform: 'translateX(100%)',
      duration: 300,
    }).then(() => toast.remove());
  }, 3000);
}
```

## 9. 性能优化

### 9.1 GPU加速

```css
/* 使用transform和opacity */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0); /* 开启GPU加速 */
}
```

### 9.2 动画节流

```typescript
// 使用requestAnimationFrame
function optimizedAnimation(): void {
  let isAnimating = false;

  const animate = () => {
    if (!isAnimating) return;

    // 更新动画
    updateAnimation();

    requestAnimationFrame(animate);
  };

  // 开始动画
  isAnimating = true;
  requestAnimationFrame(animate);

  // 停止动画
  return () => {
    isAnimating = false;
  };
}
```

### 9.3 虚拟滚动

```typescript
// 大量元素时优化
class VirtualScroller {
  private visibleItems: number = 10;
  private itemHeight: number = 80;

  render(): void {
    const startIndex = Math.floor(scrollY / this.itemHeight);
    const endIndex = startIndex + this.visibleItems;

    // 只渲染可见项
    for (let i = startIndex; i < endIndex; i++) {
      if (items[i]) {
        renderItem(items[i], i * this.itemHeight);
      }
    }
  }
}
```

## 10. 动画时序参考

| 动画类型 | 时长 | 缓动 |
|----------|------|------|
| 按钮反馈 | 100-200ms | ease |
| 页面切换 | 300ms | easeInOut |
| 弹窗出现 | 200-300ms | easeOut |
| 卡片动画 | 300ms | ease |
| 粒子效果 | 持续 | linear |
| 战斗动画 | 500ms | easeOut |
| 技能释放 | 500-800ms | easeOut |
| 转场动画 | 500ms | easeInOut |

---

*文档状态: 详细设计*
*核心: 流畅体验 + 60fps + 中医韵味*
