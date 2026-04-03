import { useEffect, useMemo, useRef, useState } from "react";

type Difficulty = "Easy" | "Medium" | "Hard";
type Phase = "idle" | "showing" | "gap" | "finished";

type Target = {
  x: number;
  y: number;
  size: number;
  color: "green" | "red";
  id: number;
  spawnedAt: number;
};

type AttentionAnalysis = {
  attention_score: number;
  focus_level: string;
  impulsivity_level: string;
  risk_level: string;
  summary_text: string;
};

function AttentionTest() {
  const GAME_DURATION = 30;
  const BOARD_WIDTH = 860;
  const BOARD_HEIGHT = 460;

  const [difficulty, setDifficulty] = useState<Difficulty>("Easy");
  const [started, setStarted] = useState(false);
  const [_phase, setPhase] = useState<Phase>("idle");
  const [showResult, setShowResult] = useState(false);

  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [lives, setLives] = useState(3);

  const [target, setTarget] = useState<Target | null>(null);
  const [targetVisible, setTargetVisible] = useState(false);
  const [_targetClicked, setTargetClicked] = useState(false);

  const [message, setMessage] = useState("Choose difficulty and start the game");
  const [feedbackType, setFeedbackType] = useState<"good" | "bad" | "neutral">("neutral");
  const [flashBoard, setFlashBoard] = useState<"good" | "bad" | null>(null);

  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [falseClicks, setFalseClicks] = useState(0);
  const [misses, setMisses] = useState(0);
  const [correctIgnores, setCorrectIgnores] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [totalGreenTargets, setTotalGreenTargets] = useState(0);
  const [avgReactionTime, setAvgReactionTime] = useState(0);

  const [analysis, setAnalysis] = useState<AttentionAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const gameTimerRef = useRef<number | null>(null);
  const roundTimeoutRef = useRef<number | null>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);

  const startedRef = useRef(false);
  const timeLeftRef = useRef(GAME_DURATION);
  const hitsRef = useRef(0);
  const falseClicksRef = useRef(0);
  const missesRef = useRef(0);
  const correctIgnoresRef = useRef(0);
  const scoreRef = useRef(0);
  const avgReactionTimeRef = useRef(0);
  const totalGreenTargetsRef = useRef(0);
  const targetClickedRef = useRef(false);

  const reactionTimesRef = useRef<number[]>([]);

  const baseSettings = useMemo(() => {
    if (difficulty === "Easy") {
      return { targetDuration: 1600, gapDuration: 700, minSize: 82, maxSize: 98 };
    }
    if (difficulty === "Hard") {
      return { targetDuration: 1050, gapDuration: 420, minSize: 62, maxSize: 76 };
    }
    return { targetDuration: 1300, gapDuration: 550, minSize: 72, maxSize: 86 };
  }, [difficulty]);

  const getAdaptiveStage = () => {
    const elapsed = GAME_DURATION - timeLeftRef.current;
    if (elapsed < 10) return 1;
    if (elapsed < 20) return 2;
    return 3;
  };

  const getAdaptiveSettings = () => {
    const stage = getAdaptiveStage();

    if (stage === 1) {
      return {
        targetDuration: baseSettings.targetDuration,
        gapDuration: baseSettings.gapDuration,
        minSize: baseSettings.minSize,
        maxSize: baseSettings.maxSize,
      };
    }

    if (stage === 2) {
      return {
        targetDuration: Math.max(850, baseSettings.targetDuration - 180),
        gapDuration: Math.max(300, baseSettings.gapDuration - 120),
        minSize: Math.max(50, baseSettings.minSize - 6),
        maxSize: Math.max(62, baseSettings.maxSize - 6),
      };
    }

    return {
      targetDuration: Math.max(700, baseSettings.targetDuration - 320),
      gapDuration: Math.max(220, baseSettings.gapDuration - 220),
      minSize: Math.max(44, baseSettings.minSize - 12),
      maxSize: Math.max(56, baseSettings.maxSize - 12),
    };
  };

  const adaptiveStage = getAdaptiveStage();

  const accuracy =
    totalGreenTargets > 0 ? Math.round((hits / totalGreenTargets) * 100) : 0;

  const level = useMemo(() => {
    if (score >= 220) return "Expert";
    if (score >= 150) return "Advanced";
    if (score >= 90) return "Intermediate";
    return "Beginner";
  }, [score]);

  const playTone = (
    frequency: number,
    duration = 0.08,
    type: OscillatorType = "sine",
    volume = 0.03
  ) => {
    try {
      const AudioCtx =
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gainNode.gain.value = volume;

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      oscillator.stop(ctx.currentTime + duration);

      oscillator.onended = () => {
        ctx.close();
      };
    } catch {
      // ignore
    }
  };

  const playGoodSound = () => {
    playTone(660, 0.06, "sine", 0.035);
    setTimeout(() => playTone(880, 0.08, "sine", 0.03), 40);
  };

  const playBadSound = () => {
    playTone(220, 0.09, "square", 0.03);
  };

  const playMissSound = () => {
    playTone(280, 0.07, "triangle", 0.025);
  };

  const setFeedback = (text: string, type: "good" | "bad" | "neutral") => {
    setMessage(text);
    setFeedbackType(type);

    if (feedbackTimeoutRef.current !== null) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    feedbackTimeoutRef.current = window.setTimeout(() => {
      setFeedbackType("neutral");
    }, 500);
  };

  const clearAllTimers = () => {
    if (gameTimerRef.current !== null) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    if (roundTimeoutRef.current !== null) {
      clearTimeout(roundTimeoutRef.current);
      roundTimeoutRef.current = null;
    }
    if (feedbackTimeoutRef.current !== null) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
  };

  const createRandomTarget = (): Target => {
    const currentSettings = getAdaptiveSettings();

    const size =
      Math.floor(Math.random() * (currentSettings.maxSize - currentSettings.minSize + 1)) +
      currentSettings.minSize;

    const x = Math.floor(Math.random() * (BOARD_WIDTH - size));
    const y = Math.floor(Math.random() * (BOARD_HEIGHT - size));
    const color = Math.random() < 0.7 ? "green" : "red";

    return {
      x,
      y,
      size,
      color,
      id: Date.now() + Math.floor(Math.random() * 10000),
      spawnedAt: Date.now(),
    };
  };

  const sendAttentionResult = async (
    finalHits: number,
    finalFalseClicks: number,
    finalMisses: number,
    finalAccuracy: number,
    finalAvgReactionTime: number,
    finalScore: number,
    finalCorrectIgnores: number
  ) => {
    try {
      setAnalysisLoading(true);

      const response = await fetch("http://127.0.0.1:8000/analyze-attention", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hits: finalHits,
          false_clicks: finalFalseClicks,
          misses: finalMisses,
          accuracy: finalAccuracy,
          avg_reaction_time: finalAvgReactionTime,
          score: finalScore,
        }),
      });

      const data = await response.json();
      setAnalysis(data);

      const fullAttentionResult = {
        ...data,
        hits: finalHits,
        false_clicks: finalFalseClicks,
        misses: finalMisses,
        correct_ignores: finalCorrectIgnores,
        accuracy: finalAccuracy,
        avg_reaction_time: finalAvgReactionTime,
        score: finalScore,
      };

      localStorage.setItem("attentionResult", JSON.stringify(fullAttentionResult));
    } catch (error) {
      console.error("Attention API Error:", error);
      setAnalysis(null);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const resetState = () => {
    clearAllTimers();
    startedRef.current = false;
    timeLeftRef.current = GAME_DURATION;
    hitsRef.current = 0;
    falseClicksRef.current = 0;
    missesRef.current = 0;
    correctIgnoresRef.current = 0;
    scoreRef.current = 0;
    avgReactionTimeRef.current = 0;
    totalGreenTargetsRef.current = 0;
    targetClickedRef.current = false;

    setStarted(false);
    setPhase("idle");
    setShowResult(false);
    setTimeLeft(GAME_DURATION);
    setLives(3);

    setTarget(null);
    setTargetVisible(false);
    setTargetClicked(false);
    setMessage("Choose difficulty and start the game");
    setFeedbackType("neutral");
    setFlashBoard(null);

    setScore(0);
    setHits(0);
    setFalseClicks(0);
    setMisses(0);
    setCorrectIgnores(0);
    setCombo(0);
    setBestCombo(0);
    setTotalGreenTargets(0);
    setAvgReactionTime(0);

    setAnalysis(null);
    setAnalysisLoading(false);

    reactionTimesRef.current = [];
  };

  const finishGame = (finalMessage: string) => {
    clearAllTimers();
    startedRef.current = false;
    setStarted(false);
    setPhase("finished");
    setTarget(null);
    setTargetVisible(false);
    setShowResult(true);
    setMessage(finalMessage);

    const finalAccuracy =
      totalGreenTargetsRef.current > 0
        ? Math.round((hitsRef.current / totalGreenTargetsRef.current) * 100)
        : 0;

    sendAttentionResult(
      hitsRef.current,
      falseClicksRef.current,
      missesRef.current,
      finalAccuracy,
      avgReactionTimeRef.current,
      scoreRef.current,
      correctIgnoresRef.current
    );
  };

  const scheduleNextRound = (gap: number) => {
    roundTimeoutRef.current = window.setTimeout(() => {
      if (startedRef.current) {
        runNextRound();
      }
    }, gap);
  };

  const handleTargetTimeout = (currentTarget: Target) => {
    if (!startedRef.current) return;

    if (currentTarget.color === "green" && !targetClickedRef.current) {
      playMissSound();
      setFlashBoard("bad");
      setTimeout(() => setFlashBoard(null), 180);

      setMisses((prev) => {
        const next = prev + 1;
        missesRef.current = next;
        return next;
      });

      setLives((prev) => {
        const next = Math.max(0, prev - 1);
        if (next <= 0) {
          setTimeout(() => finishGame("No lives left"), 0);
        }
        return next;
      });

      setCombo(0);
      setScore((prev) => {
        const next = Math.max(0, prev - 8);
        scoreRef.current = next;
        return next;
      });

      setFeedback("Missed green target!", "bad");
    }

    if (currentTarget.color === "red" && !targetClickedRef.current) {
      setCorrectIgnores((prev) => {
        const next = prev + 1;
        correctIgnoresRef.current = next;
        return next;
      });

      setFeedback("Good ignore!", "good");
    }

    setTarget(null);
    setTargetVisible(false);
    setPhase("gap");

    scheduleNextRound(getAdaptiveSettings().gapDuration);
  };

  const runNextRound = () => {
    if (!startedRef.current) return;

    setPhase("showing");
    setTargetClicked(false);
    targetClickedRef.current = false;

    const newTarget = createRandomTarget();
    setTarget(newTarget);
    setTargetVisible(false);

    setTimeout(() => {
      if (startedRef.current) {
        setTargetVisible(true);
      }
    }, 20);

    if (newTarget.color === "green") {
      setTotalGreenTargets((prev) => {
        const next = prev + 1;
        totalGreenTargetsRef.current = next;
        return next;
      });
    }

    const currentSettings = getAdaptiveSettings();

    roundTimeoutRef.current = window.setTimeout(() => {
      handleTargetTimeout(newTarget);
    }, currentSettings.targetDuration);
  };

  const startGame = () => {
    clearAllTimers();

    startedRef.current = true;
    timeLeftRef.current = GAME_DURATION;
    hitsRef.current = 0;
    falseClicksRef.current = 0;
    missesRef.current = 0;
    correctIgnoresRef.current = 0;
    scoreRef.current = 0;
    avgReactionTimeRef.current = 0;
    totalGreenTargetsRef.current = 0;
    targetClickedRef.current = false;

    setStarted(true);
    setPhase("gap");
    setShowResult(false);
    setTimeLeft(GAME_DURATION);
    setLives(3);

    setTarget(null);
    setTargetVisible(false);
    setTargetClicked(false);

    setScore(0);
    setHits(0);
    setFalseClicks(0);
    setMisses(0);
    setCorrectIgnores(0);
    setCombo(0);
    setBestCombo(0);
    setTotalGreenTargets(0);
    setAvgReactionTime(0);

    setAnalysis(null);
    setAnalysisLoading(false);

    reactionTimesRef.current = [];
    setFeedback("Click green targets. Ignore red ones.", "neutral");

    gameTimerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        timeLeftRef.current = next;

        if (next <= 0) {
          setTimeout(() => finishGame("Time up"), 0);
          return 0;
        }

        return next;
      });
    }, 1000);

    scheduleNextRound(500);
  };

  const handleTargetClick = () => {
    if (!startedRef.current || !target || targetClickedRef.current) return;

    targetClickedRef.current = true;
    setTargetClicked(true);

    if (roundTimeoutRef.current !== null) {
      clearTimeout(roundTimeoutRef.current);
    }

    if (target.color === "green") {
      const reactionTime = Date.now() - target.spawnedAt;
      reactionTimesRef.current.push(reactionTime);

      const average =
        reactionTimesRef.current.reduce((sum, value) => sum + value, 0) /
        reactionTimesRef.current.length;

      const roundedAverage = Math.round(average);
      avgReactionTimeRef.current = roundedAverage;
      setAvgReactionTime(roundedAverage);

      const newCombo = combo + 1;
      const comboBonus = Math.min(newCombo * 2, 16);
      const reactionBonus =
        reactionTime <= 500 ? 10 : reactionTime <= 800 ? 6 : reactionTime <= 1100 ? 3 : 1;

      playGoodSound();
      setFlashBoard("good");
      setTimeout(() => setFlashBoard(null), 180);

      setHits((prev) => {
        const next = prev + 1;
        hitsRef.current = next;
        return next;
      });

      setCombo(newCombo);
      setBestCombo((prev) => (newCombo > prev ? newCombo : prev));

      setScore((prev) => {
        const next = prev + 15 + comboBonus + reactionBonus;
        scoreRef.current = next;
        return next;
      });

      setFeedback(`Good hit! ${reactionTime} ms`, "good");
    } else {
      playBadSound();
      setFlashBoard("bad");
      setTimeout(() => setFlashBoard(null), 180);

      setFalseClicks((prev) => {
        const next = prev + 1;
        falseClicksRef.current = next;
        return next;
      });

      setLives((prev) => {
        const next = Math.max(0, prev - 1);
        if (next <= 0) {
          setTimeout(() => finishGame("No lives left"), 0);
        }
        return next;
      });

      setCombo(0);

      setScore((prev) => {
        const next = Math.max(0, prev - 10);
        scoreRef.current = next;
        return next;
      });

      setFeedback("Wrong target!", "bad");
    }

    setTarget(null);
    setTargetVisible(false);
    setPhase("gap");

    scheduleNextRound(getAdaptiveSettings().gapDuration);
  };

  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!startedRef.current) return;

    const clickedElement = e.target as HTMLElement;
    if (clickedElement.tagName !== "BUTTON") {
      playBadSound();
      setCombo(0);
      setScore((prev) => {
        const next = Math.max(0, prev - 2);
        scoreRef.current = next;
        return next;
      });
      setFeedback("Empty click", "bad");
      setFlashBoard("bad");
      setTimeout(() => setFlashBoard(null), 120);
    }
  };

  useEffect(() => {
    return () => {
      clearAllTimers();
      startedRef.current = false;
    };
  }, []);

  const timerPercent = (timeLeft / GAME_DURATION) * 100;

  const feedbackClass =
    feedbackType === "good"
      ? "bg-green-100 text-green-700 border-green-300"
      : feedbackType === "bad"
      ? "bg-red-100 text-red-700 border-red-300"
      : "bg-white text-gray-600 border-gray-200";

  const boardFlashClass =
    flashBoard === "good"
      ? "ring-4 ring-green-300"
      : flashBoard === "bad"
      ? "ring-4 ring-red-300"
      : "";

  return (
    <div className="max-w-7xl mx-auto pt-8 px-4 pb-10">
      <div className="bg-white rounded-[28px] shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-blue-600 px-8 py-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Attention Arena</h1>
              <p className="text-white/90 text-lg">
                Corrected Go / No-Go game with proper logic and adaptive difficulty
              </p>
            </div>

            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 min-w-[290px]">
              <p className="text-sm text-white/80 mb-2">Base Difficulty</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setDifficulty("Easy")}
                  className={
                    difficulty === "Easy"
                      ? "px-4 py-2 rounded-xl bg-white text-purple-700 font-bold"
                      : "px-4 py-2 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30"
                  }
                >
                  Easy
                </button>
                <button
                  onClick={() => setDifficulty("Medium")}
                  className={
                    difficulty === "Medium"
                      ? "px-4 py-2 rounded-xl bg-white text-purple-700 font-bold"
                      : "px-4 py-2 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30"
                  }
                >
                  Medium
                </button>
                <button
                  onClick={() => setDifficulty("Hard")}
                  className={
                    difficulty === "Hard"
                      ? "px-4 py-2 rounded-xl bg-white text-purple-700 font-bold"
                      : "px-4 py-2 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30"
                  }
                >
                  Hard
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {!started && !showResult && (
            <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-3xl p-8">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                  Corrected Attention Module
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  Green not clicked = miss. Red not clicked = correct ignore. Difficulty increases across stages.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-7">
                  <div className="bg-white rounded-2xl border p-4">
                    <p className="text-xl mb-2">Green</p>
                    <p className="font-semibold text-gray-800">Click</p>
                    <p className="text-sm text-gray-500">Otherwise it is a miss</p>
                  </div>

                  <div className="bg-white rounded-2xl border p-4">
                    <p className="text-xl mb-2">Red</p>
                    <p className="font-semibold text-gray-800">Ignore</p>
                    <p className="text-sm text-gray-500">Ignoring is correct</p>
                  </div>

                  <div className="bg-white rounded-2xl border p-4">
                    <p className="text-xl mb-2">Adaptive</p>
                    <p className="font-semibold text-gray-800">3 Stages</p>
                    <p className="text-sm text-gray-500">Gets harder over time</p>
                  </div>

                  <div className="bg-white rounded-2xl border p-4">
                    <p className="text-xl mb-2">Analysis</p>
                    <p className="font-semibold text-gray-800">Backend scoring</p>
                    <p className="text-sm text-gray-500">Focus and risk level</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={startGame}
                    className="px-8 py-4 rounded-2xl bg-purple-600 text-white text-lg font-bold hover:bg-purple-700 shadow-lg"
                  >
                    Start Game
                  </button>

                  <div className="px-5 py-4 rounded-2xl bg-white border text-gray-700 font-semibold">
                    Selected Base Mode: {difficulty}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-10 gap-4 mb-6">
            <div className="rounded-2xl border bg-gray-50 p-4">
              <p className="text-sm text-gray-500 mb-1">Time</p>
              <p className="text-3xl font-bold text-gray-900">{timeLeft}s</p>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-4">
              <p className="text-sm text-gray-500 mb-1">Lives</p>
              <p className="text-3xl font-bold text-pink-600">{lives}</p>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-4">
              <p className="text-sm text-gray-500 mb-1">Score</p>
              <p className="text-3xl font-bold text-purple-600">{score}</p>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-4">
              <p className="text-sm text-gray-500 mb-1">Hits</p>
              <p className="text-3xl font-bold text-green-600">{hits}</p>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-4">
              <p className="text-sm text-gray-500 mb-1">Wrong</p>
              <p className="text-3xl font-bold text-red-600">{falseClicks}</p>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-4">
              <p className="text-sm text-gray-500 mb-1">Misses</p>
              <p className="text-3xl font-bold text-yellow-600">{misses}</p>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-4">
              <p className="text-sm text-gray-500 mb-1">Correct Ignores</p>
              <p className="text-3xl font-bold text-teal-600">{correctIgnores}</p>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-4">
              <p className="text-sm text-gray-500 mb-1">Combo</p>
              <p className="text-3xl font-bold text-blue-600">x{combo}</p>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-4">
              <p className="text-sm text-gray-500 mb-1">Avg RT</p>
              <p className="text-3xl font-bold text-indigo-600">
                {avgReactionTime > 0 ? `${avgReactionTime}` : "-"}
              </p>
              <p className="text-xs text-gray-400 mt-1">ms</p>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-4">
              <p className="text-sm text-gray-500 mb-1">Stage</p>
              <p className="text-3xl font-bold text-orange-600">{adaptiveStage}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Match Progress</span>
              <span className={`px-3 py-1 rounded-full border text-sm font-medium ${feedbackClass}`}>
                {message}
              </span>
            </div>
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden border">
              <div
                className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all duration-500"
                style={{ width: `${timerPercent}%` }}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <div
              onClick={handleBoardClick}
              className={`relative rounded-[32px] border-4 border-gray-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-inner overflow-hidden transition-all duration-200 ${boardFlashClass}`}
              style={{ width: `${BOARD_WIDTH}px`, height: `${BOARD_HEIGHT}px` }}
            >
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-5 left-5 text-sm font-medium text-gray-400">
                  Focus Zone
                </div>
                <div className="absolute top-5 right-5 text-sm font-medium text-gray-400">
                  Base Mode: {difficulty}
                </div>
                <div className="absolute bottom-5 left-5 text-sm font-medium text-gray-400">
                  Level: {level}
                </div>
                <div className="absolute bottom-5 right-5 text-sm font-medium text-gray-400">
                  Accuracy: {accuracy}%
                </div>
              </div>

              <div className="absolute top-1/2 left-4 -translate-y-1/2 text-xs text-gray-300 font-semibold rotate-[-90deg]">
                Stage {adaptiveStage}
              </div>

              {started && target && (
                <button
                  onClick={handleTargetClick}
                  className={`absolute rounded-full shadow-2xl transition-all duration-150 hover:scale-105 active:scale-95 ${
                    target.color === "green"
                      ? "bg-green-500 ring-8 ring-green-200"
                      : "bg-red-500 ring-8 ring-red-200"
                  } ${targetVisible ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
                  style={{
                    left: `${target.x}px`,
                    top: `${target.y}px`,
                    width: `${target.size}px`,
                    height: `${target.size}px`,
                    boxShadow:
                      target.color === "green"
                        ? "0 0 34px rgba(34,197,94,0.48)"
                        : "0 0 34px rgba(239,68,68,0.40)",
                  }}
                />
              )}

              {started && !target && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="px-6 py-3 rounded-2xl bg-white/80 border shadow text-gray-500 font-semibold animate-pulse">
                    Get ready...
                  </div>
                </div>
              )}

              {!started && !showResult && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <div className="text-6xl mb-4">Focus</div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">
                    Best Functioning Focus Challenge
                  </h3>
                  <p className="text-gray-500 text-lg">
                    Correct rules. Correct summary. Real adaptive stages.
                  </p>
                </div>
              )}

              {showResult && (
                <div className="absolute inset-0 bg-white/85 backdrop-blur-sm overflow-y-auto">
                  <div className="min-h-full flex items-center justify-center p-6">
                    <div className="w-full max-w-[620px] bg-white rounded-3xl border shadow-2xl p-8 text-center">
                      <h2 className="text-3xl font-bold text-purple-600 mb-4">
                        Match Result
                      </h2>

                      <div className="grid grid-cols-2 gap-3 text-left mb-5">
                        <div className="rounded-xl border bg-gray-50 p-3">
                          <p className="text-sm text-gray-500">Score</p>
                          <p className="text-xl font-bold text-purple-600">{score}</p>
                        </div>
                        <div className="rounded-xl border bg-gray-50 p-3">
                          <p className="text-sm text-gray-500">Accuracy</p>
                          <p className="text-xl font-bold text-blue-600">{accuracy}%</p>
                        </div>
                        <div className="rounded-xl border bg-gray-50 p-3">
                          <p className="text-sm text-gray-500">Hits</p>
                          <p className="text-xl font-bold text-green-600">{hits}</p>
                        </div>
                        <div className="rounded-xl border bg-gray-50 p-3">
                          <p className="text-sm text-gray-500">Wrong Clicks</p>
                          <p className="text-xl font-bold text-red-600">{falseClicks}</p>
                        </div>
                        <div className="rounded-xl border bg-gray-50 p-3">
                          <p className="text-sm text-gray-500">Misses</p>
                          <p className="text-xl font-bold text-yellow-600">{misses}</p>
                        </div>
                        <div className="rounded-xl border bg-gray-50 p-3">
                          <p className="text-sm text-gray-500">Correct Ignores</p>
                          <p className="text-xl font-bold text-teal-600">{correctIgnores}</p>
                        </div>
                        <div className="rounded-xl border bg-gray-50 p-3">
                          <p className="text-sm text-gray-500">Best Combo</p>
                          <p className="text-xl font-bold text-pink-600">x{bestCombo}</p>
                        </div>
                        <div className="rounded-xl border bg-gray-50 p-3">
                          <p className="text-sm text-gray-500">Attention Score</p>
                          <p className="text-xl font-bold text-orange-600">
                            {analysis ? analysis.attention_score : "-"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 border p-4 mb-5 text-left">
                        <p className="text-sm text-gray-500 mb-2">Behavior Summary</p>

                        {analysisLoading && (
                          <p className="text-gray-700">Analyzing attention performance...</p>
                        )}

                        {!analysisLoading && analysis && (
                          <>
                            <p className="font-semibold text-gray-800 mb-2">{analysis.summary_text}</p>
                            <p className="text-sm text-gray-600">
                              Focus Level: <span className="font-semibold">{analysis.focus_level}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Impulsivity Level: <span className="font-semibold">{analysis.impulsivity_level}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Risk Level: <span className="font-semibold">{analysis.risk_level}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Local Level: <span className="font-semibold">{level}</span>
                            </p>
                          </>
                        )}

                        {!analysisLoading && !analysis && (
                          <p className="text-red-600">
                            Could not fetch backend attention analysis.
                          </p>
                        )}
                      </div>

                      <div className="flex justify-center gap-3 flex-wrap">
                        <button
                          onClick={startGame}
                          className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-bold hover:bg-purple-700"
                        >
                          Play Again
                        </button>
                        <button
                          onClick={resetState}
                          className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttentionTest;
