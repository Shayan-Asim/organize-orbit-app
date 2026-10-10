import { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Timer, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function FocusTimer({ onSession }: { onSession: () => void }) {
  const [mode,setMode] = useState<'focus'|'break'>('focus');
  const [seconds,setSeconds] = useState(25*60); const [running,setRunning]=useState(false);
  useEffect(() => { if (!running) return; const id=window.setInterval(() => setSeconds(s => Math.max(0,s-1)),1000); return () => window.clearInterval(id); },[running]);
  useEffect(() => { if(seconds !== 0 || !running) return; setRunning(false); if(mode==='focus') onSession(); },[seconds,running,mode,onSession]);
  function changeMode(m: 'focus'|'break') { setMode(m);setSeconds(m==='focus'?1500:300);setRunning(false); }
  return <section className="surface focus-panel"><div className="panel-heading"><span className="flex items-center gap-2"><Timer size={17}/> Focus timer</span><span className="tiny-label">POMODORO</span></div>
    <div className="timer-tabs"><Button variant={mode==='focus'?'secondary':'ghost'} onClick={()=>changeMode('focus')}><Timer/>Focus</Button><Button variant={mode==='break'?'secondary':'ghost'} onClick={()=>changeMode('break')}><Coffee/>Short break</Button></div>
    <div className="timer-ring"><div><div className="timer-number">{String(Math.floor(seconds/60)).padStart(2,'0')}<span>:</span>{String(seconds%60).padStart(2,'0')}</div><p>{seconds===0?'Session complete':running?'You’re doing great':'Time to focus'}</p></div></div>
    <div className="flex justify-center gap-2"><Button className="timer-start" onClick={()=>{if(seconds===0)setSeconds(mode==='focus'?1500:300);setRunning(!running);}}>{running?<Pause/>:<Play/>}{running?'Pause session':'Start session'}</Button><Button variant="outline" size="icon" aria-label="Reset timer" title="Reset timer" onClick={()=>changeMode(mode)}><RotateCcw/></Button></div>
    <p className="timer-footer">One session. One step closer.</p></section>;
}