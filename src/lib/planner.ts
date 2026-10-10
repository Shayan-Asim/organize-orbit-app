export type Subject = 'Programming' | 'Mathematics' | 'Science' | 'English' | 'Other';
export type Priority = 'High' | 'Medium' | 'Low';
export type Task = { id: string; title: string; subject: Subject; priority: Priority; due: string; notes: string; created: string; completed: boolean; completedAt?: string | undefined };
export const subjects: Subject[] = ['Programming', 'Mathematics', 'Science', 'English', 'Other'];
export const priorities: Priority[] = ['High', 'Medium', 'Low'];
export function dayKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
export function seedTasks(): Task[] {
  const now = new Date();
  const names: [string, Subject, Priority, boolean, string][] = [
    ['Complete React hooks practice', 'Programming', 'High', false, 'Build a small component using useState and useEffect.'],
    ['Solve calculus problem set', 'Mathematics', 'High', false, 'Work through derivatives and integration exercises.'],
    ['Review cell biology notes', 'Science', 'Medium', false, 'Review cell structure, organelles and their functions.'],
    ['Read chapter 4 of The Great Gatsby', 'English', 'Low', false, 'Take notes on symbolism and character development.'],
    ['Practice JavaScript array methods', 'Programming', 'Medium', true, 'Practice map, filter and reduce.'],
    ['Revise quadratic equations', 'Mathematics', 'Low', true, 'Review the quadratic formula and complete five examples.'],
  ];
  return names.map(([title, subject, priority, completed, notes], i) => ({id:`sample-${i}`, title, subject, priority, completed, notes, due: dayKey(now), created: new Date(now.getTime() - (6-i)*3600000).toISOString(), completedAt: completed ? now.toISOString() : undefined}));
}
export function streakCount(days: string[], today = new Date()) {
  const cursor = new Date(today); const set = new Set(days);
  if (!set.has(dayKey(cursor))) cursor.setDate(cursor.getDate()-1);
  let count = 0;
  while (set.has(dayKey(cursor))) { count++; cursor.setDate(cursor.getDate()-1); }
  return count;
}
export function downloadCSV(tasks: Task[]) {
  const cell = (v: string) => `"${(/^[=+@\-\t\r]/.test(v) ? "'" : '') + v.replaceAll('"','""')}"`;
  const rows = [['Task','Subject','Priority','Due date','Status','Notes','Created'], ...tasks.map(t => [t.title,t.subject,t.priority,t.due,t.completed ? 'Completed' : 'Pending',t.notes,t.created])];
  const blob = new Blob(['\uFEFF'+rows.map(r => r.map(cell).join(',')).join('\r\n')], {type:'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='study-planner.csv'; a.click(); URL.revokeObjectURL(url);
}