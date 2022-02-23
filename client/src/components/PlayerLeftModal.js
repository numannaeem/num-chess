import { Backdrop, Stack, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { StageSpinner } from 'react-spinners-kit'

function PlayerLeftModal ({ backdropOpen, onTimeout, setBackdropOpen }) {
  const [time, setTime] = useState(20)
  const timer = () => setTime(prev => prev - 1)

  useEffect(() => {
    const id = backdropOpen ? setInterval(timer, 1000) : null
    return () => {
      setTime(20)
      clearInterval(id)
    }
  }, [backdropOpen])

  useEffect(() => {
    if (time <= 0) {
      setBackdropOpen(false)
      onTimeout()
    }
  }, [time, onTimeout, setBackdropOpen])

  return (
    <Backdrop
      open={backdropOpen}
      sx={{
        backgroundColor: 'rgba(0,0,0,0.75)',
        // overflowY:'hidden',
        // height:'100vh',
        color: '#fff',
        zIndex: theme => theme.zIndex.drawer + 1
      }}
    >
      <Stack
        textAlign='center'
        p={4}
        alignItems='center'
        justifyContent='center'
      >
        <Typography fontSize='1.3rem'>
          Your opponent has disconnected :/
        </Typography>
        <StageSpinner size={70} color='#fff' loading />
        <Typography fontSize='1.1rem'>
          Waiting for them to rejoin: {time}
        </Typography>
      </Stack>
    </Backdrop>
  )
}

export default PlayerLeftModal
