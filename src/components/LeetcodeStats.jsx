import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchLeetCodeStats, getLastSyncTime } from "../data/leetcodeapi";

const fallbackStats = {
  username: "aayush2717",
  avatar: "https://assets.leetcode.com/users/aayush2717/avatar_1750018458.png",
  realName: "aayush2717",
  stats: {
    totalSolved: 350,
    easy: 169,
    medium: 162,
    hard: 19,
    totalSubmissions: 781,
  },
  streak: 25,
  totalActiveDays: 189,
};

const cards = [
  { key: "easy", label: "Easy", color: "#22c55e" },
  { key: "medium", label: "Medium", color: "#f59e0b" },
  { key: "hard", label: "Hard", color: "#ef4444" },
];

export default function LeetcodeStats() {
  const [stats, setStats] = useState(fallbackStats);
  const [syncedFromApi, setSyncedFromApi] = useState(false);

  const lastSync = getLastSyncTime()
    ? new Date(getLastSyncTime()).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      })
    : "Apr 20";

  useEffect(() => {
    let mounted = true;

    const getStats = async () => {
      const data = await fetchLeetCodeStats("aayush2717");
      if (mounted && data) {
        setStats(data);
        setSyncedFromApi(true);
      }
    };

    getStats();
    const interval = setInterval(getStats, 6 * 60 * 60 * 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const totalProblems = Math.max(stats.stats.totalSolved, 1);
  const breakdown = cards.map((card) => ({
    ...card,
    value: stats.stats[card.key],
    pct: (stats.stats[card.key] / totalProblems) * 100,
  }));

  return (
    <section id="leetcode" className="py-28 px-6 relative">
      <div className="absolute right-0 top-20 w-72 h-72 bg-green-500/4 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="font-mono text-xs text-amber-500 tracking-widest uppercase mb-3">
            Chapter 02.5 - LeetCode
          </p>
          <h2 className="font-display font-extrabold text-5xl md:text-6xl text-white">
            Problem solving <span className="ga">in motion</span>
          </h2>
          <p className="text-white/35 mt-3 font-body max-w-xl">
            Daily DSA practice with C++ at the center: arrays, trees, graphs,
            dynamic programming, and the quiet patience that ties them together.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="gc rounded-2xl border border-amber-500/15 p-7"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                {stats.avatar && (
                  <img
                    src={stats.avatar}
                    alt={stats.username}
                    className="w-16 h-16 rounded-xl border border-white/10"
                  />
                )}
                <div>
                  <div className="font-mono text-xs text-white/25">
                    leetcode.com/{stats.username}
                  </div>
                  <h3 className="font-display font-bold text-3xl text-white">
                    {stats.stats.totalSolved} solved
                  </h3>
                </div>
              </div>
              <a
                href={`https://leetcode.com/${stats.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="self-start sm:self-center rounded-lg border border-amber-500/25 px-4 py-2 font-mono text-xs text-amber-400 hover:border-amber-400/60 transition-colors"
              >
                View profile
              </a>
            </div>

            <div className="space-y-5">
              {breakdown.map((item) => (
                <div key={item.key}>
                  <div className="flex justify-between font-mono text-xs mb-2">
                    <span className="text-white/45">{item.label}</span>
                    <span style={{ color: item.color }}>
                      {item.value} / {stats.stats.totalSolved}
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{ background: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {[
              ["Submissions", stats.stats.totalSubmissions],
              ["Current streak", stats.streak],
              ["Active days", stats.totalActiveDays],
              ["Synced", syncedFromApi ? "Live" : lastSync],
            ].map(([label, value], index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className="gc rounded-2xl border border-white/7 p-5"
              >
                <div className="font-display font-extrabold text-3xl text-amber-400">
                  {value}
                </div>
                <div className="font-mono text-xs text-white/30 mt-2">
                  {label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
