import React, { useCallback, useEffect, useRef, useState } from 'react'
import Chessboard from 'chessboardjsx'
import Chess from 'chess.js'
import {
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack
} from '@mui/material'
import GameOverModal from './GameOverModal'
import NavBar from './NavBar'
import { highlightLastMove } from '../chess/handleMoves'

const checkmateSound = new window.Audio('/sounds/victoryBell.mp3')
const pieceMoveSound = new window.Audio('/sounds/pieceMove.wav')

function LocalMultiplayer ({sound}) {
  const [fen, setFen] = useState('start')
  const [gameHistory, setGameHistory] = useState([])
  const [alertOpen, setAlertOpen] = useState(false)
  const [pieceSquare, setPieceSquare] = useState('')
  const [squareStyles, setSquareStyles] = useState({})
  const [gameOver, setGameOver] = useState(false)
  // gameWinner = 'd' for draw, 'w' for white wins, 'b' for black wins
  const [gameWinner, setGameWinner] = useState(null)
  const [overModalOpen, setOverModalOpen] = useState(false)
  const [subtitleText, setSubtitleText] = useState('')
  const [autoFlip, setAutoFlip] = useState(false)

  const game = useRef(null)

  const restartGame = () => {
    setGameHistory([])
    setGameOver(false)
    game.current.reset()
    setSquareStyles([])
    setFen(game.current.fen())
    setAlertOpen(false)
  }

  useEffect(() => {
    if (!game.current?.in_checkmate() && sound) pieceMoveSound?.play()
    setSquareStyles(highlightLastMove(gameHistory, game))
  }, [gameHistory])

  const finishGame = useCallback(move => {
    setGameOver(true)
    setOverModalOpen(true)
    if(sound) checkmateSound?.play()
    if (game.current.in_checkmate()) {
      setGameWinner(move.color === 'b' ? 'Black' : 'White')
      setSubtitleText('Win by checkmate')
    } else if (game.current.in_stalemate()) {
      setGameWinner('draw')
      setSubtitleText('Draw by stalemate')
    } else {
      setGameWinner('draw')
      setSubtitleText('Draw by insufficient material/threefold repetition')
    }
  }, [])

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
    }
  }

  const onSquareClick = square => {
    if (gameOver) return
    if (square === pieceSquare) {
      setPieceSquare(null)
      setSquareStyles(highlightLastMove(gameHistory, game) || {})
      return
    }

    const validMoves = game.current.moves({ square, verbose: true })
    const moves = highlightLastMove(gameHistory, game) || {}
    moves[square] = { backgroundColor: 'rgba(255,255,0,0.4)' }
    validMoves.forEach(m => {
      moves[m.to] = {
        background: m.captured
          ? 'radial-gradient(circle, rgba(0,0,0,0) 48%, rgba(0,0,0,0.2) 54%, rgba(0,0,0,0.2) 66%, rgba(0,0,0,0) 71%)'
          : 'radial-gradient(circle, rgba(0,0,0,0.2) 35%, transparent 40%)'
      }
    })
    setSquareStyles(moves)
    const move = game.current.move({
      from: pieceSquare,
      to: square,
      promotion: 'q'
    })
    setPieceSquare(square)

    // illegal move
    if (move === null) return
    setGameHistory(game.current.history({ verbose: true }))
    setFen(game.current.fen())
    setPieceSquare('')

    if (game.current.game_over()) {
      finishGame(move)
    }
  }

  return (
    <>
      <GameOverModal
        winner={gameWinner}
        isOpen={overModalOpen}
        onClose={() => setOverModalOpen(false)}
        restartGame={restartGame}
        subtitleText={subtitleText}
      />
      <Stack
        minHeight='100vh'
        bgcolor='background.paper'
        justifyContent='space-between'
        alignItems='center'
      >
        <NavBar />
        <Stack flexGrow={1} alignItems='center' justifyContent='center'>
          <Chessboard
            undo
            calcWidth={({ screenWidth, screenHeight }) =>
              screenHeight < screenWidth
                ? 0.7 * screenHeight
                : 0.95 * screenWidth
            }
            orientation={
              !autoFlip
                ? 'white'
                : game.current.turn() === 'b'
                ? 'black'
                : 'white'
            }
            position={fen}
            transitionDuration={10}
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

          <Stack sx={{ margin: 1 }} gap={1} direction={{xs: 'column', md: 'row'}}>
            {!gameOver && (
              <ButtonGroup>
                <Button
                  variant='outlined'
                  color='primary'
                  onClick={() => setAutoFlip(p => !p)}
                >
                  {`${autoFlip ? 'Disable' : 'Enable'} auto-flip`}
                </Button>
                <Button
                  variant='outlined'
                  color='primary'
                  onClick={() => {
                    game.current.undo()
                    setSquareStyles({})
                    setGameHistory(game.current.history({ verbose: true }))
                    setFen(game.current.fen())
                  }}
                >
                  undo last move
                </Button>
              </ButtonGroup>
            )}
            <Button
              // sx={{ marginLeft: '2px' }}
              disabled={gameHistory.length === 0}
              color='secondary'
              variant='outlined'
              onClick={() => (!gameOver ? setAlertOpen(true) : restartGame())}
            >
              restart game
            </Button>
          </Stack>
        </Stack>
      </Stack>
      <Dialog open={alertOpen} onClose={() => setAlertOpen(false)}>
        <DialogTitle>Are you sure?</DialogTitle>
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
    </>
  )
}

export default LocalMultiplayer
