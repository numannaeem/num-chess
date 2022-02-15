import { Box, Stack, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FlagSpinner } from 'react-spinners-kit'

function WaitingRoom ({ socket }) {
  const location = useLocation()
  const navigate = useNavigate()
  const enteredRoomName = location.state?.roomName || ''
  const [roomName, setRoomName] = useState(enteredRoomName)

  useEffect(() => {
    if (!enteredRoomName) {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
      let temp = ''
      for (let i = 0; i < 6; i++) {
        const character =
          alphabet[Math.round(Math.random() * (alphabet.length - 1))]
        temp = temp + character
      }
      setRoomName(temp)
    }
  }, [enteredRoomName])

  // join room useEffect
  useEffect(() => {
    if (roomName) socket.emit('join-room', roomName)
  }, [socket, roomName])

  useEffect(() => {
    socket && socket.on('init-game', (data) => {
      navigate('/online-multiplayer', {
        state: data
      })
    })
  }, [socket, navigate])

  return (
    <Box
      bgcolor='background.paper'
      minHeight='100vh'
      minWidth='100vw'
      alignItems='center'
      justifyContent='center'
      display='flex'
    >
      <Stack spacing={2} alignItems='center' justifyContent='center'>
        <Box
          bgcolor='secondary.dark'
          sx={{
            transition: 'all 200ms',
            '&:hover': {
              transform: 'scale(1.3)'
            }
          }}
          px={3}
          py={2}
        >
          <Typography color='secondary.light' variant='h4' textAlign='center'>
            Room ID: {roomName}
          </Typography>
        </Box>
        <Typography color='primary' variant='subtitle1' textAlign='center'>
          Waiting for opponent to join
        </Typography>
        <FlagSpinner size={60} color='#90caf9' loading />
      </Stack>
    </Box>
  )
}

export default WaitingRoom
