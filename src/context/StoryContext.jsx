import { createContext, useState, useContext, useEffect } from "react";

const StoryContext = createContext();

export function StoryProvider({ children }) {
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem("storyProgress");
    return saved
      ? JSON.parse(saved)
      : {
          currentChapter: 1,
          completedScenes: [],
          completedChallenges: [],
          achievements: [],
          totalXP: 0,
          storyMode: true,
        };
  });

  useEffect(() => {
    localStorage.setItem("storyProgress", JSON.stringify(progress));
  }, [progress]);

  const completeScene = (chapterId, sceneId) => {
    const sceneKey = `${chapterId}-${sceneId}`;
    setProgress((p) => ({
      ...p,
      completedScenes: [...new Set([...p.completedScenes, sceneKey])],
      currentChapter: Math.max(p.currentChapter, chapterId),
    }));
  };

  const completeChallenge = (challengeId, xp) => {
    setProgress((p) => ({
      ...p,
      completedChallenges: [
        ...new Set([...p.completedChallenges, challengeId]),
      ],
      totalXP: p.totalXP + xp,
    }));
  };

  const unlockAchievement = (achievementId) => {
    setProgress((p) => ({
      ...p,
      achievements: [...new Set([...p.achievements, achievementId])],
    }));
  };

  const resetProgress = () => {
    setProgress({
      currentChapter: 1,
      completedScenes: [],
      completedChallenges: [],
      achievements: [],
      totalXP: 0,
      storyMode: true,
    });
  };

  return (
    <StoryContext.Provider
      value={{
        progress,
        completeScene,
        completeChallenge,
        unlockAchievement,
        resetProgress,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
}

export const useStory = () => {
  const context = useContext(StoryContext);
  if (!context) throw new Error("useStory must be used within StoryProvider");
  return context;
};
