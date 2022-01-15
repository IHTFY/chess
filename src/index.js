import { Chessboard } from './chessboard.js'
const Chess = require('chess.js');
import $ from 'jQuery';

let board;
let game = new Chess();
const AI = {
  COLOR: -1, // black = -1, white = 1
  DEPTH: 3
}

const shuffle = (a) => {
  for (let i = 0; i < a.length - 1; i++) {
    let j = i + Math.floor(Math.random() * (a.length - i));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* AI */

const getPieceValue = (piece) => {
  if (piece === null) {
    return 0;
  }
  return ({
    p: 15,
    n: 80,
    b: 85,
    r: 130,
    q: 260,
    k: 1000
  }[piece.type.toLowerCase()]) * (piece.color === 'w' ? 1 : -1);

}

const evaluateBoard = (board) => {
  let materialBalance = 0;
  let totalEvaluation = 0;

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      materialBalance += getPieceValue(board[i][j]);
    }
  }

  totalEvaluation = materialBalance;

  return totalEvaluation;
}

const minimaxRoot = (depth, game, isBlack) => {
  let newGameMoves = shuffle(game.moves());
  let bestMove = null;
  let bestScore = -Infinity;

  for (let newGameMove of newGameMoves) {
    game.move(newGameMove);
    let moveScore = minimax(depth - 1, game, -Infinity, Infinity, !isBlack);
    game.undo();
    if (moveScore >= bestScore) {
      bestScore = moveScore;
      bestMove = newGameMove;
    }
  }


  return bestMove;
};

const minimax = (depth, game, alpha, beta, isWhite) => {
  if (depth === 0) {
    return AI.COLOR * evaluateBoard(game.board());
  }

  let newGameMoves = shuffle(game.moves());
  let bestMove = isWhite ? -Infinity : Infinity;

  for (let newGameMove of newGameMoves) {
    game.move(newGameMove);
    bestMove = isWhite ?
      Math.max(bestMove, minimax(depth - 1, game, alpha, beta, !isWhite)) :
      Math.min(bestMove, minimax(depth - 1, game, alpha, beta, !isWhite));
    game.undo();
    if (isWhite) {
      alpha = Math.max(alpha, bestMove);
    } else {
      beta = Math.min(beta, bestMove);
    }
    if (beta <= alpha) {
      return bestMove;
    }
  }

  return bestMove;
}



/* Game Logic*/

const onDragStart = (source, piece, position, orientation) => {
  if (game.in_checkmate() === true || game.in_draw() === true ||
    piece.search(/^b/) !== -1) {
    return false;
  }
};

const getResult = (game) => {
  if (!game.game_over()) {
    return 'playing';
  }
  if (!game.in_checkmate()) {
    return 'draw';
  }
  return game.turn() === 'w' ? 'b' : 'w';
}

const doGameOver = (game) => {
  const result = getResult(game);
  setTimeout(() => {
    alert({
      'draw': 'Draw',
      'w': 'White Wins',
      'b': 'Black Wins'
    }[result])
  }, 250);

}

const getBestMove = (game) => {
  let bestMove = minimaxRoot(AI.DEPTH, game, AI.COLOR === -1);
  // let bestMove = calculateBestMove(game);
  return bestMove;
};

const makeBestMove = () => {
  let bestMove = getBestMove(game);
  game.move(bestMove);
  board.position(game.fen());
  renderMoveHistory(game.history());
  if (game.game_over()) {
    doGameOver(game);
  }
};

const renderMoveHistory = (moves) => {
  let historyElement = $('#move-history');
  historyElement.empty();
  for (let i = 0; i < moves.length; i = i + 2) {
    historyElement.append(`<span>${i / 2 + 1}. ${moves[i]} ${moves[i + 1] ? moves[i + 1] : ''} </span> <br>`);
  }
  historyElement.scrollTop(historyElement[0].scrollHeight);
};


const removeHighlightSquares = () => {
  $('#board .square-55d63').css('filter', '');
};

const highlightSquare = (square) => {
  let squareEl = $('#board .square-' + square);

  squareEl.css('filter', 'brightness(2)');
};

const onDrop = (source, target) => {

  let move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  });

  removeHighlightSquares();
  if (move === null) {
    return 'snapback';
  }

  renderMoveHistory(game.history());

  if (game.game_over()) {
    doGameOver(game);
  } else {
    window.setTimeout(makeBestMove, 250);
  }
};


const onMouseoverSquare = (square, piece) => {
  let moves = game.moves({
    square: square,
    verbose: true
  });

  if (moves.length === 0) return;

  highlightSquare(square);

  for (let i = 0; i < moves.length; i++) {
    highlightSquare(moves[i].to);
  }
};

const cfg = {
  draggable: true,
  position: 'start',
  pieceTheme: 'https://lichess1.org/assets/_v88h3i/piece/alpha/{piece}.svg',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: (square, piece) => removeHighlightSquares(),
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: () => board.position(game.fen())
};

board = Chessboard('board', cfg);