const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const path = require('path')
const { Server } = require('socket.io')
const io = new Server(server)
const { addToRoom, createRoom } = require('./serverUtils')

app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === 'production' &&
    req.header('x-forwarded-proto') !== 'https'
  ) {
    res.redirect(`https://${req.header('host')}${req.url}`)
  } else next()
})
app.use(express.json()) // used to parse json requests
app.use(express.static(path.resolve(__dirname, './client/build')))
app.use((req, res, next) => {
  res.sendFile(path.resolve(__dirname, './client/build', 'index.html'))
})

const roomData = {}
const matchmakingRooms = []
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'

io.on('connection', async socket => {
  try {
    const { username } = socket.handshake.query
    console.log(username + ' (' + socket.id + ') connected')
    socket.on('create-room', ({ roomName, timeControl }) =>
      createRoom(socket, roomData, roomName, username, timeControl)
    )
    socket.on('join-room', roomName =>
      addToRoom(io, socket, roomData, roomName, username)
    )

    socket.on('played', async data => {
      try {
        const { roomName } = socket
        const index = roomData[roomName].players.findIndex(
          i => i.id === roomData[roomName].currentPlayer.id
        )
        roomData[roomName].currentPlayer = roomData[roomName].players[+!index]
        roomData[roomName].timeLeft = data.timeLeft
        if (data.result) {
          const winner = data.result
          // last player to play must've been the winner
          io.to(roomData[roomName].currentPlayer.id).emit('game-over', {
            winner,
            move: data.move
          })
        } else {
          roomData[roomName].fen = data.fen
          io.to(roomData[roomName].currentPlayer.id).emit('next-turn', {
            nextPlayer: roomData[roomName].currentPlayer,
            move: data.move,
            timeLeft: data.timeLeft
          })
        }
      } catch (error) {
        console.log(error)
        io.in(socket.roomName)
          .to(socket.id)
          .emit('error-occurred', error)
      }
    })

    socket.on('offer-draw', socketIdToOffer => {
      io.to(socketIdToOffer).emit('draw-offered')
    })

    socket.on('accept-draw', socketToAccept => {
      io.to(socketToAccept).emit('draw-accepted')
    })

    socket.on('offer-rematch', socketIdToOffer => {
      io.to(socketIdToOffer).emit('rematch-offered')
    })

    socket.on('accept-rematch', () => {
      const { roomName } = socket
      const rand = Math.round(Math.random())
      roomData[roomName].fen = null
      roomData[roomName].players[rand].color = 'white' // first player becomes white
      roomData[roomName].players[+!rand].color = 'black'
      roomData[roomName].timeLeft = {
        white: roomData[roomName].totalTime,
        black: roomData[roomName].totalTime
      }
      roomData[roomName].currentPlayer = roomData[roomName].players[rand]
      io.in(roomName).emit('rematch-accepted', {
        white: roomData[roomName].currentPlayer,
        black: roomData[roomName].players[+!rand],
        time: roomData[roomName].totalTime
      })
    })

    socket.on('resign', socketIdWhichWon => {
      io.to(socketIdWhichWon).emit('opponent-resigned')
    })

    socket.on('reconnect-to-room', roomName => {
      if (
        roomData[roomName] &&
        roomData[roomName].activePlayers === 1 &&
        roomData[roomName].players.length === 2
      ) {
        const playerData = roomData[roomName]?.players.find(
          p => p.username === username
        )
        if (playerData) {
          console.log(username + ' reconnecting to ' + roomName)
          roomData[roomName].activePlayers++
          socket.join(roomName)
          socket.roomName = roomName
          playerData.id = socket.id
          if (roomData[roomName].currentPlayer.username === username) {
            roomData[roomName].currentPlayer.id = socket.id
          }
          roomData[roomName].timeLeft[playerData.color] -= 40 // 40 second penalty on disconnect
          io.in(roomName).emit('update-data', roomData[roomName])
        }
      } else {
        socket.emit('game-finished')
      }
    })

    socket.on('timed-out', winner => {
      io.in(socket.roomName).emit('game-over', {
        winner,
        timedOut: true
      })
    })

    socket.on('matchmake', () => {
      if (matchmakingRooms.length === 0) {
        let temp = ''
        for (let i = 0; i < 6; i++) {
          const ch = alphabet[Math.round(Math.random() * (alphabet.length - 1))]
          temp = temp + ch
        }
        matchmakingRooms.push(temp)
        createRoom(socket, roomData, temp, username)
      } else {
        const roomName = matchmakingRooms.shift()
        addToRoom(io, socket, roomData, roomName, username)
      }
      console.log(matchmakingRooms)
    })

    socket.on('un-matchmake', () => {
      const { roomName } = socket
      if (roomName) {
        socket.leave(roomName)
        io.in(roomName).emit('player-left')
        const idx = matchmakingRooms.findIndex(r => r === roomName)
        matchmakingRooms.splice(idx, 1)
        roomData[roomName] = null
      }
    })

    socket.on('disconnect', () => {
      const { roomName } = socket
      if (roomName) {
        io.in(roomName).emit('player-left')
        if (roomData[roomName]) {
          roomData[roomName].activePlayers--
          if (roomData[roomName].activePlayers <= 0) {
            roomData[roomName] = null
          }
        }
      }
      console.log(`${username} (${socket.id}) disconnected`)
    })
  } catch (err) {
    console.log('ERROR: ' + err)
    io.in(socket.roomName)
      .to(socket.id)
      .emit('error-occurred', err)
  }
})

server.listen(process.env.PORT || 5000, err => {
  if (!err) console.log('listening on *:5000')
})
