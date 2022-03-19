import {
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { ArrowBackIos, Check, VolumeOff, VolumeUp } from '@mui/icons-material'
import React, { useState } from 'react'

function SettingsSubmenu ({
  setSettingsMenu,
  setTheme,
  theme,
  setUsername,
  toast,
  username,
  sound,
  setSound
}) {
  const [innerUsername, setInnerUsername] = useState(username)
  const [error, setError] = useState('')

  console.log(sound)

  const handleSubmit = () => {
    if (innerUsername.length < 3) {
      setError('Minimum 3 characters required')
      return
    }
    if (innerUsername.length > 15) {
      setError('Maximum 15 characters allowed')
      return
    }
    if (!innerUsername.match(/^[0-9a-zA-Z_]+$/)) {
      setError('Underscore is the only special character allowed')
      return
    }
    toast.success('Username set!', {
      position: 'top-right',
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      theme: 'colored'
    })
    setError('')
    setUsername(innerUsername)
    window.localStorage.setItem('username', innerUsername)
    setSettingsMenu(false)
  }

  return (
    <Stack py={5} spacing={1}>
      <Stack mb={1} position='relative' direction='row' alignItems='center'>
        <Button
          onClick={() => setSettingsMenu(false)}
          color='primary'
          sx={{
            padding: '5px 0px 5px 10px !important',
            minWidth: '0',
            position: 'absolute'
          }}
          variant='outlined'
        >
          <ArrowBackIos />
        </Button>
        <Typography
          px={4}
          py='6px'
          flexGrow={1}
          textAlign='center'
          color='primary.main'
        >
          SETTINGS
        </Typography>
      </Stack>
      <TextField
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        color='secondary'
        variant='outlined'
        helperText={error}
        error={error.length > 0}
        size='small'
        label='Change username'
        value={innerUsername}
        autoComplete='off'
        onChange={e => {
          if (e.target.value.length === 0) setError('')
          setInnerUsername(e.target.value)
        }}
        InputProps={{
          endAdornment:
            innerUsername.length && username !== innerUsername ? (
              <InputAdornment position='end'>
                <IconButton
                  color='secondary'
                  disabled={innerUsername.length === 0}
                  onClick={handleSubmit}
                  edge='end'
                >
                  <Check />
                </IconButton>
              </InputAdornment>
            ) : null
        }}
      />
      <Stack spacing={0.5} direction={'row'}>
        <Button
          color='secondary'
          type='submit'
          variant='outlined'
          fullWidth
          onClick={() => {
            setTheme(prev => {
              window.localStorage.setItem(
                'themeMode',
                prev === 'dark' ? 'light' : 'dark'
              )
              return prev === 'dark' ? 'light' : 'dark'
            })
          }}
        >
          Toggle theme: {theme === 'light' ? '☀️' : '🌙'}
        </Button>
        <Button
          color='secondary'
          variant='outlined'
          sx={{
            padding: '5px 10px !important',
            minWidth: '0'
          }}
          title={sound? 'Mute game sound': 'Unmute game sound'}
          onClick={() => {
            setSound(prev => {
              window.localStorage.setItem('sound', !prev)
              return !prev
            })
          }}
        >
          {sound ? <VolumeUp /> : <VolumeOff />}
        </Button>
      </Stack>
    </Stack>
  )
}

export default SettingsSubmenu
