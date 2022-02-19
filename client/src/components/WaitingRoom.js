import { Box, Stack, Tooltip, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { DominoSpinner } from 'react-spinners-kit'
import Navbar from './NavBar'

function WaitingRoom ({ socket }) {
  // const Loader = () => {
  //   const loaders = [
  //     <FlagSpinner size={40} color='#90caf9' loading />,
  //     <CubeSpinner size={30} frontColor='#90caf9' />,
  //     <PongSpinner size={80} color='#90caf9' />,
  //     <DominoSpinner size={100} color='#90caf9' />,
  //     <SpiralSpinner size={50} frontColor='#90caf9' />,
  //     <GuardSpinner size={50} frontColor='#90caf9' />
  //   ]
  //   return loaders[Math.floor(Math.random() * loaders.length)]
  // }
  const location = useLocation()
  const navigate = useNavigate()
  const enteredRoomName = location.state?.roomName || ''
  const [roomName, setRoomName] = useState(enteredRoomName)
  const [copied, setCopied] = useState(false)

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
    socket &&
      socket.on('init-game', data => {
        navigate('/online-multiplayer', {
          state: data
        })
      })
  }, [socket, navigate, roomName])

  return (
    <Stack
      bgcolor='background.paper'
      minHeight='100vh'
      alignItems='center'
      justifyContent='space-between'
    >
      <Navbar />
      <Stack
        flexGrow={1}
        p={3}
        spacing={2}
        alignItems='center'
        justifyContent='center'
      >
        <Tooltip
          title={copied ? 'Copied!' : 'Click to copy!'}
          placement='top'
          arrow
        >
          <Box
            border='2px solid'
            borderColor='secondary.main'
            borderRadius={1}
            sx={{
              cursor: 'pointer',
              transition: 'all 200ms',
              '&:hover': {
                transform: 'scale(1.1)'
              }
            }}
            px={3}
            py={2}
            onClick={() => {
              setCopied(true)
              navigator.clipboard?.writeText(roomName)
            }}
          >
            <Typography color='secondary.main' variant='h4' textAlign='center'>
              Room ID: {roomName}
            </Typography>
          </Box>
        </Tooltip>
        <Typography color='primary' variant='subtitle1' textAlign='center'>
          waiting for your opponent
        </Typography>
        <DominoSpinner size={100} color='#90caf9' />
      </Stack>
    </Stack>
  )
}

export default WaitingRoom
