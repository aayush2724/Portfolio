import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const projects = [
  {
    name: 'RSB Secure',
    repo: 'RSB-Visitor-Management-System',
    desc: 'A cyberpunk-styled full-stack visitor management system replacing paper-based logs in corporate environments. Features hardware-locked photo capture, automated WhatsApp/Email notifications, secure admin dashboards, pre-scheduled entry logic, and encrypted JWT authentication.',
    tags: ['JavaScript','Node.js','JWT','Full-Stack'],
    color: '#06b6d4',
    grad: 'from-cyan-500/15 to-blue-500/5',
    emoji: '🛡️',
    gh: 'https://github.com/aayush2724/RSB-Visitor-Management-System',
    highlight: 'Cyberpunk UI · WhatsApp Integration · JWT Auth',
    featured: true,
  },
  {
    name: 'Disaster Relief System',
    repo: 'Disaster-relief-system',
    desc: 'A full-stack coordination platform for disaster response — enabling NGOs, volunteers, and agencies to manage affected zones, dispatch resources, track supplies, and monitor relief operations in real time.',
    tags: ['JavaScript','Full-Stack','Real-time','NGO'],
    color: '#f59e0b',
    grad: 'from-amber-500/15 to-orange-500/5',
    emoji: '🆘',
    gh: 'https://github.com/aayush2724/Disaster-relief-system',
    highlight: 'Resource Dispatch · Zone Management · Multi-agency',
    featured: true,
  },
  {
    name: 'Skillnest',
    repo: 'Skillnest',
    desc: 'A give-and-take learning platform where anyone can teach what they know and learn what they need — for free, across any field. Peer-to-peer skill exchange without money.',
    tags: ['JavaScript','EdTech','Community'],
    color: '#a855f7',
    grad: 'from-purple-500/15 to-pink-500/5',
    emoji: '🧠',
    gh: 'https://github.com/aayush2724/Skillnest',
    highlight: 'Skill Exchange · Zero Cost · Any Domain',
    featured: true,
  },
  {
    name: 'HackFindo',
    repo: 'HackFindo',
    desc: 'A hackathon discovery and team-formation platform — helping developers find hackathons, build teams, and track submissions all in one place.',
    tags: ['JavaScript','Community','Hackathons'],
    color: '#22c55e',
    grad: 'from-green-500/15 to-emerald-500/5',
    emoji: '⚡',
    gh: 'https://github.com/aayush2724/HackFindo',
    highlight: 'Team Builder · Event Discovery',
    featured: false,
  },
  {
    name: 'Job Portal',
    repo: 'Job-Portal',
    desc: 'A TypeScript-powered job listing and application platform with authentication, filtering, and recruiter dashboards.',
    tags: ['TypeScript','React','Full-Stack'],
    color: '#3b82f6',
    grad: 'from-blue-500/15 to-indigo-500/5',
    emoji: '💼',
    gh: 'https://github.com/aayush2724/Job-Portal',
    highlight: 'TypeScript · Auth · Recruiter Dashboard',
    featured: false,
  },
  {
    name: 'chatRoom',
    repo: 'chatRoom',
    desc: 'Real-time group chat application with rooms, user presence, and live message broadcasting.',
    tags: ['HTML','JavaScript','Real-time'],
    color: '#ec4899',
    grad: 'from-pink-500/15 to-rose-500/5',
    emoji: '💬',
    gh: 'https://github.com/aayush2724/chatRoom',
    highlight: 'Live Chat · Rooms · User Presence',
    featured: false,
  },
];

function Card({ p, i }) {
  const [hov, setHov] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref,{once:true,margin:'-60px'});
  return (
    <motion.div ref={ref}
      initial={{opacity:0,y:50}} animate={inView?{opacity:1,y:0}:{}}
      transition={{duration:.8,delay:i*.1,ease:[0.16,1,0.3,1]}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      className="gc rounded-3xl border border-white/7 overflow-hidden relative transition-all duration-500 p-6 group"
      style={{boxShadow:hov?`0 20px 55px ${p.color}14`:'none'}}>
      <div className={`absolute inset-0 bg-gradient-to-br ${p.grad} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}/>
      <motion.div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl pointer-events-none"
        style={{background:p.color}} animate={{opacity:hov?.1:0}} transition={{duration:.4}}/>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl border border-white/8"
              style={{background:`${p.color}12`}}>{p.emoji}</div>
            <div>
              <div className="font-display font-bold text-white text-sm">{p.name}</div>
              {p.featured && <span className="font-mono text-xs px-2 py-0.5 rounded-full" style={{background:`${p.color}18`,color:p.color}}>Featured</span>}
            </div>
          </div>
          <a href={p.gh} target="_blank" rel="noopener noreferrer"
            className="text-white/20 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
        </div>

        <p className="text-white/45 text-xs font-body leading-relaxed mb-3">{p.desc}</p>

        <div className="font-mono text-xs mb-4 px-2 py-1 rounded-lg border border-white/5 text-white/30 bg-white/2">
          ✦ {p.highlight}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {p.tags.map(t => (
            <span key={t} className="text-xs font-mono px-2.5 py-0.5 rounded-full border border-white/8 text-white/35">{t}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref,{once:true});
  return (
    <section id="projects" className="py-28 px-6 relative">
      <div className="absolute left-0 top-1/2 w-64 h-64 bg-cyan-500/4 rounded-full blur-3xl pointer-events-none"/>
      <div className="max-w-6xl mx-auto">
        <div ref={ref} className="mb-14">
          <motion.p initial={{opacity:0}} animate={inView?{opacity:1}:{}} className="font-mono text-xs text-amber-500 tracking-widest uppercase mb-3">Chapter 03 — Projects</motion.p>
          <motion.h2 initial={{opacity:0,y:30}} animate={inView?{opacity:1,y:0}:{}} transition={{duration:.8,delay:.1}}
            className="font-display font-extrabold text-5xl md:text-6xl text-white">
            Things I've <span className="gt">shipped</span>
          </motion.h2>
          <motion.p initial={{opacity:0}} animate={inView?{opacity:1}:{}} transition={{delay:.2,duration:.8}}
            className="text-white/35 mt-3 font-body max-w-lg">
            Real GitHub repos. Real problems. From disaster response to peer learning — each project has a story.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p,i) => <Card key={p.repo} p={p} i={i}/>)}
        </div>

        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.8}}
          className="mt-10 text-center">
          <a href="https://github.com/aayush2724" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 gc border border-white/10 rounded-xl px-7 py-3.5 font-mono text-sm text-white/40 hover:text-white hover:border-white/20 transition-all">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            See all repos → github.com/aayush2724
          </a>
        </motion.div>
      </div>
    </section>
  );
}
