import React, { useState, useEffect } from "react";
import { fetchGitHubProjects } from "../data/leetcodeapi";
import { Github, Star } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedHeading from "./AnimatedHeading";

const fallbackProjects = [
  {
    name: "Beatzy",
    description: "Full-stack music analysis platform with AI-powered audio intelligence.",
    url: "https://github.com/aayush2724/Beatzy",
    stars: 1,
    language: "JavaScript",
    topics: ["react", "ai"],
    updatedAt: "5/28/2026",
  },
  {
    name: "Citizen-Resolver-System",
    description: "Civic issue resolver and helpline workflow project.",
    url: "https://github.com/aayush2724/Citizen-Resolver-System",
    stars: 1,
    language: "JavaScript",
    topics: ["civictech", "react"],
    updatedAt: "5/21/2026",
  },
  {
    name: "MedVerify",
    description: "Medical verification platform for prescriptions and intelligent document processing.",
    url: "https://github.com/aayush2724/MedVerify",
    stars: 0,
    language: "JavaScript",
    topics: ["healthtech", "react"],
    updatedAt: "5/18/2026",
  },
  {
    name: "Chord-Detector",
    description: "Chord intelligence project with real-time audio analysis and ML models.",
    url: "https://github.com/aayush2724/Chord-Detector",
    stars: 1,
    language: "Python",
    topics: ["ml", "computervision"],
    updatedAt: "5/5/2026",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const GitHubProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getProjects = async () => {
      const data = await fetchGitHubProjects("aayush2724");

      setProjects(data && data.length > 0 ? data : fallbackProjects);
      setError(
        data && data.length > 0 ? null : "Showing recent saved GitHub work",
      );
      setLoading(false);
    };

    getProjects();
    // Refresh projects every 12 hours
    const interval = setInterval(getProjects, 12 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[40vh]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-b-2 border-gray-800 dark:border-white"
        />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center p-8 text-gray-600 dark:text-gray-400 min-h-[40vh] flex items-center justify-center">
        <p>No projects found</p>
      </div>
    );
  }

  const activeProjects = projects.slice(0, 6);

  return (
    <section className="py-20 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="font-mono text-xs text-amber-500 tracking-widest uppercase mb-3">
            Chapter 03.5 — GitHub
          </p>
          <AnimatedHeading 
            text="Live from GitHub"
            as="h2"
            className="font-display font-extrabold text-5xl md:text-6xl text-white"
          />
          <p className="text-white/35 mt-3 font-body max-w-xl">
            Repos auto-synced daily — showing the most recently updated
            projects.
          </p>
        </motion.div>
        
        {error && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-mono text-xs text-white/20 -mt-8 mb-8 text-center"
          >
            {error}
          </motion.p>
        )}

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {activeProjects.map((project) => (
            <motion.a
              variants={itemVariants}
              whileHover={{ 
                y: -5, 
                scale: 1.02,
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
              whileTap={{ scale: 0.98 }}
              key={project.name}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group gc rounded-2xl border border-white/7 hover:border-amber-500/20 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-amber-500/5 block bg-black/20"
            >
              <div className="p-6 h-full flex flex-col relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-display font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                    {project.name}
                  </h3>
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                  >
                    <Github className="w-5 h-5 text-white/20 group-hover:text-amber-400/60 transition-colors" />
                  </motion.div>
                </div>

                {/* Description */}
                <p className="text-white/40 text-xs font-body leading-relaxed mb-4 flex-grow line-clamp-3">
                  {project.description}
                </p>

                {/* Tags */}
                {(project.language || project.topics.length > 0) && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {project.language && (
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded-full border border-amber-500/20 text-amber-400/70 bg-amber-500/5">
                        {project.language}
                      </span>
                    )}
                    {project.topics.slice(0, 2).map((topic) => (
                      <span
                        key={topic}
                        className="font-mono text-xs px-2.5 py-0.5 rounded-full border border-white/8 text-white/30"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-white/6 mt-auto">
                  <div className="flex items-center gap-1 text-white/25 font-mono text-xs group-hover:text-amber-400/50 transition-colors">
                    <Star className="w-3.5 h-3.5" />
                    <span>{project.stars}</span>
                  </div>
                  <span className="font-mono text-xs text-white/20">
                    {project.updatedAt}
                  </span>
                </div>
              </div>
              
              {/* Animated background glow on hover */}
              <motion.div 
                className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/5 transition-colors duration-500 rounded-2xl pointer-events-none"
              />
            </motion.a>
          ))}
        </motion.div>

        {/* View More Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-12"
        >
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://github.com/aayush2724"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 gc border border-white/10 rounded-xl px-7 py-3.5 font-mono text-sm text-white/40 hover:text-white hover:border-white/20 transition-all bg-white/5"
          >
            <Github className="w-5 h-5" />
            View All Projects on GitHub
          </motion.a>
        </motion.div>

        {/* Last Updated */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center font-mono text-xs text-white/15 mt-8"
        >
          Auto-synced daily via GitHub Actions
        </motion.div>
      </div>
    </section>
  );
};

export default GitHubProjects;

