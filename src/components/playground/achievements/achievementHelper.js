export const ACHIEVEMENTS = {
  FIRST_VISITOR: {
    id: "first-visitor",
    title: "Playground Explorer",
    description: "Entered the Interactive Fun Zone.",
    icon: "🚀",
  },
  PLAY_5_GAMES: {
    id: "play-5-games",
    title: "Arcade Gamer",
    description: "Played 5 games in the Fun Zone.",
    icon: "🎮",
  },
  QUIZ_MASTER: {
    id: "quiz-master",
    title: "Quiz Master",
    description: "Got a perfect score on any developer quiz.",
    icon: "🏆",
  },
  DEBUGGING_EXPERT: {
    id: "debugging-expert",
    title: "Debugging Expert",
    description: "Identified the bug in all debug snippets.",
    icon: "🐛",
  },
  PLAYGROUND_EXPLORER: {
    id: "playground-explorer",
    title: "Tech Explorer",
    description: "Interacted with all interactive experiments.",
    icon: "🧪",
  },
  SECRET_HUNTER: {
    id: "secret-hunter",
    title: "Secret Hunter",
    description: "Discovered a hidden Easter egg.",
    icon: "🕵️‍♂️",
  },
  GUESTBOOK_SIGNATURE: {
    id: "guestbook-signature",
    title: "Vibe Checker",
    description: "Signed the real-time guestbook.",
    icon: "✍️",
  },
  GIT_ESCAPE_EXPERT: {
    id: "git-escape-expert",
    title: "Merge Master",
    description: "Successfully resolved all merge conflict levels.",
    icon: "🔀",
  },
};

export const getUnlockedAchievements = () => {
  try {
    const data = localStorage.getItem("pg_achievements");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const unlockAchievement = (id) => {
  const current = getUnlockedAchievements();
  if (current.includes(id)) return false; // already unlocked

  const newAchievements = [...current, id];
  localStorage.setItem("pg_achievements", JSON.stringify(newAchievements));

  // Find achievement details
  const ach = Object.values(ACHIEVEMENTS).find((a) => a.id === id);
  if (ach) {
    // Dispatch a custom event to notify toast manager
    const event = new CustomEvent("achievement-unlocked", { detail: ach });
    window.dispatchEvent(event);
    return true;
  }
  return false;
};

export const trackGamePlayed = (gameId) => {
  try {
    const playedGames = JSON.parse(localStorage.getItem("pg_played_games") || "[]");
    if (!playedGames.includes(gameId)) {
      playedGames.push(gameId);
      localStorage.setItem("pg_played_games", JSON.stringify(playedGames));
    }
    if (playedGames.length >= 5) {
      unlockAchievement("play-5-games");
    }
  } catch (e) {
    console.error(e);
  }
};

export const trackExperimentInteracted = (expId) => {
  try {
    const interacted = JSON.parse(localStorage.getItem("pg_interacted_exps") || "[]");
    if (!interacted.includes(expId)) {
      interacted.push(expId);
      localStorage.setItem("pg_interacted_exps", JSON.stringify(interacted));
    }
    if (interacted.length >= 4) {
      unlockAchievement("playground-explorer");
    }
  } catch (e) {
    console.error(e);
  }
};
