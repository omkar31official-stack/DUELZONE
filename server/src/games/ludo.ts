import { GameState } from '../types';

export interface LudoToken {
  id: number;
  pos: number; // -1 = home base, 0 to 51 = main track, 52 to 57 = home stretch, 58 = finished
  isFinished: boolean;
}

export interface LudoState extends GameState {
  scores: Record<string, number>;
  tokens: Record<string, LudoToken[]>;
  currentTurn: string;
  diceValue: number | null;
  hasRolled: boolean;
  winner: string | null;
  lastCapturedToken?: { player: string; tokenId: number };
}

export const createLudoState = (players: string[]): LudoState => {
  const tokens: Record<string, LudoToken[]> = {};
  players.forEach((pId) => {
    tokens[pId] = [
      { id: 0, pos: -1, isFinished: false },
      { id: 1, pos: -1, isFinished: false },
      { id: 2, pos: -1, isFinished: false },
    ];
  });

  const scores: Record<string, number> = {};
  players.forEach((pId) => (scores[pId] = 0));

  return {
    scores,
    tokens,
    currentTurn: players[0] || '',
    diceValue: null,
    hasRolled: false,
    winner: null,
  };
};

export const handleLudoAction = (
  state: LudoState,
  playerId: string,
  action: { type: string; payload?: any }
): LudoState => {
  if (state.winner || state.currentTurn !== playerId) return state;

  const playerKeys = Object.keys(state.tokens);
  const nextPlayer = playerKeys.find((id) => id !== playerId) || playerId;

  if (action.type === 'ROLL_DICE') {
    if (state.hasRolled) return state;
    const dice = Math.floor(Math.random() * 6) + 1;

    // Check if player has any legal move with this dice roll
    const playerTokens = state.tokens[playerId] || [];
    const canMoveAny = playerTokens.some((t) => {
      if (t.isFinished) return false;
      if (t.pos === -1) return dice === 6;
      return t.pos + dice <= 58;
    });

    if (!canMoveAny) {
      // Pass turn if no moves available
      return {
        ...state,
        diceValue: dice,
        hasRolled: false,
        currentTurn: nextPlayer,
      };
    }

    return {
      ...state,
      diceValue: dice,
      hasRolled: true,
    };
  }

  if (action.type === 'MOVE_TOKEN' && state.hasRolled && state.diceValue !== null) {
    const tokenId = action.payload?.tokenId;
    const playerTokens = state.tokens[playerId] || [];
    const token = playerTokens.find((t) => t.id === tokenId);
    if (!token || token.isFinished) return state;

    const dice = state.diceValue;

    // Leaving home base requires a 6
    if (token.pos === -1) {
      if (dice !== 6) return state;
      token.pos = 0;
    } else {
      if (token.pos + dice > 58) return state;
      token.pos += dice;
      if (token.pos === 58) {
        token.isFinished = true;
      }
    }

    // Check for capturing opponent token on main track (positions 0..51)
    let extraTurn = dice === 6;
    let captured: { player: string; tokenId: number } | undefined = undefined;

    if (token.pos >= 0 && token.pos <= 51) {
      // Safe star squares: 0, 8, 13, 21, 26, 34, 39, 47
      const isSafe = [0, 8, 13, 21, 26, 34, 39, 47].includes(token.pos);
      if (!isSafe) {
        playerKeys.forEach((otherId) => {
          if (otherId !== playerId) {
            state.tokens[otherId]?.forEach((oppToken) => {
              if (oppToken.pos === token.pos && !oppToken.isFinished) {
                oppToken.pos = -1; // Reset opponent token to home base
                captured = { player: otherId, tokenId: oppToken.id };
                extraTurn = true;
              }
            });
          }
        });
      }
    }

    // Calculate score based on finished tokens
    const finishedCount = playerTokens.filter((t) => t.isFinished).length;
    state.scores[playerId] = finishedCount * 10;

    let winner = state.winner;
    if (finishedCount === 3) {
      winner = playerId;
    }

    return {
      ...state,
      diceValue: null,
      hasRolled: false,
      currentTurn: winner ? state.currentTurn : extraTurn ? playerId : nextPlayer,
      winner,
      lastCapturedToken: captured,
    };
  }

  return state;
};
