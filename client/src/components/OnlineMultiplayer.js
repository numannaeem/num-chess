import React, { useCallback, useEffect, useRef, useState } from 'react'
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
  Stack,
  Typography
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import GameOverModal from './GameOverModal'
import PlayerLeftModal from './PlayerLeftModal'
import NavBar from './NavBar'
import DrawSnackbar from './DrawSnackbar'
import RematchSnackbar from './RematchSnackbar'

const checkmateSound = new Audio('/victoryBell.wav')
const pieceMoveSound = new Audio('/pieceMove.wav')

function OnlineMultiplayer ({ socket, username }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [white, setWhite] = useState({
    username: location.state?.white?.username,
    id: location.state?.white?.id
  })
  const [black, setBlack] = useState({
    username: location.state?.black?.username,
    id: location.state?.black?.id
  })
  const [fen, setFen] = useState('start')
  const [gameHistory, setGameHistory] = useState([])
  const [alertOpen, setAlertOpen] = useState(false)
  const [pieceSquare, setPieceSquare] = useState('')
  const [squareStyles, setSquareStyles] = useState({})
  const [gameOver, setGameOver] = useState(false)
  const [gameWinner, setGameWinner] = useState(null)
  const [subtitleText, setSubtitleText] = useState('')
  const [overModalOpen, setOverModalOpen] = useState(false)
  const [drawSnackbarOpen, setDrawSnackbarOpen] = useState(false)
  const [rematchSnackbarOpen, setRematchSnackbarOpen] = useState(false)
  const [backdropOpen, setBackdropOpen] = useState(false)
  const [yourTurn, setYourTurn] = useState(
    location.state?.white?.id === socket?.id
    // location.state.white contains the data of white player, sent over from WaitingRoom
  )

  const highlightLastMove = useCallback(() => {
    if(game.current.in_checkmate())
      checkmateSound?.play()
    else pieceMoveSound?.play()
    const fromSquare =
      gameHistory.length && gameHistory[gameHistory.length - 1].from
    const toSquare =
      gameHistory.length && gameHistory[gameHistory.length - 1].to
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
            [getPiecePosition({ type: 'k', color: game.current.turn() })]: {
              backgroundColor: '#f02e32'
            }
          }
        : game.current?.in_check() && {
            [getPiecePosition({ type: 'k', color: game.current.turn() })]: {
              backgroundColor: 'rgba(24,255,186,0.5)'
            }
          })
    }
  }, [gameHistory])

  const finishGame = useCallback(
    move => {
      setGameOver(true)
      setOverModalOpen(true)
      if (move) {
        if (game.current.in_checkmate()) {
          setSubtitleText(
            `${move.color === 'w' ? 'White' : 'Black'} won by checkmate`
          )
          return username
        } else if (game.current.in_stalemate()) {
          setSubtitleText('Draw by stalemate')
        } else if (game.current.insufficient_material()) {
          setSubtitleText('Draw by insuffiicient material')
        } else if (game.current.in_threefold_repetition()) {
          setSubtitleText('Draw by threefold repetition')
        }
      }
      game.current.reset()
      return 'draw'
    },
    [username]
  )

  useEffect(() => {
    if (!location.state) {
      navigate('/')
    } else if (
      location.state.white.id !== socket.id &&
      location.state.black.id !== socket.id
    ) {
      socket.emit('reconnect-to-room', location.state.roomName)
    }
  }, [location, navigate, socket])

  const game = useRef(null)

  // useEffect to highlight last move
  useEffect(() => {
    setSquareStyles(highlightLastMove())
  }, [gameHistory, highlightLastMove])

  useEffect(() => {
    socket?.on('next-turn', data => {
      const move = game.current.move(data.move)
      if (move) {
        setFen(game.current.fen())
        setGameHistory(game.current.history({ verbose: true }))
      }
      if (data.nextPlayer.id === socket.id) {
        setYourTurn(true)
      }
    })

    socket?.on('game-over', data => {
      if (data.timedOut) {
        setGameWinner(white.id === socket.id ? black.username : white.username)
        setSubtitleText('Your connection timed out :/')
        finishGame()
        return
      }
      const move = game.current.move(data.move)
      setGameHistory(game.current.history({ verbose: true }))
      setFen(game.current.fen())
      finishGame(move)
      setGameWinner(data.winner)
    })

    socket.on('player-left', () => {
      if (!gameOver) {
        setBackdropOpen(true)}
    })

    socket.on('draw-offered', () => {
      setDrawSnackbarOpen(true)
    })
    socket.on('rematch-offered', () => {
      setRematchSnackbarOpen(true)
    })
    socket.on('draw-accepted', () => {
      setGameWinner('draw')
      setSubtitleText('Draw by mutual agreement')
      finishGame()
    })
    socket.on('opponent-resigned', () => {
      setGameWinner(username)
      setSubtitleText(
        `${white.id === socket.id ? 'White' : 'Black'} won by resignation`
      )
      finishGame()
    })
    socket.on('update-data', data => {
      setYourTurn(data.currentPlayer.id === socket.id)
      if (data.fen) {
        game.current.load(data.fen)
      } else game.current = new Chess()
      setFen(game.current.fen())
      setWhite(data.players.find(p => p.color === 'white'))
      setBlack(data.players.find(p => p.color === 'black'))
      setBackdropOpen(false)
    })
  }, [socket, username, finishGame, gameOver, black, white])

  useEffect(() => {
    socket?.on('rematch-accepted', data => {
      setSquareStyles({})
      setYourTurn(data.white.id === socket.id)
      setWhite(data.white)
      setBlack(data.black)
      setAlertOpen(false)
      setOverModalOpen(false)
      setGameWinner(null)
      setGameOver(false)
      setRematchSnackbarOpen(false)
      setSubtitleText('')
      setFen('start')
      game.current = new Chess()
      setGameHistory([])
    })
  }, [socket])

  // initial game.current useEffect
  useEffect(() => {
    if (!game.current) {
      game.current = new Chess()
    }
  }, [])

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
      .map(pieceIndex => {
        const row = 'abcdefgh'[pieceIndex % 8]
        const column = Math.ceil((64 - pieceIndex) / 8)
        return row + column
      })
  }

  const onDrop = ({ sourceSquare, targetSquare }) => {
    let gameWinner = null
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
      gameWinner = finishGame(move)
      setGameWinner(gameWinner)
    }
    socket.emit('played', game.current.fen(), gameWinner, {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q'
    })
    setYourTurn(false)
  }

  const onSquareClick = square => {
    if (!gameOver) {
      let gameWinner = null
      setPieceSquare(square)
      const validMoves = game.current.moves({ square, verbose: true })
      const moves = highlightLastMove() || {}
      moves[validMoves[0]?.from] = { backgroundColor: 'rgba(255,255,0,0.4)' }
      validMoves.forEach(m => {
        moves[m.to] = {
          background: m.captured
            ? 'radial-gradient(circle, rgba(0,0,0,0) 48%, rgba(0,0,0,0.2) 54%, rgba(0,0,0,0.2) 66%, rgba(0,0,0,0) 71%)'
            : 'radial-gradient(circle, rgba(0,0,0,0.2) 35%, transparent 40%)'
        }
      })
      const move = game.current.move({
        from: pieceSquare,
        to: square,
        promotion: 'q'
      })

      if (move === null) {
        setSquareStyles(moves)
        return
      }
      setGameHistory(game.current.history({ verbose: true }))
      setFen(game.current.fen())
      setPieceSquare('')

      if (game.current.game_over()) {
        gameWinner = finishGame(move)
        setGameWinner(gameWinner)
      }

      socket.emit('played', game.current.fen(), gameWinner, {
        from: pieceSquare,
        to: square,
        promotion: 'q' // always promote to a queen
      })

      setYourTurn(false)
    }
  }

  const offerDraw = () => {
    socket.emit('offer-draw', white.id === socket.id ? black.id : white.id)
  }

  const handleAcceptDraw = () => {
    socket.emit('accept-draw', white.id === socket.id ? black.id : white.id)
    setGameWinner('draw')
    setSubtitleText('Draw by mutual agreement')
    setDrawSnackbarOpen(false)
    finishGame()
  }
  const offerRematch = () => {
    socket?.emit('offer-rematch', white.id === socket.id ? black.id : white.id)
  }
  const handleAcceptRematch = () => {
    socket.emit('accept-rematch')
  }
  const handleResign = () => {
    setAlertOpen(false)
    socket.emit('resign', white.id === socket.id ? black.id : white.id)
    setGameWinner(white.id === socket.id ? black.username : white.username)
    setSubtitleText(
      `${white.id === socket.id ? 'Black' : 'White'} won by resignation`
    )
    finishGame()
  }

  const handleOpponentTimedOut = () => {
    setGameWinner(username)
    setSubtitleText(
      `${white.id === socket.id ? 'White' : 'Black'} won by timeout`
    )
    finishGame()
  }

  return (
    <>
      <PlayerLeftModal
        onTimeout={handleOpponentTimedOut}
        setBackdropOpen={setBackdropOpen}
        backdropOpen={backdropOpen}
      />
      <GameOverModal
        winner={gameWinner}
        isOpen={overModalOpen}
        onClose={() => setOverModalOpen(false)}
        restartGame={offerRematch}
        subtitleText={subtitleText}
        multiplayer
      />
      <Stack
        minHeight='100vh'
        bgcolor='background.paper'
        justifyContent='space-between'
        alignItems='center'
      >
        <NavBar
          onClick={() => {
            if (!gameOver) {
              socket.emit(
                'resign',
                white.id === socket.id ? black.id : white.id
              )
            }
            navigate('/')
          }}
        />
        <Stack
          flexGrow={1}
          width='fill-available'
          py={3}
          px={{ xs: 1, md: 5 }}
          direction={{ xs: 'column', md: 'row' }}
          alignItems='center'
          justifyContent={{ xs: 'center', md: 'space-evenly' }}
        >
          <Typography
            fontWeight='800'
            flexGrow={{ xs: 0, md: 1 }}
            flexBasis={0}
            fontSize={{ xs: '1.5rem', md: '3rem' }}
            alignSelf='start'
            color='text.primary'
            textAlign={{ xs: 'center', md: 'end' }}
            mr={{ xs: 0, md: 3 }}
            mb={{ xs: 1, md: 0 }}
            width='fill-available'
          >
            {white.username === username ? black.username : white.username}
          </Typography>
          <Chessboard
            orientation={black.id === socket.id ? 'black' : 'white'}
            undo
            calcWidth={({ screenWidth, screenHeight }) =>
              screenHeight < screenWidth
                ? 0.75 * screenHeight
                : 0.95 * screenWidth
            }
            position={fen}
            transitionDuration={100}
            draggable={yourTurn && !gameOver}
            onDrop={onDrop}
            boardStyle={{
              borderRadius: '4px',
              overflow: 'hidden',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
              backgroundColor: 'transparent'
            }}
            squareStyles={squareStyles}
            onSquareClick={yourTurn ? onSquareClick : () => {}}
            darkSquareStyle={{ backgroundColor: 'rgb(181, 136, 99)' }}
            lightSquareStyle={{ backgroundColor: 'rgb(240, 217, 181)' }}
          />
          <Typography
            width='fill-available'
            fontWeight='800'
            flexGrow={{ xs: 0, md: 1 }}
            flexBasis={0}
            fontSize={{ xs: '1.5rem', md: '3rem' }}
            alignSelf='end'
            color='text.primary'
            ml={{ xs: 0, md: 3 }}
            mt={{ xs: 1, md: 0 }}
            textAlign={{ xs: 'center', md: 'start' }}
          >
            {black.username === username ? black.username : white.username}
          </Typography>
        </Stack>

        <Box my={3}>
          {!gameOver ? (
            <ButtonGroup>
              <Button
                sx={{ marginRight: '2px' }}
                variant='contained'
                color='primary'
                onClick={offerDraw}
              >
                🤝 offer draw
              </Button>
              <Button
                sx={{ marginLeft: '2px' }}
                color='secondary'
                variant='contained'
                onClick={() => setAlertOpen(true)}
              >
                🏳️ resign
              </Button>
            </ButtonGroup>
          ) : (
            <Button
              variant='contained'
              color='primary'
              onClick={() => navigate('/')}
            >
              Back to menu
            </Button>
          )}
        </Box>
        <Dialog open={alertOpen} onClose={() => setAlertOpen(false)}>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              there's always hope for stalemate!
            </DialogContentText>
          </DialogContent>
          <DialogActions color='secondary'>
            <Button color='secondary' onClick={() => setAlertOpen(false)}>
              Cancel
            </Button>
            <Button color='secondary' onClick={handleResign}>
              Resign
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
      <DrawSnackbar
        drawSnackbarOpen={drawSnackbarOpen}
        setDrawSnackbarOpen={setDrawSnackbarOpen}
        handleAcceptDraw={handleAcceptDraw}
      />
      <RematchSnackbar
        rematchSnackbarOpen={rematchSnackbarOpen}
        setRematchSnackbarOpen={setRematchSnackbarOpen}
        handleAcceptRematch={handleAcceptRematch}
      />
    </>
  )
}

export default OnlineMultiplayer
