const addToRoom = (io, socket, roomData, roomName, username) => {
  const roomSize = roomData[roomName]?.players.length || 0
  if (roomSize === 0) {
    socket.join(roomName)
    socket.roomName = roomName
    console.log(`${username} joined room - ${roomName}`)
    roomData[roomName] = {
      fen: null,
      players: [],
      currentPlayer: null,
      activePlayers: 1
    }
    roomData[roomName].players.push({ id: socket.id, username })
  } else if (roomSize === 1) {
    if (roomData[roomName].players[0].username === username) {
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
      roomName
    })
  }
}

module.exports = { addToRoom }
