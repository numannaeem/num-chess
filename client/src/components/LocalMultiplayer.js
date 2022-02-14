import React, { useEffect, useRef, useState } from 'react'
import Chessboard from 'chessboardjsx'
import Chess from 'chess.js'
import {
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography
} from '@mui/material'
import GameOverModal from './GameOverModal'

function LocalMultiplayer () {
  const [fen, setFen] = useState('start')
  const [gameHistory, setGameHistory] = useState([])
  const [alertOpen, setAlertOpen] = useState(false)
  const [pieceSquare, setPieceSquare] = useState('')
  const [squareStyles, setSquareStyles] = useState({})
  const [gameOver, setGameOver] = useState(false)
  // gameWinner = 'd' for draw, 'w' for white wins, 'b' for black wins
  const [gameWinner, setGameWinner] = useState(null)
  const [overModalOpen, setOverModalOpen] = useState(false)

  const game = useRef(null)

  const restartGame = () => {
    setGameHistory([])
    setGameOver(false)
    game.current.reset()
    setSquareStyles([])
    setFen(game.current.fen())
    setAlertOpen(false)
  }

  const finishGame = move => {
    setGameOver(true)
    if (game.current.in_checkmate()) {
      const kingPosition = getPiecePosition({
        type: 'k',
        color: move.color === 'w' ? 'b' : 'w'
      })
      setSquareStyles({
        [kingPosition]: {
          backgroundColor: '#f02e32'
        }
      })
      setGameWinner(move.color)
    } else if (game.current.in_stalemate()) {
      // TODO: handle stalemate
      setGameWinner('d')
      // setTimeout(() => alert('STALEMATE'), 300)
    } else {
      // TODO: handle draw by insufficient material/50-move rule/threefold repetition
      setGameWinner('d')
      // setTimeout(() => alert('DRAW'), 300)
    }
    setOverModalOpen(true)
  }

  const getPiecePosition = piece => {
    return []
      .concat(...game.current.board())
      .map((p, index) => {
        if (p !== null && p.type === piece.type && p.color === piece.color) {
          return index
        }
        return null
      })
      .filter(Number.isInteger)
      .map(piece_index => {
        const row = 'abcdefgh'[piece_index % 8]
        const column = Math.ceil((64 - piece_index) / 8)
        return row + column
      })
  }

  useEffect(() => {
    if (!game.current) {
      game.current = new Chess()
    }
  }, [])

  const onDrop = ({ sourceSquare, targetSquare }) => {
    // see if the move is legal
    const move = game.current.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // always promote to a queen
    })

    // illegal move
    if (move === null) return
    setGameHistory(game.current.history({ verbose: true }))
    setFen(game.current.fen())

    if (game.current.game_over()) {
      finishGame(move)
      return
    }

    if (game.current.in_check()) {
      const kingPosition = getPiecePosition({
        type: 'k',
        color: move.color === 'w' ? 'b' : 'w'
      })
      setSquareStyles({
        [kingPosition]: {
          backgroundColor: 'rgba(24,255,186,0.6)'
        }
      })
    } else {
      setSquareStyles({})
    }
  }

  const onSquareClick = square => {
    if (!gameOver) {
      setPieceSquare(square)
      const validMoves = game.current.moves({ square, verbose: true })

      setSquareStyles(p => {
        const moves = {}
        if (game.current.in_check()) {
          moves[getPiecePosition({ type: 'k', color: game.current.turn() })] = {
            backgroundColor: 'rgba(24,255,186,0.6)'
          }
        }
        moves[validMoves[0]?.from] = { backgroundColor: 'rgba(255,255,0,0.4)' }
        validMoves.forEach(m => {
          moves[m.to] = {
            background: m.captured
              ? 'radial-gradient(circle, rgba(0,0,0,0) 48%, rgba(0,0,0,0.2) 54%, rgba(0,0,0,0.2) 66%, rgba(0,0,0,0) 71%)'
              : 'radial-gradient(circle, rgba(0,0,0,0.2) 35%, transparent 40%)'
          }
        })
        return moves
      })
      const move = game.current.move({
        from: pieceSquare,
        to: square,
        promotion: 'q'
      })

      // illegal move
      if (move === null) return
      setGameHistory(game.current.history({ verbose: true }))
      setFen(game.current.fen())
      setPieceSquare('')

      if (game.current.game_over()) {
        finishGame(move)
        return
      }

      if (game.current.in_check()) {
        const kingPosition = getPiecePosition({
          type: 'k',
          color: move.color === 'w' ? 'b' : 'w'
        })
        setSquareStyles({
          [kingPosition]: {
            backgroundColor: 'rgba(24,255,186,0.6)'
          }
        })
      }
    }
  }

  return (
    <>
      <GameOverModal
        winner={gameWinner}
        isOpen={overModalOpen}
        onClose={() => setOverModalOpen(false)}
        restartGame={restartGame}
      />
      <Box
        height='100vh'
        bgcolor='background.paper'
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          minHeight: '100vh',
          flexDirection: 'column'
        }}
      >
        <Chessboard
          undo
          calcWidth={({ screenWidth, screenHeight }) =>
            screenHeight < screenWidth ? 0.8 * screenHeight : 0.95 * screenWidth}
          position={fen}
          transitionDuration={50}
          draggable={!gameOver}
          onDrop={onDrop}
          boardStyle={{
            borderRadius: '4px',
            overflow: 'hidden',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
            marginBottom: '1rem',
            backgroundColor: 'transparent'
          }}
          squareStyles={squareStyles}
          onSquareClick={onSquareClick}
          darkSquareStyle={{ backgroundColor: 'rgb(181, 136, 99)' }}
          lightSquareStyle={{ backgroundColor: 'rgb(240, 217, 181)' }}
        />

        <ButtonGroup>
          {!gameOver && (
            <Button
              sx={{ marginRight: '5px' }}
              disabled={gameHistory.length === 0}
              variant='contained'
              color='primary'
              onClick={() => {
                game.current.undo()
                setSquareStyles([])
                setGameHistory(game.current.history({ verbose: true }))
                setFen(game.current.fen())
              }}
            >
              undo move
            </Button>
          )}
          <Button
            sx={{ marginLeft: '5px' }}
            disabled={gameHistory.length === 0}
            color='secondary'
            variant='contained'
            onClick={() => (!gameOver ? setAlertOpen(true) : restartGame())}
          >
            restart game
          </Button>
        </ButtonGroup>
        <Dialog open={alertOpen} onClose={() => setAlertOpen(false)}>
          <DialogTitle>Restart the game?</DialogTitle>
          <DialogContent>
            <DialogContentText>This cannot be undone</DialogContentText>
          </DialogContent>
          <DialogActions color='secondary'>
            <Button color='secondary' onClick={() => setAlertOpen(false)}>
              Cancel
            </Button>
            <Button color='secondary' onClick={restartGame} autoFocus>
              Restart
            </Button>
          </DialogActions>
        </Dialog>

        {/* <Box
						margin={3}
						marginLeft={0}
						flexGrow={1}
						height={'100%'}
						overflowY={'auto'}
					>
						{gameHistory.map(g => (
							<Typography color={'secondary.light'}>{g.san}</Typography>
						))}
					</Box> */}
      </Box>
    </>
  )
}

export default LocalMultiplayer
