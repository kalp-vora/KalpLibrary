import confetti from "canvas-confetti";

/**
 * Fires a tasteful, open-source confetti particle burst for positive milestones.
 * Follows AGENTS.md separation-of-concerns and minimalist guidelines.
 */
export function fireCelebration(options?: confetti.Options): void {
  if (typeof window === "undefined") return;
  try {
    confetti({
      particleCount: 50,
      spread: 65,
      origin: { y: 0.75 },
      colors: ["#f2be71", "#7a2632", "#38bdf8", "#86efac", "#f472b6"],
      disableForReducedMotion: true,
      ...options,
    });
  } catch {
    // Graceful fallback in environments where canvas is restricted
  }
}

/**
 * Fires an ambient dual-cannon celebratory burst for major milestones (e.g. finishing a book or film).
 */
export function fireMajorCelebration(): void {
  if (typeof window === "undefined") return;
  try {
    const end = Date.now() + 600;
    const colors = ["#f2be71", "#7a2632", "#ffffff", "#86efac"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch {
    // Graceful fallback
  }
}
