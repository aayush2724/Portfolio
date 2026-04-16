import React, { useState, useEffect } from 'react';
import { fetchGitHubProjects } from '../data/leetcodeapi';
import { Github, Star } from 'lucide-react';

const fallbackProjects = [
  {
    name: 'Citizen-Resolver-System',
    description: 'Civic issue resolver and helpline workflow project.',
    url: 'https://github.com/aayush2724/Citizen-Resolver-System',
    stars: 0,
    language: 'JavaScript',
    topics: ['civictech', 'react'],
    updatedAt: '4/16/2026',
  },
  {
    name: 'TaskFlow',
    description: 'Task and workflow project, recently started.',
    url: 'https://github.com/aayush2724/TaskFlow',
    stars: 0,
    language: 'Planning',
    topics: ['productivity'],
    updatedAt: '4/16/2026',
  },
  {
    name: 'Skillnest',
    description: 'Peer-to-peer learning and skill exchange platform.',
    url: 'https://github.com/aayush2724/Skillnest',
    stars: 0,
    language: 'JavaScript',
    topics: ['edtech', 'community'],
    updatedAt: '4/12/2026',
  },
  {
    name: 'RSB-Visitor-Management-System',
    description: 'Secure visitor management system with admin workflows.',
    url: 'https://github.com/aayush2724/RSB-Visitor-Management-System',
    stars: 0,
    language: 'JavaScript',
    topics: ['fullstack', 'auth'],
    updatedAt: '4/7/2026',
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
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center text-gray-900 dark:text-white">
          GitHub Projects
        </h2>
        {error && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 -mt-8 mb-8">
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
              className="group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-105 transform"
            >
              <div className="p-6 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.name}
                  </h3>
                  <Github className="w-6 h-6 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow line-clamp-3">
                  {project.description}
                </p>

                {/* Tags */}
                {(project.language || project.topics.length > 0) && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {project.language && (
                      <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-semibold">
                        {project.language}
                      </span>
                    )}
                    {project.topics.slice(0, 2).map((topic) => (
                      <span 
                        key={topic}
                        className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Star className="w-4 h-4" />
                      <span className="text-sm font-semibold">{project.stars}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Updated: {project.updatedAt}
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            <Github className="w-5 h-5" />
            View All Projects on GitHub
          </a>
        </div>

        {/* Last Updated */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          Projects refresh every 12 hours • Last synced: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </section>
  );
};

export default GitHubProjects;
