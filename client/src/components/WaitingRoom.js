import { Box, Stack, Tooltip, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CubeSpinner, DominoSpinner, FlagSpinner, GuardSpinner, PongSpinner, SpiralSpinner } from 'react-spinners-kit'

function WaitingRoom ({ socket }) {
  const Loader = () => {
    const loaders = [
      <FlagSpinner size={40} color='#90caf9' loading />,
      <CubeSpinner size={30} frontColor='#90caf9' />,
      <PongSpinner size={80} color='#90caf9' />,
      <DominoSpinner size={100} color='#90caf9' />,
      <SpiralSpinner size={50} frontColor='#90caf9' />,
      <GuardSpinner size={50} frontColor='#90caf9' />
    ]
    return loaders[Math.floor(Math.random() * 6)]
  }
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
      localStorage.setItem('roomMeta', JSON.stringify({ roomName, time: new Date() }))
      navigate('/online-multiplayer', {
        state: data
      })
    })
  }, [socket, navigate, roomName])

  return (
    <Box
      bgcolor='background.paper'
      height='100vh'
      width='100vw'
      alignItems='center'
      justifyContent='center'
      display='flex'
      overflow='hidden'
    >
      <Stack p={3} spacing={2} alignItems='center' justifyContent='center'>
        <Tooltip title='Click to copy!' placement='top' arrow>
          <Box
            bgcolor='secondary.dark'
            sx={{
              cursor: 'pointer',
              transition: 'all 200ms',
              '&:hover': {
                transform: 'scale(1.1)'
              }
            }}
            px={3}
            py={2}
            onClick={() => navigator.clipboard?.writeText(roomName)}
          >
            <Typography color='white' variant='h4' textAlign='center'>
              Room ID: {roomName}
            </Typography>
          </Box>
        </Tooltip>
        <Typography color='primary' variant='subtitle1' textAlign='center'>
          waiting for your opponent
        </Typography>
        <Loader />
      </Stack>
    </Box>
  )
}

export default WaitingRoom
