const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const path = require('path')
const { Server } = require('socket.io')
const io = new Server(server)
const cors = require('cors')

app.use(express.json()) // used to parse json requests
app.use(cors())
app.use(express.static(path.resolve(__dirname, './client/build')))

const roomData = {}

io.on('connection', async socket => {
  const { username } = socket.handshake.query
  console.log(username + '(' + socket.id + ') connected')

  socket.on('join-room', async roomName => {
    socket.roomName = roomName
    const roomSize = io.of('/').adapter.rooms.get(roomName)?.size || 0
    if (roomSize < 2) {
      socket.join(roomName)
      console.log(`${username} joined room - ${roomName}`)
      if (roomSize === 0) {
        roomData[roomName] = {
          fen: null,
          players: [],
          currentPlayer: null,
          restartCount: 0
        }
        roomData[roomName].players.push({ id: socket.id, username })
      } else {
        roomData[roomName].players.push({ id: socket.id, username })
        const rand = Math.round(Math.random())
        roomData[roomName].currentPlayer = roomData[roomName].players[rand]

        io.in(roomName).emit('init-game', {
          white: roomData[roomName].currentPlayer,
          black: roomData[roomName].players[+!rand]
        })
      }
    }
  })

  socket.on('played', async (fen, result, move) => {
    const { roomName } = socket
    if (result) {
      io.in(roomName).emit('game-over', {
        winner: result,
        finalState: fen
      })
    } else {
      roomData[roomName].fen = fen
      const index = roomData[roomName].players.findIndex(
        i => i.id === roomData[roomName].currentPlayer.id
      )
      roomData[roomName].currentPlayer = roomData[roomName].players[+!index]

      io.to(roomData[roomName].currentPlayer.id).emit('next-turn', {
        nextPlayer: roomData[roomName].currentPlayer,
        move
      })
    }
  })

  socket.on('restart-game', () => {
    roomData[roomName].restartCount++
    if (roomData[roomName].restartCount == 2) {
      const rand = Math.round(Math.random())
      roomData[roomName].gameState = Array(9).fill('')
      roomData[roomName].restartCount = 0
      roomData[roomName].currentPlayer = roomData[roomName].players[rand]

      io.in(roomName).emit('init-game', {
        x: roomData[roomName].currentPlayer,
        o: roomData[roomName].players[+!rand]
      })
    }
  })

  socket.on('disconnect', () => {
    const { roomName } = socket
    if (roomName) {
      io.in(roomName).emit('player-left')
      if (roomData[roomName].players?.length === 2) {
        roomData[roomName].players = roomData[roomName].players.filter(
          player => player.id !== socket.id
        )
      } else roomData[roomName] = null
    }
    console.log(`${socket.id} disconnected`)
  })
})

app.get('/checkRoom/:roomName', (req, res) => {
  if (roomData[req.params.roomName]?.players.length === 2) { res.status(404).send('room already taken') } else res.status(200).send('room available')
})

app.use((req, res, next) => {
  res.sendFile(path.resolve(__dirname, './client/build', 'index.html'))
})

server.listen(process.env.PORT || 5000, err => {
  if (!err) console.log('listening on *:5000')
})
