import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

export const DEFAULT_PATTERN = { inhale: 4, hold: 4, exhale: 4, rest: 4 };
export const DEFAULT_CYCLES = 5;
const ORDER = ['inhale', 'hold', 'exhale', 'rest'];

// Pure: given the current phase, return the next phase, cycle, and whether the session ended.
export function advance(phase, cycle, cycles) {
  const idx = ORDER.indexOf(phase);
  if (idx < ORDER.length - 1) return { phase: ORDER[idx + 1], cycle, finished: false };
  if (cycle >= cycles) return { phase: 'completed', cycle, finished: true };
  return { phase: 'inhale', cycle: cycle + 1, finished: false };
}

const initial = { phase: 'ready', cycle: 1, remaining: 0, elapsedSec: 0, running: false };

// All transitions are pure. Timing side effects (the interval) live in the hook's effect.
function reducer(state, action) {
  switch (action.type) {
    case 'start':
      return { phase: 'inhale', cycle: 1, remaining: action.pattern.inhale, elapsedSec: 0, running: true };
    case 'pause':
      return { ...state, running: false };
    case 'resume':
      return state.phase === 'ready' || state.phase === 'completed' ? state : { ...state, running: true };
    case 'restart':
      return initial;
    case 'tick': {
      if (!state.running) return state;
      const elapsedSec = state.elapsedSec + 1;
      if (state.remaining > 1) return { ...state, elapsedSec, remaining: state.remaining - 1 };
      const next = advance(state.phase, state.cycle, action.cycles);
      if (next.finished) {
        return { ...state, elapsedSec, phase: 'completed', remaining: 0, running: false };
      }
      return { ...state, elapsedSec, phase: next.phase, cycle: next.cycle, remaining: action.pattern[next.phase] };
    }
    default:
      return state;
  }
}

/**
 * Breathing session with one-second ticks.
 * - The interval is cleared on pause, completion and unmount.
 * - onComplete fires exactly once per session, even under React StrictMode.
 */
export function useBreathingSession({ pattern = DEFAULT_PATTERN, cycles = DEFAULT_CYCLES, onComplete } = {}) {
  const [state, dispatch] = useReducer(reducer, initial);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const firedRef = useRef(false);

  const totalSec = useMemo(() => cycles * ORDER.reduce((s, k) => s + pattern[k], 0), [cycles, pattern]);

  useEffect(() => {
    if (!state.running) return undefined;
    const id = setInterval(() => dispatch({ type: 'tick', pattern, cycles }), 1000);
    return () => clearInterval(id);
  }, [state.running, pattern, cycles]);

  useEffect(() => {
    if (state.phase === 'completed' && !firedRef.current) {
      firedRef.current = true;
      onCompleteRef.current?.({ elapsedSec: state.elapsedSec, cycles });
    }
  }, [state.phase, state.elapsedSec, cycles]);

  const start = useCallback(() => {
    firedRef.current = false;
    dispatch({ type: 'start', pattern });
  }, [pattern]);
  const pause = useCallback(() => dispatch({ type: 'pause' }), []);
  const resume = useCallback(() => dispatch({ type: 'resume' }), []);
  const restart = useCallback(() => {
    firedRef.current = false;
    dispatch({ type: 'restart' });
  }, []);

  return {
    phase: state.phase,
    cycle: state.cycle,
    cycles,
    remaining: state.remaining,
    elapsedSec: state.elapsedSec,
    totalSec,
    running: state.running,
    started: state.phase !== 'ready',
    completed: state.phase === 'completed',
    start,
    pause,
    resume,
    restart,
  };
}
