import { Stack, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PongSpinner
} from 'react-spinners-kit'
import NavBar from './NavBar'

function Matchmaking ({ socket }) {
  const navigate = useNavigate()

  useEffect(() => {
    socket && socket.emit('matchmake')
  }, [socket])

  useEffect(() => {
    socket &&
      socket.on('init-game', data => {
        navigate('/online-multiplayer', {
          state: data
        })
      })
  }, [socket, navigate])

  return (
    <Stack
      bgcolor='background.paper'
      minHeight='100vh'
      alignItems='center'
      justifyContent='space-between'
      direction='column'
    >
      <NavBar onClick={() => {
        socket.emit('un-matchmake')
        navigate('/')
      }}
      />
      <Stack flexGrow={1} px={3} spacing={2} alignItems='center' justifyContent='center'>
        <Typography color='primary' variant='h6' textAlign='center'>
          searching for an opponent
        </Typography>
        <PongSpinner size={80} color='#90caf9' />
      </Stack>
    </Stack>
  )
}

export default Matchmaking
