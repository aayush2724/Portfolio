import { motion } from "framer-motion";
import { useStory } from "../context/StoryContext";
import { storyChapters } from "../data/storyData";

export default function InteractiveTimeline() {
  const { progress } = useStory();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  return (
    <section
      id="timeline"
      className="py-24 px-6 bg-[#04040a] relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="ga">Journey</span> Timeline
          </h2>
          <p className="text-white/60 text-lg">
            Your interactive story - click chapters to explore and unlock
            challenges
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="space-y-8"
        >
          {storyChapters.map((chapter, idx) => {
            const isCompleted = progress.currentChapter > chapter.id;
            const isCurrent = progress.currentChapter === chapter.id;
            const [fromColor, toColor] = chapter.color.split(" to-");
            const from = fromColor.split("-")[1];
            const to = toColor.split("-")[0];

            return (
              <motion.div key={chapter.id} variants={item} className="relative">
                {/* Timeline Connector */}
                {idx < storyChapters.length - 1 && (
                  <div className="absolute left-8 top-24 bottom-0 w-1 bg-gradient-to-b from-white/20 to-white/5" />
                )}

                {/* Timeline Item */}
                <div className="flex gap-8">
                  {/* Timeline Dot */}
                  <motion.div
                    animate={isCurrent ? { scale: 1.2 } : { scale: 1 }}
                    className={`flex-shrink-0 relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold ${
                      isCompleted
                        ? `bg-gradient-to-r ${chapter.color} text-white`
                        : isCurrent
                          ? `bg-gradient-to-r ${chapter.color} text-white border-2 border-white`
                          : "bg-white/10 text-white/40 border border-white/20"
                    }`}
                  >
                    {isCompleted ? "✓" : idx + 1}
                  </motion.div>

                  {/* Timeline Content */}
                  <motion.div
                    whileHover={!isCompleted && !isCurrent ? { x: 8 } : {}}
                    className={`flex-1 gc rounded-2xl p-6 border transition-all cursor-pointer ${
                      isCurrent
                        ? `border-${from}-500/50 bg-${from}-500/10`
                        : isCompleted
                          ? "border-white/10 bg-white/5"
                          : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3
                          className={`text-xl font-bold mb-1 ${
                            isCurrent
                              ? `bg-gradient-to-r ${chapter.color} bg-clip-text text-transparent`
                              : "text-white"
                          }`}
                        >
                          {chapter.title}
                        </h3>
                        <p className="text-sm text-white/60">
                          {chapter.subtitle}
                        </p>
                      </div>
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`bg-gradient-to-r ${chapter.color} bg-clip-text text-transparent font-bold`}
                        >
                          ✓
                        </motion.div>
                      )}
                    </div>
                    <p className="text-white/70 mb-4">{chapter.description}</p>

                    {/* Chapter Scenes Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <span>Scenes Completed:</span>
                        <span className="font-mono">
                          {
                            chapter.scenes.filter((s) =>
                              progress.completedScenes.includes(
                                `${chapter.id}-${s.id}`,
                              ),
                            ).length
                          }{" "}
                          / {chapter.scenes.length}
                        </span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${chapter.color}`}
                          initial={{ width: 0 }}
                          whileInView={{
                            width: `${
                              (chapter.scenes.filter((s) =>
                                progress.completedScenes.includes(
                                  `${chapter.id}-${s.id}`,
                                ),
                              ).length /
                                chapter.scenes.length) *
                              100
                            }%`,
                          }}
                          viewport={{ once: false }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    {/* Scene List */}
                    <div className="mt-4 space-y-2 text-sm">
                      {chapter.scenes.map((scene) => {
                        const sceneCompleted =
                          progress.completedScenes.includes(
                            `${chapter.id}-${scene.id}`,
                          );
                        return (
                          <motion.div
                            key={scene.id}
                            className={`flex items-center gap-2 text-white/70 ${
                              sceneCompleted ? "text-green-400" : ""
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>
                              Scene {scene.id}
                              {sceneCompleted && " ✓"}
                              {scene.challenge &&
                                ` - ${chapter.title} Challenge`}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 grid md:grid-cols-4 gap-4"
        >
          <div className="gc rounded-xl p-6 border border-white/10 text-center">
            <div className="text-sm text-white/60 mb-2">Current Chapter</div>
            <div className="text-3xl font-bold text-amber-400">
              {progress.currentChapter}
            </div>
            <div className="text-xs text-white/40 mt-2">
              of {storyChapters.length}
            </div>
          </div>
          <div className="gc rounded-xl p-6 border border-white/10 text-center">
            <div className="text-sm text-white/60 mb-2">Total XP</div>
            <motion.div
              key={progress.totalXP}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold text-cyan-400"
            >
              {progress.totalXP}
            </motion.div>
          </div>
          <div className="gc rounded-xl p-6 border border-white/10 text-center">
            <div className="text-sm text-white/60 mb-2">Challenges</div>
            <div className="text-3xl font-bold text-green-400">
              {progress.completedChallenges.length}
            </div>
          </div>
          <div className="gc rounded-xl p-6 border border-white/10 text-center">
            <div className="text-sm text-white/60 mb-2">Scenes</div>
            <div className="text-3xl font-bold text-purple-400">
              {progress.completedScenes.length}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
