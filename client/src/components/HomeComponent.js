import React, { useState } from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import { useNavigate } from 'react-router-dom'
import cornyLine from '../taglines'
import {
  Divider,
  Fade,
  IconButton,
  InputAdornment,
  Link,
  Slide,
  SvgIcon,
  TextField,
  Typography
} from '@mui/material'
import ArrowIcon from '@mui/icons-material/ArrowForwardIosRounded'
import { ReactComponent as Logo } from '../svgIcons/knightLogo.svg'
import SettingsSubmenu from './SettingsSubmenu'

function HomeComponent ({
  toast,
  socket,
  setTheme,
  theme,
  setUsername,
  username
}) {
  const [roomName, setRoomName] = useState('')
  const [entered, setEntered] = useState(false)
  const [settingsMenu, setSettingsMenu] = useState(false)

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
      navigate('room', {
        state: {
          roomName
        }
      })
    }
  }

  return (
    <Box
      height='100vh'
      overflow='hidden'
      sx={{
        transition: 'background-color 300ms ease-out'
      }}
      px={3}
      bgcolor='background.paper'
    >
      <Stack height='100%' alignItems='center' justifyContent='space-between'>
        <Fade onEntered={() => setEntered(1)} in timeout={500}>
          <Stack
            alignItems='center'
            justifyContent='center'
            flexGrow={1}
            textAlign='center'
            py={2}
            mx={2}
          >
            <Typography variant={'h3'} fontWeight={600} color='primary'>
              NumChess 
              <SvgIcon className='logo' sx={{marginLeft: 1, filter: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, .7))'}} fontSize='inherit' >
                <Logo />
              </SvgIcon>
            </Typography>
            <Typography mt={1} variant='subtitle1' color='text.secondary'>
              {cornyLine}
            </Typography>
          </Stack>
        </Fade>
        <Box position='relative'>
          <Slide
            direction='right'
            in={entered >= 1 && !settingsMenu}
            onEntered={() => setEntered(2)}
            timeout={{ enter: 300, exit: 100 }}
          >
            <Stack py={5} spacing={1} alignItems='center'>
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
              <Button
                onClick={() => navigate('room')}
                color='secondary'
                type='submit'
                variant='outlined'
                sx={hoverStyles('"➕"')}
              >
                Create Room
              </Button>
              <TextField
                onKeyDown={e =>
                  e.key === 'Enter' && roomName.length === 6 && handleSubmit()
                }
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

              <Button
                onClick={() => navigate('matchmake')}
                color='secondary'
                type='submit'
                variant='outlined'
                sx={hoverStyles('"🔎"')}
              >
                Find Game
              </Button>
              <Divider />

              <Button
                onClick={() => setSettingsMenu(true)}
                color='primary'
                type='submit'
                variant='outlined'
                sx={hoverStyles('"⚙️"')}
              >
                Settings
              </Button>
            </Stack>
          </Slide>
          <Slide
            unmountOnExit
            direction='left'
            in={entered >= 1 && settingsMenu}
            onEntered={() => setEntered(2)}
            timeout={{ enter: 300, exit: 100 }}
          >
            <Box width='100%' top='0' position='absolute'>
              <SettingsSubmenu
                setTheme={setTheme}
                toast={toast}
                setUsername={setUsername}
                theme={theme}
                username={username}
                setSettingsMenu={setSettingsMenu}
              />
            </Box>
          </Slide>
        </Box>
        <Slide timeout={600} direction='up' in={entered === 2}>
          <Box
            justifySelf='flex-end'
            py={1}
            px={3}
            borderRadius='1rem 1rem 0 0'
            bgcolor='rgba(155, 155, 155, 0.2)'
          >
            <Typography fontSize={'85%'} color='text.primary' fontWeight='600'>
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
