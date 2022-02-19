import React, { useState } from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import { useNavigate } from 'react-router-dom'
import cornyLine from '../taglines'
import {
  Divider,
  Fade,
  Grow,
  IconButton,
  InputAdornment,
  Link,
  Slide,
  TextField,
  Typography
} from '@mui/material'
import ArrowIcon from '@mui/icons-material/ArrowForwardIosRounded'

function HomeComponent ({ toast, socket }) {
  const [roomName, setRoomName] = useState('')
  const [entered, setEntered] = useState(false)
  const hoverStyles = text => {
    return {
      flexGrow: 0,
      width: '100%',
      '&:hover': {
        '&::after': {
          content: text,
          marginLeft: '5px'
        }
      }
    }
  }
  const navigate = useNavigate()
  const handleSubmit = () => {
    if (roomName.length === 6) {
      // setInputLoading(true)
      // e.preventDefault()
      // const res = await fetch(baseUrl+'/checkRoom/'+roomName)
      // if(res.ok) {
      //   navigate('room/' + roomName)
      // } else {
      //   setError(true)
      // }
      // setInputLoading(false)
      navigate('room', {
        state: {
          roomName
        }
      })
    }
  }

  return (
    <Box height='100vh' overflow='hidden' px={3} bgcolor='background.paper'>
      <Stack
        height='100%'
        alignItems='center'
        justifyContent='flex-end'
        spacing={10}
      >
        <Fade onEntered={() => setEntered(1)} in timeout={500}>
          <Box flexBasis='100%' mt={10} textAlign='center'>
            <Typography variant='h2' fontWeight={600} color='primary'>
              NumChess♙
            </Typography>
            <Typography mt={2} variant='subtitle1' color='text.secondary'>
              {cornyLine}
            </Typography>
          </Box>
        </Fade>
        <Grow in={entered >= 1} onEntered={() => setEntered(2)} timeout={400}>
          <Stack spacing={1} alignItems='center'>
            <Button
              color='primary'
              type='submit'
              variant='outlined'
              sx={hoverStyles('"⚔️"')}
              onClick={() => navigate('local-multiplayer')}
            >
              Local multiplayer
            </Button>
            <Divider variant='middle' />
            <TextField
              onKeyDown={e => e.key === 'Enter' && roomName.length === 6 && handleSubmit()}
              color='secondary'
              variant='outlined'
              size='small'
              label='Join Room'
              value={roomName}
              autoComplete='off'
              onChange={e => {
                if (
                  e.target.value.match(/^[0-9a-zA-Z]*$/) &&
                  e.target.value.length <= 6
                ) {
                  setRoomName(e.target.value.toUpperCase())
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      color='secondary'
                      disabled={roomName.length !== 6}
                      onClick={handleSubmit}
                      edge='end'
                    >
                      <ArrowIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Divider />
            <Button
              onClick={() => navigate('room')}
              color='secondary'
              type='submit'
              variant='outlined'
              sx={hoverStyles('"➕"')}
            >
              Create Room
            </Button>
            <Button
              onClick={() => navigate('matchmake')}
              color='secondary'
              type='submit'
              variant='outlined'
              sx={hoverStyles('"🔎"')}
            >
              Random Game
            </Button>
          </Stack>
        </Grow>
        <Slide timeout={600} direction='up' in={entered === 2}>
          <Box
            justifySelf='flex-end'
            py={2}
            px={3}
            borderRadius='1rem 1rem 0 0'
            bgcolor='rgba(155, 155, 155, 0.2)'
          >
            <Typography color='text.primary' fontWeight='600'>
              made by{' '}
              <Link
                target='_blank'
                sx={{
                  '&:hover': {
                    fontWeight: 'bolder',
                    color: 'gray'
                  }
                }}
                color='inherit'
                href='https://www.github.com/numannaeem'
                rel='noreferrer'
              >
                Numan Naeem<span className='wave'>&nbsp;👋</span>
              </Link>
            </Typography>
          </Box>
        </Slide>
      </Stack>
    </Box>
  )
}

export default HomeComponent
