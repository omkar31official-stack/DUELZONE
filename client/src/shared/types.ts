// ─────────────────────────────────────────────
//  DUELZONE – Shared Types
// ─────────────────────────────────────────────

export type GameId =
  | 'find-match'
  | 'tic-tac-toe'
  | 'connect-four'
  | 'rock-paper-scissors'
  | 'reaction-duel'
  | 'quick-tap'
  | 'memory-duel'
  | 'number-battle'
  | 'color-clash'
  | 'dots-and-boxes'
  | 'tap-royale'
  | 'target-rush'
  | 'word-scramble'
  | 'trivia-blitz'
  | 'speed-math'
  | 'pattern-master'
  | 'pic-combo'
  | 'archery'
  | 'bowling'
  | 'hammer'
  | 'animal-balance'
  | 'ping-ball'
  | 'knife-thrower'
  | 'fruit-ninja'
  | 'cornhole'
  | 'chain-reaction'
  | 'coop-puzzle'
  | 'water-sort'
  | 'sudoku'
  | '2048';

export type GameCategory = 'REACTION' | 'STRATEGY' | 'BOARD' | 'ARCADE' | 'QUICK' | 'PARTY' | 'MIND';

export interface GameDefinitionMeta {
  id: GameId;
  name: string;
  description: string;
  category: GameCategory;
  minPlayers: number;
  maxPlayers: number;
  estimatedMinutes: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  icon: string; // emoji fallback
}

// ─── Players ──────────────────────────────────
export interface Player {
  id: string;           // server-generated
  socketId: string;
  name: string;
  avatarSeed: string;
  accentColor: string;
  isHost: boolean;
  isConnected: boolean;
  gamesWon: number;
}

export type PlayerSlot = 1 | 2;

// ─── Room ─────────────────────────────────────
export type RoomStatus = 'waiting' | 'lobby' | 'playing' | 'finished';

export interface Room {
  code: string;
  status: RoomStatus;
  players: Player[];
  selectedGame: GameId | null;
  gameState: unknown;
  createdAt: number;
  lastActivity: number;
}

// ─── Socket Events ────────────────────────────
export interface ServerToClientEvents {
  'room:update': (room: RoomSnapshot) => void;
  'room:error': (msg: string) => void;
  'game:state': (state: unknown) => void;
  'game:event': (event: GameEvent) => void;
  'chat:message': (msg: ChatMessage) => void;
  'player:reconnected': (playerId: string) => void;
  'room:closed': (reason: string) => void;
  'webrtc:offer': (payload: { senderId: string; offer: unknown }) => void;
  'webrtc:answer': (payload: { senderId: string; answer: unknown }) => void;
  'webrtc:ice-candidate': (payload: { senderId: string; candidate: unknown }) => void;
}

export interface ClientToServerEvents {
  'room:create': (payload: { playerName: string }, cb: (res: RoomCreateResponse) => void) => void;
  'room:join': (payload: { code: string; playerName: string }, cb: (res: RoomJoinResponse) => void) => void;
  'room:reconnect': (payload: { code: string; playerId: string }, cb: (res: RoomJoinResponse) => void) => void;
  'room:selectGame': (payload: { gameId: GameId }) => void;
  'room:startGame': () => void;
  'room:returnToLobby': () => void;
  'game:action': (payload: GameAction) => void;
  'chat:send': (payload: { text?: string; emote?: string }) => void;
  'webrtc:offer': (payload: { targetId: string; offer: unknown }) => void;
  'webrtc:answer': (payload: { targetId: string; answer: unknown }) => void;
  'webrtc:ice-candidate': (payload: { targetId: string; candidate: unknown }) => void;
}

export interface InterServerEvents {}
export interface SocketData {
  playerId: string;
  roomCode: string;
}

// ─── Response shapes ──────────────────────────
export interface RoomCreateResponse {
  ok: boolean;
  error?: string;
  room?: RoomSnapshot;
  player?: Player;
}

export interface RoomJoinResponse {
  ok: boolean;
  error?: string;
  room?: RoomSnapshot;
  player?: Player;
}

export interface RoomSnapshot {
  code: string;
  status: RoomStatus;
  players: Player[];
  selectedGame: GameId | null;
  gameState: unknown;
}

// ─── Game Actions / Events ────────────────────
export interface GameAction {
  type: string;
  payload?: unknown;
}

export interface GameEvent {
  type: string;
  payload?: unknown;
}

// ─── Chat ─────────────────────────────────────
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text?: string;
  emote?: string;
  timestamp: number;
}

// ─── Find Match ───────────────────────────────
export interface FindMatchSymbol {
  id: string;
  x: number;   // 0-1 relative
  y: number;
  size: number; // 0-1 relative scale
  rotation: number;
}

export interface FindMatchRoundState {
  round: number;
  totalRounds: number;
  commonSymbolId: string;
  player1Symbols: FindMatchSymbol[];
  player2Symbols: FindMatchSymbol[];
  startedAt: number | null;   // server timestamp
  phase: 'countdown' | 'playing' | 'result';
  winner: string | null;  // playerId
  scores: Record<string, number>;
  difficulty: 'easy' | 'normal' | 'hard' | 'insane';
}

// ─── Tic Tac Toe ──────────────────────────────
export interface TicTacToeState {
  board: (string | null)[];  // 9 cells, playerId or null
  currentTurn: string;       // playerId
  winner: string | null;
  isDraw: boolean;
  scores: Record<string, number>;
  round: number;
}

// ─── Connect Four ─────────────────────────────
export interface ConnectFourState {
  board: (string | null)[][];  // [row][col], playerId or null
  currentTurn: string;
  winner: string | null;
  isDraw: boolean;
  scores: Record<string, number>;
  winningCells: [number, number][];
}

// ─── Rock Paper Scissors ──────────────────────
export type RPSChoice = 'rock' | 'paper' | 'scissors';

export interface RPSState {
  round: number;
  totalRounds: number;
  choices: Record<string, RPSChoice | null>;
  revealed: boolean;
  roundWinner: string | null;
  scores: Record<string, number>;
  gameWinner: string | null;
}

// ─── Reaction Duel ────────────────────────────
export interface ReactionDuelState {
  round: number;
  totalRounds: number;
  phase: 'waiting' | 'ready' | 'go' | 'result';
  goTime: number | null;
  reactions: Record<string, number | 'false-start' | null>;
  roundWinner: string | null;
  scores: Record<string, number>;
  gameWinner: string | null;
  reactionTimes: Record<string, number[]>;
}

// ─── Quick Tap ────────────────────────────────
export interface QuickTapState {
  phase: 'countdown' | 'playing' | 'result';
  startTime: number | null;
  endTime: number | null;
  tapCounts: Record<string, number>;
  winner: string | null;
}

// ─── Memory Duel ──────────────────────────────
export interface MemoryCard {
  id: number;
  symbol: string;
  flipped: boolean;
  matched: boolean;
}

export interface MemoryDuelState {
  cards: MemoryCard[];
  currentTurn: string;
  flippedCards: number[];
  scores: Record<string, number>;
  winner: string | null;
  isDone: boolean;
}

// ─── Number Battle ────────────────────────────
export interface NumberBattleState {
  round: number;
  totalRounds: number;
  target: number;
  playerNumbers: Record<string, number[]>;   // each player's hand
  choices: Record<string, number | null>;
  revealed: boolean;
  roundWinner: string | null;
  scores: Record<string, number>;
  gameWinner: string | null;
}

// ─── Color Clash ──────────────────────────────
export interface ColorClashState {
  round: number;
  totalRounds: number;
  word: string;
  inkColor: string;   // the actual correct answer
  wordColor: string;  // the distractor color
  choices: Record<string, string | null>;
  roundWinner: string | null;
  scores: Record<string, number>;
  gameWinner: string | null;
  phase: 'playing' | 'result';
  startedAt: number | null;
}

// ─── Dots & Boxes ─────────────────────────────
export interface DotsAndBoxesState {
  gridSize: number;   // e.g. 4 = 4x4 boxes
  horizontalEdges: (string | null)[][];  // [row][col] playerId
  verticalEdges: (string | null)[][];
  boxes: (string | null)[][];           // completed box owner
  currentTurn: string;
  scores: Record<string, number>;
  winner: string | null;
  isDone: boolean;
}

// ─── Tap Royale ──────────────────────────────
export interface TapRoyaleState {
  phase: 'countdown' | 'playing' | 'result';
  startTime: number | null;
  endTime: number | null;
  tapCounts: Record<string, number>;
  winner: string | null;
}

// ─── Target Rush ─────────────────────────────
export interface TargetRushState {
  round: number;
  totalRounds: number;
  target: number;
  playerNumbers: Record<string, number[]>;
  choices: Record<string, number | null>;
  revealed: boolean;
  roundWinner: string | null;
  scores: Record<string, number>;
  gameWinner: string | null;
}

// ─── Word Scramble ───────────────────────────
export interface WordScrambleState {
  round: number;
  totalRounds: number;
  scrambledWord: string;
  originalWord: string;
  guesses: Record<string, string | null>;
  roundWinner: string | null;
  scores: Record<string, number>;
  gameWinner: string | null;
  phase: 'playing' | 'result';
  startedAt: number | null;
  hint: string;
  usedWords: string[];
}

// ─── Trivia Blitz ────────────────────────────
export interface TriviaQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface TriviaBlitzState {
  round: number;
  totalRounds: number;
  currentQuestion: TriviaQuestion;
  remainingQuestions: TriviaQuestion[];
  answers: Record<string, number | null>;
  roundWinner: string | null;
  scores: Record<string, number>;
  gameWinner: string | null;
  phase: 'playing' | 'result';
  startedAt: number | null;
}

// ─── Speed Math ──────────────────────────────
export interface SpeedMathProblem {
  equation: string;
  options: number[];
  correctAnswer: number;
}

export interface SpeedMathState {
  round: number;
  totalRounds: number;
  currentProblem: SpeedMathProblem;
  answers: Record<string, number | null>;
  roundWinner: string | null;
  scores: Record<string, number>;
  gameWinner: string | null;
  phase: 'playing' | 'result';
  startedAt: number | null;
}

// ─── Pattern Master ──────────────────────────
// ─── Pattern Master ──────────────────────────
export interface PatternMasterState {
  round: number;
  totalRounds: number;
  sequence: number[]; // e.g. [0, 2, 1, 3]
  playerInputs: Record<string, number[]>;
  failedPlayers: string[];
  roundWinner: string | null;
  scores: Record<string, number>;
  gameWinner: string | null;
  phase: 'showing' | 'input' | 'result';
  startedAt: number | null;
}

// ─── Pic Combo (2 Pics 1 Word) ───────────────
export interface PicComboQuestion {
  id: string;
  img1: string; // Emoji symbol 1
  img2: string; // Emoji symbol 2
  hint: string;
  answer: string;
}

export interface PicComboState {
  round: number;
  totalRounds: number;
  currentQuestion: PicComboQuestion;
  remainingQuestions: PicComboQuestion[];
  guesses: Record<string, string | null>;
  roundWinner: string | null;
  scores: Record<string, number>;
  gameWinner: string | null;
  phase: 'playing' | 'result';
  startedAt: number | null;
}

export interface CoopPuzzleState {
  phase: 'countdown' | 'playing' | 'result';
  gridSize: number; // e.g. 3 for 3x3
  pieces: number[]; // array of piece ids [0, 1, 2, ..., 8] representing their current positions
  imageUrl: string;
  moves: number;
  startedAt: number | null;
  completedAt: number | null;
  selectedPieceIndex: number | null; // For selecting and swapping pieces
  selectedByPlayer: string | null;
}

export interface WaterSortState {
  phase: 'countdown' | 'playing' | 'result';
  tubes: string[][]; // Array of tubes, where each tube is an array of color strings from bottom to top
  tubeCapacity: number; // Max colors per tube (e.g., 4)
  moves: number;
  startedAt: number | null;
  completedAt: number | null;
  selectedTubeIndex: number | null;
  selectedByPlayer: string | null;
}

export interface SudokuState {
  phase: 'countdown' | 'playing' | 'result';
  level: number; // Increases when a board is solved
  board: number[][]; // 9x9 current board (0 for empty)
  solution: number[][]; // 9x9 solution
  initialBoard: boolean[][]; // 9x9 boolean, true if the cell was provided at the start (cannot be edited)
  hintsRemaining: number;
  moves: number;
  mistakes: number;
  startedAt: number | null;
  completedAt: number | null;
}

export interface Game2048State {
  phase: 'countdown' | 'playing' | 'gameover' | 'won';
  board: number[][]; // 4x4 grid (0 for empty)
  score: number;
  bestScore: number;
  moves: number;
  startedAt: number | null;
  completedAt: number | null;
  lastMoveByPlayer: string | null;
  lastMoveDirection: 'up' | 'down' | 'left' | 'right' | null;
}
