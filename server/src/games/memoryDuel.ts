import { MemoryDuelState, MemoryCard } from '../../../shared/types';

const SYMBOLS = ['🍎','🎯','🚀','💎','🔥','⚡','🌟','🎸','🦋','🌈','🎭','🏆','🎪','🦄','🍀','🌙'];

export function createMDState(playerIds: [string, string]): MemoryDuelState {
  const pairs = SYMBOLS.slice(0, 8);
  const all = [...pairs, ...pairs];
  // Shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  const cards: MemoryCard[] = all.map((sym, i) => ({
    id: i,
    symbol: sym,
    flipped: false,
    matched: false,
  }));
  return {
    cards,
    currentTurn: playerIds[0],
    flippedCards: [],
    scores: { [playerIds[0]]: 0, [playerIds[1]]: 0 },
    winner: null,
    isDone: false,
  };
}

export function applyMDFlip(
  state: MemoryDuelState,
  playerId: string,
  cardId: number,
): { state: MemoryDuelState; matched: boolean } | null {
  if (state.isDone) return null;
  if (state.currentTurn !== playerId) return null;
  const card = state.cards[cardId];
  if (!card || card.flipped || card.matched) return null;
  if (state.flippedCards.length >= 2) return null;

  const cards = state.cards.map(c => c.id === cardId ? { ...c, flipped: true } : c);
  const flippedCards = [...state.flippedCards, cardId];
  let matched = false;
  let scores = { ...state.scores };
  let newCards = cards;
  let newFlipped = flippedCards;
  let nextTurn = state.currentTurn;

  if (flippedCards.length === 2) {
    const [a, b] = flippedCards;
    if (cards[a].symbol === cards[b].symbol) {
      matched = true;
      newCards = cards.map(c => flippedCards.includes(c.id) ? { ...c, matched: true, flipped: false } : c);
      scores[playerId] = (scores[playerId] || 0) + 1;
      newFlipped = [];
      // Player keeps their turn after a match
    } else {
      // Flip back after a delay (client handles the timing, we just reset)
      newCards = cards.map(c => flippedCards.includes(c.id) ? { ...c, flipped: false } : c);
      newFlipped = [];
      const players = Object.keys(state.scores);
      nextTurn = players.find(p => p !== playerId)!;
    }
  }

  const isDone = newCards.every(c => c.matched);
  let winner: string | null = null;
  if (isDone) {
    const players = Object.keys(scores);
    winner = scores[players[0]] > scores[players[1]] ? players[0] : scores[players[1]] > scores[players[0]] ? players[1] : null;
  }

  return {
    matched,
    state: { ...state, cards: newCards, flippedCards: newFlipped, scores, currentTurn: nextTurn, isDone, winner },
  };
}
