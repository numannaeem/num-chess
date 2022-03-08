import { Box, Stack, Tooltip, Typography, useMediaQuery } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { DominoSpinner } from 'react-spinners-kit'
import Navbar from './NavBar'

function WaitingRoom ({ socket }) {
  const location = useLocation()
  const navigate = useNavigate()
  const enteredRoomName = location.state?.roomName || ''
  const timeControl = location.state?.time || 600
  const [roomName, setRoomName] = useState(enteredRoomName)
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const [invalidRoomName, setInvalidRoomName] = useState(false)
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('sm'))

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
    if (enteredRoomName) socket.emit('join-room', enteredRoomName)
    else if (roomName) socket.emit('create-room', { roomName, timeControl })
  }, [enteredRoomName, socket, roomName, timeControl])

  useEffect(() => {
    socket?.on('init-game', data => {
      navigate('/online-multiplayer', {
        state: data
      })
    })
    socket?.on('invalid-room-name', () => {
      setInvalidRoomName(true)
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
        {!invalidRoomName
          ? (
            <>
              <Tooltip
                title={copied ? 'Copied!' : isMobile ? 'Tap to copy' : 'Click to copy!'}
                placement='top'
                arrow
                enterTouchDelay={0}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                open={isMobile || open}
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
                  <Typography
                    color='secondary.main'
                    variant='h4'
                    textAlign='center'
                  >
                    Room ID: {roomName}
                  </Typography>
                </Box>
              </Tooltip>
              <Typography color='secondary' variant='subtitle1' textAlign='center'>
                time control: {Math.round(timeControl / 60)} mins
              </Typography>
              <Typography color='primary' variant='subtitle1' textAlign='center'>
                waiting for your opponent
              </Typography>
              <DominoSpinner size={100} color='#90caf9' />
            </>
            )
          : (
            <>
              <Typography color='error' variant='subtitle1' textAlign='center'>
                invalid room name entered!
              </Typography>
              <Typography variant='subtitle1' textAlign='center' color='grey.600'>
                go back to menu and re-enter the room name, maybe?
              </Typography>
            </>
            )}
      </Stack>
    </Stack>
  )
}

export default WaitingRoom
