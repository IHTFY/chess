import { Chessboard } from './chessboard.js'
const Chess = require('chess.js');
import $ from 'jQuery';

let board;
let game = new Chess();


/*The "AI" part starts here */

function calculateBestMove(game) {

  let newGameMoves = game.moves();

  return newGameMoves[Math.floor(Math.random() * newGameMoves.length)];

};

/* board visualization and games state handling starts here*/

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
    alert('Game over');
  }
};

function getBestMove(game) {
  if (game.game_over()) {
    alert('Game over');
  }
  let bestMove = calculateBestMove(game);
  return bestMove;
};

function renderMoveHistory(moves) {
  let historyElement = $('#move-history').empty();
  historyElement.empty();
  for (let i = 0; i < moves.length; i = i + 2) {
    historyElement.append('<span>' + moves[i] + ' ' + (moves[i + 1] ? moves[i + 1] : ' ') + '</span><br>')
  }
  historyElement.scrollTop(historyElement[0].scrollHeight);

};

function onDrop(source, target) {

  let move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  });

  removeGreySquares();
  if (move === null) {
    return 'snapback';
  }

  renderMoveHistory(game.history());
  window.setTimeout(makeBestMove, 250);
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

  greySquare(square);

  for (let i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
};

function onMouseoutSquare(square, piece) {
  removeGreySquares();
};

function removeGreySquares() {
  $('#board .square-55d63').css('background', '');
};

function greySquare(square) {
  let squareEl = $('#board .square-' + square);

  let background = '#a9a9a9';
  if (squareEl.hasClass('black-3c85d') === true) {
    background = '#696969';
  }

  squareEl.css('background', background);
};

let cfg = {
  draggable: true,
  position: 'start',
  // pieceTheme: 'https://chessboardjs.com/img/chesspieces/alpha/{piece}.png',
  pieceTheme:'https://lichess1.org/assets/_v88h3i/piece/alpha/{piece}.svg',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd
};
board = Chessboard('board', cfg);
$(window).resize(board.resize);