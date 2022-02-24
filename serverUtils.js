const defaultGameTime = 300

const createRoom = (socket, roomData, roomName, username, timeControl) => {
  if (socket.roomName) {
    const prevRoom = socket.roomName
    socket.leave(prevRoom)
    if (roomData[prevRoom]) {
      roomData[prevRoom].activePlayers--
      if (roomData[prevRoom].activePlayers <= 0) {
        roomData[prevRoom] = null
      }
    }
  }
  const roomSize = roomData[roomName]?.players.length || 0
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
        white: timeControl || defaultGameTime,
        black: timeControl || defaultGameTime
      },
      totalTime: timeControl || defaultGameTime
    }
    roomData[roomName].players.push({ id: socket.id, username })
  }
}

const addToRoom = (io, socket, roomData, roomName, username) => {
  if (socket.roomName) {
    const prevRoom = socket.roomName
    socket.leave(prevRoom)
    if (roomData[prevRoom]) {
      roomData[prevRoom].activePlayers--
      if (roomData[prevRoom].activePlayers <= 0) {
        roomData[prevRoom] = null
      }
    }
  }
  const roomSize = roomData[roomName]?.players.length || 0
  if (roomSize === 1) {
    if (roomData[roomName].players[0].username === username) {
      // if same username player joins the room
      return
    }
    socket.join(roomName)
    console.log(`${username} joined room - ${roomName}`)
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
      time: roomData[roomName].totalTime
    })
  } else {
    socket.emit('invalid-room-name')
  }
}

module.exports = { addToRoom, createRoom }
