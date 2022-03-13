const getPiecePosition = (piece, game) => {
  return []
    .concat(...game.current.board())
    .map((p, index) => {
      if (p !== null && p.type === piece.type && p.color === piece.color) {
        return index
      }
      return null
    })
    .filter(Number.isInteger)
    .map(pieceIndex => {
      const row = 'abcdefgh'[pieceIndex % 8]
      const column = Math.ceil((64 - pieceIndex) / 8)
      return row + column
    })
}

export const highlightLastMove = (gameHistory, game) => {
  const fromSquare = gameHistory.length && gameHistory[gameHistory.length - 1].from
  const toSquare = gameHistory.length && gameHistory[gameHistory.length - 1].to
  return {
    ...(gameHistory.length && {
      [fromSquare]: {
        backgroundColor: 'rgba(255, 255, 0, 0.4)'
      }
    }),
    ...(gameHistory.length && {
      [toSquare]: {
        backgroundColor: 'rgba(255, 255, 0, 0.4)'
      }
    }),
    ...(game.current?.in_checkmate()
      ? {
          [getPiecePosition({ type: 'k', color: game.current.turn() }, game)]: {
            backgroundColor: '#f02e32'
          }
        }
      : game.current?.in_check() && {
        [getPiecePosition({ type: 'k', color: game.current.turn() }, game)]: {
          backgroundColor: 'rgba(24,255,186,0.5)'
        }
      })
  }
}
