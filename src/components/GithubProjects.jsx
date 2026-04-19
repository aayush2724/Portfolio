import React, { useState, useEffect } from 'react';
import { fetchGitHubProjects } from '../data/leetcodeapi';
import { Github, Star } from 'lucide-react';

const fallbackProjects = [
  {
    name: 'LeadForge',
    description: 'AI-powered B2B lead generation and enrichment pipeline with multi-phase scoring.',
    url: 'https://github.com/aayush2724/LeadForge',
    stars: 0,
    language: 'Python',
    topics: ['ai', 'automation'],
    updatedAt: '4/19/2026',
  },
  {
    name: 'Citizen-Resolver-System',
    description: 'Civic issue resolver and helpline workflow project.',
    url: 'https://github.com/aayush2724/Citizen-Resolver-System',
    stars: 1,
    language: 'JavaScript',
    topics: ['civictech', 'react'],
    updatedAt: '4/16/2026',
  },
  {
    name: 'TaskFlow',
    description: 'MERN-stack productivity workspace with Kanban board and glassmorphism UI.',
    url: 'https://github.com/aayush2724/TaskFlow',
    stars: 1,
    language: 'JavaScript',
    topics: ['productivity', 'mern'],
    updatedAt: '4/17/2026',
  },
  {
    name: 'RSB-Visitor-Management-System',
    description: 'Secure visitor management system with admin workflows.',
    url: 'https://github.com/aayush2724/RSB-Visitor-Management-System',
    stars: 1,
    language: 'JavaScript',
    topics: ['fullstack', 'auth'],
    updatedAt: '4/17/2026',
  },
];

const GitHubProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getProjects = async () => {
      const data = await fetchGitHubProjects('aayush2724');
      setProjects(data && data.length > 0 ? data : fallbackProjects);
      setError(data && data.length > 0 ? null : 'Showing recent saved GitHub work');
      setLoading(false);
    };

    getProjects();
    // Refresh projects every 12 hours
    const interval = setInterval(getProjects, 12 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 dark:border-white"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center p-8 text-gray-600 dark:text-gray-400">
        <p>No projects found</p>
      </div>
    );
  }

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="font-mono text-xs text-amber-500 tracking-widest uppercase mb-3">
            Chapter 03.5 — GitHub
          </p>
          <h2 className="font-display font-extrabold text-5xl md:text-6xl text-white">
            Live from <span className="ga">GitHub</span>
          </h2>
          <p className="text-white/35 mt-3 font-body max-w-xl">
            Repos auto-synced daily — showing the most recently updated projects.
          </p>
        </div>
        {error && (
          <p className="font-mono text-xs text-white/20 -mt-8 mb-8 text-center">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <a
              key={project.name}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
            className="group gc rounded-2xl border border-white/7 hover:border-amber-500/20 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1 transform"
            >
              <div className="p-6 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-display font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                    {project.name}
                  </h3>
                  <Github className="w-5 h-5 text-white/20 group-hover:text-amber-400/60 transition-colors" />
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
                <div className="flex items-center justify-between pt-4 border-t border-white/6">
                  <div className="flex items-center gap-1 text-white/25 font-mono text-xs">
                    <Star className="w-3.5 h-3.5" />
                    <span>{project.stars}</span>
                  </div>
                  <span className="font-mono text-xs text-white/20">
                    {project.updatedAt}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <a
            href="https://github.com/aayush2724"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 gc border border-white/10 rounded-xl px-7 py-3.5 font-mono text-sm text-white/40 hover:text-white hover:border-white/20 transition-all"
          >
            <Github className="w-5 h-5" />
            View All Projects on GitHub
          </a>
        </div>

        {/* Last Updated */}
        <div className="text-center font-mono text-xs text-white/15 mt-8">
          Auto-synced daily via GitHub Actions
        </div>
      </div>
    </section>
  );
};

export default GitHubProjects;
