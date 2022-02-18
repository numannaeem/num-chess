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
  IconButton,
  Snackbar,
  Stack,
  Typography
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import GameOverModal from './GameOverModal'
import PlayerLeftModal from './PlayerLeftModal'
import NavBar from './NavBar'

function OnlineMultiplayer ({ socket, username }) {
  console.log('RENDER')
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
  const [backdropOpen, setBackdropOpen] = useState(false)
  const [yourTurn, setYourTurn] = useState(
    location.state?.white?.id === socket?.id
    // location.state.white contains the data of white player, sent over from WaitingRoom
  )

  const highlightLastMove = useCallback(() => {
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
      })
    }
  }, [gameHistory])

  const finishGame = useCallback(
    move => {
      setGameOver(true)
      setOverModalOpen(true)
      if (move) {
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
          setSubtitleText(
            `${move.color === 'w' ? 'White' : 'Black'} won by checkmate`
          )
          game.current.reset()
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
    setSquareStyles(prev => {
      return {
        ...prev,
        ...highlightLastMove()
      }
    })
  }, [gameHistory, highlightLastMove])

  useEffect(() => {
    socket?.on('next-turn', data => {
      const move = game.current.move(data.move)
      setFen(game.current.fen())
      if (move) {
        setGameHistory(game.current.history({ verbose: true }))
        if (game.current.in_check()) {
          console.log(move)
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
      if (data.nextPlayer.id === socket.id) {
        setYourTurn(true)
      }
    })

    socket?.on('game-over', data => {
      const move = game.current.move(data.move)
      setFen(game.current.fen())
      finishGame(move)
      setGameWinner(data.winner)
      console.log(game.current.fen())
      // setSubtitleText(`${data.winner} won by checkmate`)
    })

    socket.on('player-left', () => {
      setBackdropOpen(true)
    })

    socket.on('draw-offered', () => {
      setDrawSnackbarOpen(true)
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
  }, [socket, username, finishGame, white])

  // initial game.current useEffect
  useEffect(() => {
    if (!game.current) {
      game.current = new Chess()
    }
  }, [])

  const restartGame = () => {
    setGameHistory([])
    setGameOver(false)
    game.current.reset()
    setSquareStyles({})
    setFen(game.current.fen())
    setAlertOpen(false)
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

    setSquareStyles({})
    setGameHistory(game.current.history({ verbose: true }))
    setFen(game.current.fen())

    if (game.current.game_over()) {
      gameWinner = finishGame(move)
      setGameWinner(gameWinner)
    }
    socket.emit('played', game.current.fen(), gameWinner, {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // always promote to a queen
    })
    setYourTurn(false)
    if (!game.current.game_over() && game.current.in_check()) {
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
  const onSquareClick = square => {
    if (!gameOver) {
      let gameWinner = null
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
        gameWinner = finishGame(move)
        setGameWinner(gameWinner)
      }

      socket.emit('played', game.current.fen(), gameWinner, {
        from: pieceSquare,
        to: square,
        promotion: 'q' // always promote to a queen
      })

      setYourTurn(false)

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
      <PlayerLeftModal onTimeout={handleOpponentTimedOut} setBackdropOpen={setBackdropOpen} backdropOpen={backdropOpen} />
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
        justifyContent='space-around'
        alignItems='center'
      >
        <NavBar
          onClick={() => {
            socket.emit('resign', white.id === socket.id ? black.id : white.id)
            navigate('/')
          }}
        />
        <Stack
          flexGrow={1}
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
            textAlign='center'
            alignSelf='start'
            color='text.primary'
            mr={4}
          >
            {white.username === username ? black.username : white.username}
          </Typography>
          <Chessboard
            style={!yourTurn && { cursor: 'pointer' }}
            orientation={black.id === socket.id ? 'black' : 'white'}
            undo
            calcWidth={({ screenWidth, screenHeight }) =>
              screenHeight < screenWidth
                ? 0.75 * screenHeight
                : 0.95 * screenWidth}
            position={fen}
            transitionDuration={50}
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
            position='relative'
            fontWeight='800'
            flexGrow={{ xs: 0, md: 1 }}
            flexBasis={0}
            fontSize={{ xs: '1.5rem', md: '3rem' }}
            textAlign='center'
            alignSelf='end'
            color='text.primary'
            ml={4}
          >
            {black.username === username ? black.username : white.username}
          </Typography>
        </Stack>

        <Box py={2}>
          {!gameOver
            ? (
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
                  onClick={() => (!gameOver ? setAlertOpen(true) : restartGame())}
                >
                  🏳️ resign
                </Button>
              </ButtonGroup>
              )
            : (
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
      <Snackbar
        open={drawSnackbarOpen}
        // autoHideDuration={6000}
        onClose={() => setDrawSnackbarOpen(false)}
        message='Opponent has offered a draw. Accept?'
        action={
          <>
            <IconButton color='inherit' onClick={handleAcceptDraw}>
              <CheckIcon />
            </IconButton>
            <IconButton
              aria-label='close'
              color='inherit'
              onClick={() => setDrawSnackbarOpen(false)}
            >
              <CloseIcon />
            </IconButton>
          </>
        }
      />
    </>
  )
}

export default OnlineMultiplayer
