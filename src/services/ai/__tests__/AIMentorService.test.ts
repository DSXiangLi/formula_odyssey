import { describe, it, expect, beforeEach } from 'vitest';
import { AIMentorService, MentorContext } from '../AIMentorService';

describe('AIMentorService', () => {
  let service: AIMentorService;

  beforeEach(() => {
    service = new AIMentorService();
  });

  const context: MentorContext = {
    playerName: '测试玩家',
    chapterId: 'chapter-1',
    chapterTitle: '青木初识',
    collectedMedicines: [],
    knownMedicineInfo: {},
    stage: 'intro',
  };

  it('should return offline response when AI fails', async () => {
    service.setOfflineMode(true);

    const response = await service.generateResponse(context, 'greeting');

    expect(response.role).toBe('mentor');
    expect(response.content).toContain('欢迎');
    expect(response.emotion).toBe('happy');
  });

  it('should detect correct emotion for celebrating', async () => {
    service.setOfflineMode(true);

    const response = await service.generateResponse(context, 'encouragement');

    expect(response.emotion).toBe('celebrating');
  });

  it('should detect thinking emotion for guide', async () => {
    service.setOfflineMode(true);

    const response = await service.generateResponse(context, 'guide');

    expect(response.emotion).toBe('thinking');
  });

  it('should detect concerned emotion for correction', async () => {
    service.setOfflineMode(true);

    const response = await service.generateResponse(context, 'correction');

    expect(response.emotion).toBe('concerned');
  });

  it('should generate unique message IDs', async () => {
    service.setOfflineMode(true);

    const response1 = await service.generateResponse(context, 'greeting');
    const response2 = await service.generateResponse(context, 'greeting');

    expect(response1.id).not.toBe(response2.id);
  });

  it('should include timestamp in response', async () => {
    service.setOfflineMode(true);

    const response = await service.generateResponse(context, 'greeting');

    expect(response.timestamp).toBeGreaterThan(0);
    expect(response.timestamp).toBeLessThanOrEqual(Date.now());
  });
});

describe('AIMentorService - Stream Mode', () => {
  let service: AIMentorService;

  beforeEach(() => {
    service = new AIMentorService();
    service.setOfflineMode(true);
  });

  const context: MentorContext = {
    playerName: '测试玩家',
    chapterId: 'chapter-1',
    chapterTitle: '青木初识',
    collectedMedicines: [],
    knownMedicineInfo: {},
    stage: 'intro',
  };

  it('should handle stream callback', async () => {
    const chunks: string[] = [];
    const onStream = (chunk: string) => {
      chunks.push(chunk);
    };

    // In offline mode, stream should not be called, but we test the interface
    const response = await service.generateResponse(context, 'greeting', onStream);

    expect(response.role).toBe('mentor');
    expect(response.content).toBeTruthy();
  });
});
