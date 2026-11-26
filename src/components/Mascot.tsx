import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { GENTLE_EASE } from "../lib/motion";

export type MascotMood =
  | "sleepy"
  | "sad"
  | "happy"
  | "excited"
  | "curious"
  | "cheering";

interface MascotProps {
  mood?: MascotMood;
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

const SIZE_MAP = {
  sm: 72,
  md: 96,
  lg: 118,
};

export function Mascot({
  mood = "happy",
  size = "md",
  message,
  className = "",
}: MascotProps) {
  const reducedMotion = useReducedMotion();
  const [blinking, setBlinking] = useState(false);
  const [hopCount, setHopCount] = useState(0);
  const [showTapHeart, setShowTapHeart] = useState(false);
  const [gaze, setGaze] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const id = window.setInterval(() => {
      setBlinking(true);
      window.setTimeout(() => setBlinking(false), 150);
    }, 3600);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    if (
      typeof window === "undefined" ||
      !window.matchMedia("(pointer: fine)").matches
    )
      return;

    const handleMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      setGaze({
        x: Math.max(-2.2, Math.min(2.2, nx * 2.2)),
        y: Math.max(-1.8, Math.min(1.8, ny * 1.8)),
      });
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleMove);
  }, [reducedMotion]);

  const handleTap = () => {
    setHopCount((c) => c + 1);
    setShowTapHeart(true);
    window.setTimeout(() => setShowTapHeart(false), 750);
  };

  const width = SIZE_MAP[size];
  const height = Math.round(width * 0.72);
  const isSleepy = mood === "sleepy";
  const isSad = mood === "sad";
  const isCheering = mood === "cheering" || mood === "excited";

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none ${className}`}
    >
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: GENTLE_EASE }}
          className="mb-1.5 flex min-h-[38px] max-w-[280px] items-center justify-center rounded-2xl border border-sage-200 bg-cream px-3.5 py-1.5 text-center text-xs font-semibold text-sage-800 shadow-sage-sm"
        >
          <motion.span
            key={message}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: GENTLE_EASE }}
          >
            {message}
          </motion.span>
        </motion.div>
      )}

      <motion.button
        type="button"
        onClick={handleTap}
        aria-label="leaf and flower mascot, tap to say hi"
        className="focus-ring relative flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-3xl p-1"
        animate={
          reducedMotion
            ? undefined
            : {
                y: hopCount > 0 ? [0, -10, 0] : [0, -3.5, 0],
              }
        }
        transition={
          hopCount > 0
            ? { duration: 0.6, ease: "easeInOut" }
            : { duration: 4.0, repeat: Infinity, ease: "easeInOut" }
        }
        whileTap={reducedMotion ? undefined : { scale: 0.95 }}
      >
        <AnimatePresence>
          {showTapHeart && !reducedMotion && (
            <motion.svg
              initial={{ opacity: 0, y: 4, scale: 0.65 }}
              animate={{ opacity: [0, 1, 0], y: -22, scale: 1.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.95, ease: GENTLE_EASE }}
              viewBox="0 0 24 24"
              className="pointer-events-none absolute -top-2 h-5 w-5 text-sage-600"
              aria-hidden="true"
            >
              <path
                d="M12 21s-7-4.6-7-10.2A4.3 4.3 0 0 1 9.3 6.5c1.2 0 2.2.6 2.7 1.5.5-.9 1.5-1.5 2.7-1.5A4.3 4.3 0 0 1 19 10.8C19 16.4 12 21 12 21z"
                fill="#F2CFC4"
                stroke="#647F57"
                strokeWidth="1.5"
              />
            </motion.svg>
          )}
        </AnimatePresence>

        <svg
          width={width}
          height={height}
          viewBox="0 0 140 96"
          fill="none"
          aria-hidden="true"
        >
          <ellipse
            cx="44"
            cy="86"
            rx="26"
            ry="5.5"
            fill="var(--sage-200)"
            opacity="0.65"
          />
          <ellipse
            cx="98"
            cy="86"
            rx="24"
            ry="5.5"
            fill="var(--sage-200)"
            opacity="0.65"
          />

          {/* Karakter daun */}
          <g>
            <path
              d="M44 12 C48 20 50 26 44 30 C38 26 40 20 44 12 Z"
              fill="#647F57"
            />
            <motion.path
              d="M21 56 C21 36 32 25 44 25 C56 25 67 36 67 56 C67 74 56 82 44 82 C32 82 21 74 21 56 Z"
              fill="#9CB38E"
              stroke="#4E6445"
              strokeWidth="2.5"
              animate={
                reducedMotion
                  ? undefined
                  : isSad
                    ? { rotate: [0, -3, 3, 0] }
                    : { rotate: [0, 1.5, 0] }
              }
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ transformOrigin: "44px 72px" }}
            />
            {/* Tangan melambai */}
            <motion.path
              d="M21 56 Q10 47 13 38"
              stroke="#4E6445"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              animate={
                reducedMotion
                  ? undefined
                  : isCheering
                    ? { rotate: [-12, 18, -12] }
                    : { rotate: [0, 10, 0] }
              }
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ transformOrigin: "21px 56px" }}
            />
            <circle cx="33" cy="57" r="4" fill="#F2CFC4" opacity="0.9" />
            <circle cx="55" cy="57" r="4" fill="#F2CFC4" opacity="0.9" />

            {/* Mata daun */}
            {isSleepy || blinking ? (
              <>
                <path
                  d="M32 49 Q36 52 40 49"
                  stroke="#2B3827"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <path
                  d="M48 49 Q52 52 56 49"
                  stroke="#2B3827"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </>
            ) : (
              <>
                <circle
                  cx={36 + gaze.x}
                  cy={49 + gaze.y}
                  r="2.9"
                  fill="#2B3827"
                />
                <circle
                  cx={52 + gaze.x}
                  cy={49 + gaze.y}
                  r="2.9"
                  fill="#2B3827"
                />
                <circle
                  cx={35 + gaze.x * 0.7}
                  cy={48 + gaze.y * 0.7}
                  r="1"
                  fill="#FBF8EF"
                />
                <circle
                  cx={51 + gaze.x * 0.7}
                  cy={48 + gaze.y * 0.7}
                  r="1"
                  fill="#FBF8EF"
                />
              </>
            )}

            {/* Mulut daun */}
            {isSad ? (
              <path
                d="M39 60 Q44 55 49 60"
                stroke="#2B3827"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
            ) : isSleepy ? (
              <circle cx="44" cy="58" r="2.1" fill="#2B3827" />
            ) : (
              <path
                d="M39 56 Q44 62 49 56"
                stroke="#2B3827"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </g>

          {/* Karakter bunga */}
          <g>
            {/* Kelopak atas */}
            <circle
              cx="98"
              cy="24"
              r="8"
              fill="#F2CFC4"
              stroke="#647F57"
              strokeWidth="2"
            />
            <circle
              cx="88"
              cy="31"
              r="7.5"
              fill="#F2CFC4"
              stroke="#647F57"
              strokeWidth="2"
            />
            <circle
              cx="108"
              cy="31"
              r="7.5"
              fill="#F2CFC4"
              stroke="#647F57"
              strokeWidth="2"
            />
            <circle
              cx="98"
              cy="32"
              r="5"
              fill="#FBF8EF"
              stroke="#647F57"
              strokeWidth="1.8"
            />

            <motion.path
              d="M78 58 C78 41 87 34 98 34 C109 34 118 41 118 58 C118 74 109 82 98 82 C87 82 78 74 78 58 Z"
              fill="#E6EDE1"
              stroke="#4E6445"
              strokeWidth="2.5"
              animate={
                reducedMotion
                  ? undefined
                  : isCheering
                    ? { y: [0, -3, 0] }
                    : { rotate: [0, -1.5, 0] }
              }
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ transformOrigin: "98px 72px" }}
            />
            <motion.path
              d="M118 56 Q128 47 125 38"
              stroke="#4E6445"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              animate={
                reducedMotion
                  ? undefined
                  : isCheering
                    ? { rotate: [12, -16, 12] }
                    : { rotate: [0, -9, 0] }
              }
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ transformOrigin: "118px 56px" }}
            />

            <circle cx="87" cy="59" r="3.8" fill="#F2CFC4" opacity="0.95" />
            <circle cx="109" cy="59" r="3.8" fill="#F2CFC4" opacity="0.95" />

            {isSleepy || blinking ? (
              <>
                <path
                  d="M87 52 Q90.5 55 94 52"
                  stroke="#2B3827"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <path
                  d="M102 52 Q105.5 55 109 52"
                  stroke="#2B3827"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </>
            ) : (
              <>
                <circle
                  cx={90.5 + gaze.x}
                  cy={52 + gaze.y}
                  r="2.7"
                  fill="#2B3827"
                />
                <circle
                  cx={105.5 + gaze.x}
                  cy={52 + gaze.y}
                  r="2.7"
                  fill="#2B3827"
                />
                <circle
                  cx={89.7 + gaze.x * 0.7}
                  cy={51 + gaze.y * 0.7}
                  r="0.95"
                  fill="#FBF8EF"
                />
                <circle
                  cx={104.7 + gaze.x * 0.7}
                  cy={51 + gaze.y * 0.7}
                  r="0.95"
                  fill="#FBF8EF"
                />
              </>
            )}

            {isSad ? (
              <path
                d="M93 62 Q98 57 103 62"
                stroke="#2B3827"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
            ) : isSleepy ? (
              <path
                d="M95 60 H101"
                stroke="#2B3827"
                strokeWidth="2.1"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M93 59 Q98 64 103 59"
                stroke="#2B3827"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </g>
        </svg>
      </motion.button>
    </div>
  );
}
