const gameTime = 600

const addToRoom = (io, socket, roomData, roomName, username) => {
  const roomSize = roomData[roomName]?.players.length || 0
  if (socket.roomName) {
    socket.leave(roomName)
    roomData[roomName].activePlayers--
    if (roomData[roomName].activePlayers === 0) {
      roomData[roomName] = null
    }
  }
  if (roomSize === 0) {
    socket.join(roomName)
    socket.roomName = roomName
    console.log(`${username} joined room - ${roomName}`)
    roomData[roomName] = {
      fen: null,
      players: [],
      currentPlayer: null,
      activePlayers: 1,
      timeLeft: {
        white: gameTime,
        black: gameTime
      }
    }
    roomData[roomName].players.push({ id: socket.id, username })
  } else if (roomSize === 1) {
    if (roomData[roomName].players[0].username === username) {
      //if same username player joins the room
      return
    }
    socket.join(roomName)
    socket.roomName = roomName
    roomData[roomName].players.push({ id: socket.id, username })
    const rand = Math.round(Math.random())
    roomData[roomName].players[rand].color = 'white' // first player becomes white
    roomData[roomName].players[+!rand].color = 'black'
    roomData[roomName].currentPlayer = roomData[roomName].players[rand]
    roomData[roomName].activePlayers++
    io.in(roomName).emit('init-game', {
      white: roomData[roomName].currentPlayer,
      black: roomData[roomName].players[+!rand],
      roomName,
      time: gameTime
    })
  }
}

module.exports = { addToRoom }
