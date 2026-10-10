import { describe, expect, it } from 'vitest';
import { seedTasks, streakCount, dayKey } from '../lib/planner';
describe('Study Planner', () => {
  it('starts with six meaningful editable tasks', () => {
    const tasks = seedTasks();
    expect(tasks).toHaveLength(6);
    expect(tasks.filter(t => t.completed)).toHaveLength(2);
    expect(new Set(tasks.map(t => t.id)).size).toBe(6);
  });
  it('keeps a streak active until today ends', () => {
    const today = new Date(2026, 9, 10, 12);
    expect(streakCount(['2026-10-08','2026-10-09'], today)).toBe(2);
    expect(streakCount(['2026-10-08','2026-10-09','2026-10-10'], today)).toBe(3);
  });
  it('resets a broken streak and ignores duplicate completion days', () => {
    const today = new Date(2026, 9, 10, 12);
    expect(streakCount(['2026-10-08'], today)).toBe(0);
    expect(streakCount(['2026-10-10','2026-10-10'], today)).toBe(1);
  });
  it('uses a local calendar date for daily progress', () => {
    expect(dayKey(new Date(2026, 0, 2, 23, 59))).toBe('2026-01-02');
  });
});