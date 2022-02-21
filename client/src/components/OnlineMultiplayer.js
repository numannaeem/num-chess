import React, { useCallback, useEffect, useRef, useState } from 'react'
import Chessboard from 'chessboardjsx'
import Chess from 'chess.js'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import GameOverModal from './GameOverModal'
import PlayerLeftModal from './PlayerLeftModal'
import NavBar from './NavBar'
import DrawSnackbar from './DrawSnackbar'
import RematchSnackbar from './RematchSnackbar'
import { ReactComponent as HandshakeIcon } from '../svgIcons/handshake.svg'
import { ReactComponent as WhiteFlagIcon } from '../svgIcons/whiteFlag.svg'

const checkmateSound = new Audio('/sounds/victoryBell.mp3')
const pieceMoveSound = new Audio('/sounds/pieceMove.wav')

function OnlineMultiplayer ({ socket, username }) {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'))

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
  const [yourTimer, setYourTimer] = useState(location.state?.time)
  const [oppTimer, setOppTimer] = useState(location.state?.time)
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
      checkmateSound?.play()
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
    if (!game.current?.in_checkmate()) pieceMoveSound?.play()
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
      if (username === white.username) {
        setYourTimer(data.timeLeft.white)
        setOppTimer(data.timeLeft.black)
      } else {
        setYourTimer(data.timeLeft.black)
        setOppTimer(data.timeLeft.white)
      }
    })

    socket?.on('game-finished', () => {
      //game finished i.e the player disconnected and game finished while he was gone
      setGameWinner('Nobody')
      setSubtitleText('Your connection timed out :/')
      finishGame()
    })

    socket?.on('game-over', data => {
      if (data.timedOut) {
        setGameWinner(data.winner)
        const subText = `${
          data.winner === black.username ? 'White' : 'Black'
        } ran out of time`
        if (data.winner === username) {
          setOppTimer(0)
        } else {
          setYourTimer(0)
        }
        setSubtitleText(subText)
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
        setBackdropOpen(true)
      }
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
      if (username === white.username) {
        setYourTimer(data.timeLeft.white)
        setOppTimer(data.timeLeft.black)
      } else {
        setYourTimer(data.timeLeft.black)
        setOppTimer(data.timeLeft.white)
      }
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
      setYourTimer(location.state?.time)
      setOppTimer(location.state?.time)
      setFen('start')
      game.current = new Chess()
      setGameHistory([])
    })
  }, [socket, location])

  // initial game.current useEffect
  useEffect(() => {
    if (!game.current) {
      game.current = new Chess()
    }
  }, [])

  useEffect(() => {
    const intervalFn = setInterval(() => {
      if (backdropOpen || gameOver) return
      if (yourTurn) setYourTimer(p => p - 1)
      else if (!yourTurn) setOppTimer(p => p - 1)
    }, 1000)
    return () => clearInterval(intervalFn)
  }, [yourTurn, backdropOpen, gameOver])

  useEffect(() => {
    if (oppTimer <= 0) {
      socket.emit('timed-out', username) //person who won
    } else if (yourTimer <= 0) {
      socket.emit(
        'timed-out',
        white.username === username ? black.username : white.username
      ) //HANDLE
    }
  }, [yourTimer, oppTimer, socket, white, black, username])

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
    socket.emit('played', {
      fen: game.current.fen(),
      result: gameWinner,
      move: {
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      },
      timeLeft: {
        white: username === white.username ? yourTimer : oppTimer,
        black: username === black.username ? yourTimer : oppTimer
      }
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

      socket.emit('played', {
        fen: game.current.fen(),
        result: gameWinner,
        move: {
          from: pieceSquare,
          to: square,
          promotion: 'q'
        },
        timeLeft: {
          white: username === white.username ? yourTimer : oppTimer,
          black: username === black.username ? yourTimer : oppTimer
        }
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
          justifyContent='center'
          alignItems='center'
        >
          <Stack
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
              textAlign={'end'}
              mr={{ xs: 0, md: 3 }}
              mb={{ xs: 2, md: 0 }}
              width='fill-available'
            >
              <span style={{ fontSize: '80%', fontWeight: '200' }}>
                {Math.floor(oppTimer / 60) +
                  ':' +
                  `${oppTimer % 60 < 10 ? '0' : ''}${oppTimer % 60}`}
                {isMobile && ' | '}
              </span>
              {isMobile
                ? white.username === username
                  ? black.username
                  : white.username
                : null}
              <LinearProgress
                sx={{ mt: isMobile ? 1 : 0 }}
                disabled={yourTurn}
                variant={'determinate'}
                value={oppTimer * (100 / location.state?.time)}
              />
              {!isMobile
                ? white.username === username
                  ? black.username
                  : white.username
                : null}
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
              mt={{ xs: 2, md: 0 }}
              textAlign={{ md: 'start' }}
            >
              {!isMobile
                ? black.username === username
                  ? black.username
                  : white.username
                : null}
              <LinearProgress
                sx={{ mb: isMobile ? 1 : 0 }}
                disabled={!yourTurn}
                variant={'determinate'}
                value={yourTimer * (100 / location.state?.time)}
              />
              {isMobile
                ? black.username === username
                  ? black.username
                  : white.username
                : null}
              <span style={{ fontSize: '80%', fontWeight: '200' }}>
                {isMobile && ' | '}
                {Math.floor(yourTimer / 60) +
                  ':' +
                  `${yourTimer % 60 < 10 ? '0' : ''}${yourTimer % 60}`}
              </span>
            </Typography>
          </Stack>
          <Stack justifySelf='flex-start' direction='row' gap={2} mb={2}>
            {!gameOver ? (
              <>
                <Tooltip enterTouchDelay={0} title='Offer draw' arrow>
                  <Button
                    variant='contained'
                    size='large'
                    onClick={offerDraw}
                    sx={{
                      ':hover': {
                        bgcolor: theme =>
                          theme.palette.mode === 'dark'
                            ? 'grey.800'
                            : 'grey.200' // theme.palette.primary.main
                      },
                      bgcolor: theme =>
                        theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' // theme.palette.primary.main
                    }}
                  >
                    <SvgIcon inheritViewBox>
                      <HandshakeIcon />
                    </SvgIcon>
                  </Button>
                </Tooltip>
                <Tooltip title='Resign' arrow>
                  <Button
                    variant='contained'
                    size='large'
                    sx={{
                      ':hover': {
                        bgcolor: theme =>
                          theme.palette.mode === 'dark'
                            ? 'grey.800'
                            : 'grey.200' // theme.palette.primary.main
                      },
                      bgcolor: theme =>
                        theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' // theme.palette.primary.main
                    }}
                    onClick={() => setAlertOpen(true)}
                  >
                    <SvgIcon>
                      <WhiteFlagIcon />
                    </SvgIcon>
                  </Button>
                </Tooltip>
              </>
            ) : (
              <Button
                variant='outlined'
                color='primary'
                onClick={() => navigate('/')}
              >
                Back to menu
              </Button>
            )}
          </Stack>
        </Stack>
        <Dialog open={alertOpen} onClose={() => setAlertOpen(false)}>
          <DialogTitle>Sure you want to resign?</DialogTitle>
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
