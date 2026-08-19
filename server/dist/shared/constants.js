"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLOR_CLASH_WORDS = exports.COLOR_CLASH_COLORS = exports.FIND_MATCH_SYMBOL_COUNTS = exports.FIND_MATCH_SYMBOLS = exports.ALL_GAMES = exports.AVATAR_SEEDS = exports.ACCENT_COLORS = exports.FIND_MATCH_DEFAULT_ROUNDS = exports.RPS_WIN_SCORE = exports.REACTION_DUEL_ROUNDS = exports.QUICK_TAP_DURATION_MS = exports.MAX_PLAYER_NAME_LENGTH = exports.MAX_CHAT_LENGTH = exports.ROOM_EXPIRE_ONE_PLAYER_MS = exports.ROOM_EXPIRE_EMPTY_MS = exports.ROOM_CODE_LENGTH = void 0;
exports.ROOM_CODE_LENGTH = 6;
exports.ROOM_EXPIRE_EMPTY_MS = 10 * 60 * 1000; // 10 min
exports.ROOM_EXPIRE_ONE_PLAYER_MS = 60 * 1000; // 60 sec
exports.MAX_CHAT_LENGTH = 120;
exports.MAX_PLAYER_NAME_LENGTH = 16;
exports.QUICK_TAP_DURATION_MS = 10000;
exports.REACTION_DUEL_ROUNDS = 5;
exports.RPS_WIN_SCORE = 5;
exports.FIND_MATCH_DEFAULT_ROUNDS = 10;
exports.ACCENT_COLORS = [
    '#FF6B6B', '#FF9F43', '#FFEAA7', '#55EFC4',
    '#74B9FF', '#A29BFE', '#FD79A8', '#00CEC9',
    '#6C5CE7', '#E17055',
];
exports.AVATAR_SEEDS = [
    'dragon', 'tiger', 'wolf', 'eagle', 'shark',
    'phoenix', 'cobra', 'lion', 'fox', 'panther',
    'bear', 'falcon', 'viper', 'hawk', 'jaguar',
];
exports.ALL_GAMES = [
    {
        id: 'find-match',
        name: 'Find Match',
        description: 'Spot the identical symbol before your opponent!',
        category: 'REACTION',
        minPlayers: 2,
        maxPlayers: 2,
        estimatedMinutes: '2-4 min',
        difficulty: 'Medium',
        icon: '🔍',
    },
    {
        id: 'tic-tac-toe',
        name: 'Tic Tac Toe',
        description: 'Classic 3-in-a-row strategy. First to three wins!',
        category: 'STRATEGY',
        minPlayers: 2,
        maxPlayers: 2,
        estimatedMinutes: '1-2 min',
        difficulty: 'Easy',
        icon: '❌',
    },
    {
        id: 'connect-four',
        name: 'Connect Four',
        description: 'Drop pieces and connect four in a row to win.',
        category: 'STRATEGY',
        minPlayers: 2,
        maxPlayers: 2,
        estimatedMinutes: '3-5 min',
        difficulty: 'Medium',
        icon: '🔵',
    },
    {
        id: 'rock-paper-scissors',
        name: 'Rock Paper Scissors',
        description: 'Best of 9 rounds. Outsmart your opponent!',
        category: 'QUICK',
        minPlayers: 2,
        maxPlayers: 2,
        estimatedMinutes: '1-3 min',
        difficulty: 'Easy',
        icon: '✊',
    },
    {
        id: 'reaction-duel',
        name: 'Reaction Duel',
        description: 'Fastest finger wins. Press GO the instant you see it!',
        category: 'REACTION',
        minPlayers: 2,
        maxPlayers: 2,
        estimatedMinutes: '1-2 min',
        difficulty: 'Easy',
        icon: '⚡',
    },
    {
        id: 'quick-tap',
        name: 'Quick Tap',
        description: 'Tap as many times as possible in 10 seconds.',
        category: 'REACTION',
        minPlayers: 2,
        maxPlayers: 2,
        estimatedMinutes: '1 min',
        difficulty: 'Easy',
        icon: '👆',
    },
    {
        id: 'memory-duel',
        name: 'Memory Duel',
        description: 'Flip cards and find matching pairs before your opponent.',
        category: 'BOARD',
        minPlayers: 2,
        maxPlayers: 2,
        estimatedMinutes: '3-5 min',
        difficulty: 'Medium',
        icon: '🃏',
    },
    {
        id: 'number-battle',
        name: 'Number Battle',
        description: 'Choose the number closest to the target each round.',
        category: 'QUICK',
        minPlayers: 2,
        maxPlayers: 2,
        estimatedMinutes: '2-3 min',
        difficulty: 'Easy',
        icon: '🔢',
    },
    {
        id: 'color-clash',
        name: 'Color Clash',
        description: 'Name the ink color, not the word! Stroop effect duel.',
        category: 'REACTION',
        minPlayers: 2,
        maxPlayers: 2,
        estimatedMinutes: '2-3 min',
        difficulty: 'Hard',
        icon: '🎨',
    },
    {
        id: 'dots-and-boxes',
        name: 'Dots & Boxes',
        description: 'Draw lines to complete boxes. Most boxes wins!',
        category: 'STRATEGY',
        minPlayers: 2,
        maxPlayers: 2,
        estimatedMinutes: '4-7 min',
        difficulty: 'Medium',
        icon: '⬜',
    },
];
exports.FIND_MATCH_SYMBOLS = [
    'dice', 'ball', 'star', 'hammer', 'chest',
    'horseshoe', 'gem', 'hourglass', 'camera', 'drop',
    'lock', 'key', 'shield', 'feather', 'mushroom',
    'lightning', 'heart', 'crown', 'anchor', 'bell',
    'bomb', 'compass', 'crystal', 'flame', 'flower',
    'ghost', 'globe', 'leaf', 'moon', 'ring',
    'rocket', 'scroll', 'snowflake', 'sword', 'trophy',
    'apple', 'bone', 'boot', 'bottle', 'bow',
    'bug', 'candle', 'clover', 'crab', 'diamond',
    'egg', 'fan', 'fish', 'fist', 'flag',
    'guitar', 'hat', 'headphone', 'icecream', 'lantern',
    'lollipop', 'map', 'mask', 'medal', 'mirror',
];
exports.FIND_MATCH_SYMBOL_COUNTS = {
    easy: 5,
    normal: 7,
    hard: 9,
    insane: 11,
};
exports.COLOR_CLASH_COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
exports.COLOR_CLASH_WORDS = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE'];
