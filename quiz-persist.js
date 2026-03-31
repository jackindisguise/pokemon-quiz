(function (global) {
  const PREFIX = "pokemonQuiz.";
  const MAX_HISTORY = 400;

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      const v = JSON.parse(raw);
      return v !== null && typeof v === "object" ? v : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota / private mode */
    }
  }

  function settingsKey(quizId) {
    return PREFIX + quizId + ".settings";
  }

  function statsKey(quizId) {
    return PREFIX + quizId + ".stats";
  }

  global.QuizPersist = {
    loadSettings(quizId, defaults) {
      const stored = readJSON(settingsKey(quizId), {});
      return { ...defaults, ...stored };
    },

    saveSettings(quizId, settings) {
      writeJSON(settingsKey(quizId), settings);
    },

    loadStats(quizId) {
      const defaults = {
        currentStreak: 0,
        bestStreak: 0,
        totalAnswered: 0,
        totalCorrect: 0,
        history: [],
      };
      const stored = readJSON(statsKey(quizId), {});
      const history = Array.isArray(stored.history)
        ? stored.history.slice(-MAX_HISTORY)
        : [];
      return {
        ...defaults,
        ...stored,
        history,
      };
    },

    saveStats(quizId, stats) {
      const history = Array.isArray(stats.history)
        ? stats.history.slice(-MAX_HISTORY)
        : [];
      writeJSON(statsKey(quizId), { ...stats, history });
    },

    MAX_HISTORY,
  };
})(typeof window !== "undefined" ? window : globalThis);
