import { Chessboard } from './chessboard.js'
const Chess = require('chess.js');
import $ from 'jQuery';

let board;
let game = new Chess();


/* AI */

function calculateBestMove(game) {

  let newGameMoves = game.moves();

  return newGameMoves[Math.floor(Math.random() * newGameMoves.length)];

};

/* Game Logic*/

function onDragStart(source, piece, position, orientation) {
  if (game.in_checkmate() === true || game.in_draw() === true ||
    piece.search(/^b/) !== -1) {
    return false;
  }
};

function makeBestMove() {
  let bestMove = getBestMove(game);
  game.move(bestMove);
  board.position(game.fen());
  renderMoveHistory(game.history());
  if (game.game_over()) {
    doGameOver(game);
  }
};

function getBestMove(game) {
  let bestMove = calculateBestMove(game);
  return bestMove;
};

function getResult(game) {
  if (game.game_over()) {
    if (game.in_checkmate()) {
      if (game.turn() === 'w') {
        return 'b';
      }
      return 'w';
    }
    return 'draw';
  }
  return 'playing';
}

function doGameOver(game) {
  const result = getResult(game);
  setTimeout(() => {
    alert({
      'draw': 'Draw',
      'w': 'White Wins',
      'b': 'Black Wins'
    }[result])
  }, 250);

}

function renderMoveHistory(moves) {
  let historyElement = $('#move-history');
  historyElement.empty();
  for (let i = 0; i < moves.length; i = i + 2) {
    historyElement.append(`<span>${i / 2 + 1}. ${moves[i]} ${moves[i + 1] ? moves[i + 1] : ''} </span> <br>`);
  }
  historyElement.scrollTop(historyElement[0].scrollHeight);

};

function onDrop(source, target) {

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

function onSnapEnd() {
  board.position(game.fen());
};

function onMouseoverSquare(square, piece) {
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

function onMouseoutSquare(square, piece) {
  removeHighlightSquares();
};

function removeHighlightSquares() {
  $('#board .square-55d63').css('filter', '');
};

function highlightSquare(square) {
  let squareEl = $('#board .square-' + square);

  squareEl.css('filter', 'brightness(2)');
};

let cfg = {
  draggable: true,
  position: 'start',
  pieceTheme: 'https://lichess1.org/assets/_v88h3i/piece/alpha/{piece}.svg',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd
};

board = Chessboard('board', cfg);