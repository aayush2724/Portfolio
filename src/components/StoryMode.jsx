import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStory } from "../context/StoryContext";
import { storyChapters, challenges } from "../data/storyData";
import CodingChallenge from "./CodingChallenge";

export default function StoryMode() {
  const {
    progress,
    completeScene,
    completeChallenge,
    unlockAchievement,
    resetProgress,
  } = useStory();
  const [currentChapter, setCurrentChapter] = useState(progress.currentChapter);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeComplete, setChallengeComplete] = useState(false);

  const chapter = storyChapters[currentChapter - 1];
  const scene = chapter?.scenes[currentSceneIndex];
  const currentChallenge = scene?.challenge
    ? challenges[scene.challenge]
    : null;
  const isSceneCompleted = progress.completedScenes.includes(
    `${currentChapter}-${currentSceneIndex + 1}`,
  );

  const handleNextScene = () => {
    if (currentSceneIndex < chapter.scenes.length - 1) {
      completeScene(currentChapter, currentSceneIndex + 1);
      setCurrentSceneIndex(currentSceneIndex + 1);
      setShowChallenge(false);
      setChallengeComplete(false);
    } else if (currentChapter < storyChapters.length) {
      setCurrentChapter(currentChapter + 1);
      setCurrentSceneIndex(0);
      setShowChallenge(false);
      setChallengeComplete(false);
    }
  };

  const handleChallengeComplete = (xp) => {
    completeChallenge(currentChallenge.id, xp);
    completeScene(currentChapter, currentSceneIndex + 1);
    setChallengeComplete(true);
  };

  if (!chapter) return null;

  const [, to] = chapter.color.split(" to-");
  const toColor = to ? to.split("-")[0] : "amber";
  const fromColor = chapter.color.split("-")[1].split(" ")[0];

  return (
    <div
      id="story"
      className="min-h-screen bg-[#04040a] relative overflow-hidden"
    >
      {/* Background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-${fromColor}-500/10 to-${toColor}-600/10 pointer-events-none`}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        {/* Chapter Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            className={`text-sm font-mono tracking-widest mb-4 bg-gradient-to-r ${chapter.color} bg-clip-text text-transparent`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            CHAPTER {currentChapter}
          </motion.div>
          <h1 className="text-5xl font-bold mb-4">{chapter.title}</h1>
          <p className="text-lg text-white/60">{chapter.description}</p>
        </motion.div>

        {/* Story Content */}
        <AnimatePresence mode="wait">
          {!showChallenge ? (
            <motion.div
              key={`scene-${currentChapter}-${currentSceneIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              {/* Scene Text */}
              <div className="gc rounded-2xl p-8 mb-8 min-h-32 flex flex-col justify-between">
                <p className="text-xl leading-relaxed text-white/80">
                  {scene?.text}
                </p>
                {isSceneCompleted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-amber-400 font-semibold flex items-center gap-2"
                  >
                    ✓ Scene Completed
                  </motion.div>
                )}
              </div>

              {/* Challenge CTA or Next Button */}
              {currentChallenge && !isSceneCompleted && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowChallenge(true)}
                  className="w-full gc rounded-xl py-4 mb-4 border border-amber-500/50 hover:border-amber-400 hover:bg-amber-500/10 transition-all"
                >
                  <motion.span
                    animate={{ opacity: [0.6, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Start Challenge: {currentChallenge.title}
                  </motion.span>
                </motion.button>
              )}

              {(isSceneCompleted || !currentChallenge) && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNextScene}
                  disabled={
                    currentChapter === storyChapters.length &&
                    currentSceneIndex === chapter.scenes.length - 1
                  }
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:from-white/20 disabled:to-white/20 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all"
                >
                  {currentChapter === storyChapters.length &&
                  currentSceneIndex === chapter.scenes.length - 1
                    ? "Journey Complete! 🎉"
                    : "Continue Story →"}
                </motion.button>
              )}
            </motion.div>
          ) : (
            <CodingChallenge
              challenge={currentChallenge}
              onComplete={handleChallengeComplete}
              onBack={() => setShowChallenge(false)}
            />
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        <motion.div className="mt-16">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-white/60">Story Progress</span>
            <span className="text-sm font-mono text-amber-400">
              Chapter {currentChapter}/{storyChapters.length}
            </span>
          </div>
          <div className="h-2 gc rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${chapter.color}`}
              initial={{ width: 0 }}
              animate={{
                width: `${(currentChapter / storyChapters.length) * 100}%`,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="gc rounded-xl p-4 text-center">
            <div className="text-sm text-white/60 mb-1">Total XP</div>
            <motion.div
              className="text-2xl font-bold text-amber-400"
              key={progress.totalXP}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3 }}
            >
              {progress.totalXP}
            </motion.div>
          </div>
          <div className="gc rounded-xl p-4 text-center">
            <div className="text-sm text-white/60 mb-1">Challenges</div>
            <div className="text-2xl font-bold text-cyan-400">
              {progress.completedChallenges.length}
            </div>
          </div>
          <div className="gc rounded-xl p-4 text-center">
            <div className="text-sm text-white/60 mb-1">Achievements</div>
            <div className="text-2xl font-bold text-purple-400">
              {progress.achievements.length}
            </div>
          </div>
        </motion.div>

        {/* Reset Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (
              window.confirm("Reset story progress? This cannot be undone.")
            ) {
              resetProgress();
              setCurrentChapter(1);
              setCurrentSceneIndex(0);
              setShowChallenge(false);
            }
          }}
          className="mt-8 w-full text-center py-3 text-white/40 hover:text-white/70 transition-colors text-sm font-mono border border-white/10 rounded-lg hover:border-white/20"
        >
          ↻ Reset Story Progress
        </motion.button>
      </div>
    </div>
  );
}
