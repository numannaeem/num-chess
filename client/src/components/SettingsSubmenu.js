import {
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { ArrowBackIos, Check } from '@mui/icons-material'
import React, { useState } from 'react'

function SettingsSubmenu ({
  setSettingsMenu,
  setTheme,
  theme,
  setOuterUsername,
  toast
}) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (username.length < 3) {
      setError('Minimum 3 characters required')
      return
    }
    if (username.length > 10) {
      setError('Maximum 10 characters allowed')
      return
    }
    if (!username.match(/^[0-9a-zA-Z_]+$/)) {
      setError('Underscore is the only special character allowed')
      return
    }
    toast.success('Username set!', {
      position: 'bottom-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      theme: theme || 'dark'
    })
    setError('')
    setOuterUsername(username)
    window.localStorage.setItem('username', username)
    setSettingsMenu(false)
  }

  return (
    <Stack py={5} spacing={1}>
      <Stack mb={2} direction='row' alignItems='center'>
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
          flexGrow={1}
          textAlign='center'
          color='primary.main'
        >
          SETTINGS
        </Typography>
      </Stack>
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
        Toggle theme: {theme === 'light' ? '🏙️' : '🌃'}
      </Button>
      <TextField
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        color='secondary'
        variant='outlined'
        helperText={error}
        error={error}
        size='small'
        label='Change username'
        value={username}
        autoComplete='off'
        onChange={e => {
          if (e.target.value.length === 0) setError('')
          setUsername(e.target.value)
        }}
        InputProps={{
          endAdornment: username.length
            ? (
              <InputAdornment position='end'>
                <IconButton
                  color='secondary'
                  disabled={username.length === 0}
                  onClick={handleSubmit}
                  edge='end'
                >
                  <Check />
                </IconButton>
              </InputAdornment>
              )
            : null
        }}
      />
    </Stack>
  )
}

export default SettingsSubmenu
