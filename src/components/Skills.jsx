import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const primary = [
  { name:'DSA (C++)', pct:78, icon:'DS', color:'#f59e0b', tag:'Core Strength', note:'345 LeetCode problems solved' },
  { name:'JavaScript', pct:82, icon:'🌐', color:'#facc15', tag:'Primary Language', note:'ES2024 · Async · DOM · Node' },
  { name:'React', pct:78, icon:'⚛️', color:'#06b6d4', tag:'Frontend', note:'Hooks · Context · Framer Motion' },
  { name:'Node.js', pct:68, icon:'🖥️', color:'#22c55e', tag:'Backend', note:'Express · REST APIs · JWT' },
];

const secondary = [
  { name:'TypeScript', pct:58, color:'#3b82f6' },
  { name:'Python', pct:62, color:'#a855f7' },
  { name:'MongoDB', pct:63, color:'#22c55e' },
  { name:'Tailwind CSS', pct:88, color:'#06b6d4' },
  { name:'Git & GitHub', pct:82, color:'#f97316' },
  { name:'HTML/CSS', pct:90, color:'#f59e0b' },
  { name:'SQL', pct:55, color:'#ec4899' },
  { name:'Express.js', pct:65, color:'#94a3b8' },
];

function PrimaryCard({ s, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:'-50px' });
  const [hov, setHov] = useState(false);
  return (
    <motion.div ref={ref}
      initial={{opacity:0,y:30}} animate={inView?{opacity:1,y:0}:{}}
      transition={{duration:.7,delay,ease:[0.16,1,0.3,1]}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      className="gc rounded-2xl p-6 border border-white/7 relative overflow-hidden cursor-default transition-all duration-400"
      style={{boxShadow: hov?`0 0 40px ${s.color}15`:'none'}}>
      <div className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500"
        style={{opacity: hov?.1:0, background:`radial-gradient(circle at 20% 50%, ${s.color}10, transparent 65%)`}}/>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <div className="font-display font-bold text-white text-sm">{s.name}</div>
              <div className="font-mono text-xs mt-0.5" style={{color:s.color}}>{s.tag}</div>
            </div>
          </div>
          <div className="font-display font-extrabold text-2xl" style={{color:s.color}}>{s.pct}<span className="text-base">%</span></div>
        </div>
        <p className="text-white/35 text-xs font-mono mb-4">{s.note}</p>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div initial={{width:0}} animate={inView?{width:`${s.pct}%`}:{}}
            transition={{duration:1.2,delay:delay+.3,ease:[0.16,1,0.3,1]}}
            className="h-full rounded-full relative"
            style={{background:`linear-gradient(90deg,${s.color}60,${s.color})`}}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-black/30"
              style={{background:s.color}}/>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function MiniBar({ s, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref,{once:true});
  return (
    <div ref={ref} className="mb-3.5">
      <div className="flex justify-between text-xs font-mono mb-1.5">
        <span className="text-white/45">{s.name}</span>
        <span style={{color:s.color}}>{s.pct}%</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div initial={{width:0}} animate={inView?{width:`${s.pct}%`}:{}}
          transition={{duration:.9,delay:delay+.15}}
          className="h-full rounded-full" style={{background:s.color}}/>
      </div>
    </div>
  );
}

export default function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref,{once:true});
  return (
    <section id="skills" className="py-28 px-6 relative">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/3 rounded-full blur-3xl pointer-events-none"/>
      <div className="max-w-6xl mx-auto">
        <div ref={ref} className="mb-14">
          <motion.p initial={{opacity:0}} animate={inView?{opacity:1}:{}}
            className="font-mono text-xs text-amber-500 tracking-widest uppercase mb-3">Chapter 02 — Skills</motion.p>
          <motion.h2 initial={{opacity:0,y:30}} animate={inView?{opacity:1,y:0}:{}} transition={{duration:.8,delay:.1}}
            className="font-display font-extrabold text-5xl md:text-6xl text-white">
            What I <span className="ga">wield</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {primary.map((s,i) => <PrimaryCard key={s.name} s={s} delay={i*.1}/>)}
          </div>
          <div className="space-y-5">
            <motion.div initial={{opacity:0,x:30}} whileInView={{opacity:1,x:0}} viewport={{once:true}}
              transition={{duration:.7}} className="gc rounded-2xl p-6 border border-white/7">
              <div className="font-mono text-xs text-white/25 tracking-widest uppercase mb-5">Also in my toolkit</div>
              {secondary.map((s,i) => <MiniBar key={s.name} s={s} delay={i*.08}/>)}
            </motion.div>

            <motion.div initial={{opacity:0,x:30}} whileInView={{opacity:1,x:0}} viewport={{once:true}}
              transition={{duration:.7,delay:.15}}
              className="gc rounded-2xl p-6 border border-amber-500/15 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/6 to-transparent pointer-events-none"/>
              <div className="relative z-10">
                <div className="font-mono text-xs text-amber-500 tracking-widest uppercase mb-4">LeetCode - aayush2717</div>
                <div className="grid grid-cols-2 gap-4">
                  {[{l:'Solved',v:'345'},{l:'Focus',v:'Medium'},{l:'Topics',v:'Trees,DP,Graph'},{l:'Streak',v:'25 days'}].map(x=>(
                    <div key={x.l} className="text-center">
                      <div className="font-display font-bold text-lg text-amber-400 leading-none">{x.v}</div>
                      <div className="font-mono text-xs text-white/25 mt-1">{x.l}</div>
                    </div>
                  ))}
                </div>
                <a href="https://leetcode.com/aayush2717" target="_blank" rel="noopener noreferrer"
                  className="mt-4 block text-center font-mono text-xs text-amber-500/60 hover:text-amber-400 transition-colors">
                  View profile -&gt;
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
