import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material'
import ArrowIcon from '@mui/icons-material/ArrowForwardIosRounded'
import React, { useState } from 'react'

function NameScreen ({ setOuterUsername, toast }) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState(null)
  const handleSubmit = () => {
    if (username.length < 3) {
      setError('Minimum 3 characters required')
      return
    }
    if (username.length > 15) {
      setError('Maximum 15 characters allowed')
      return
    }
    if (!username.match(/^[0-9a-zA-Z_]+$/)) {
      setError('Underscore is the only special character allowed')
      return
    }
    setOuterUsername(username)
    window.localStorage.setItem('username', username)
    toast.success('Username set!', {
      position: 'top-right',
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      theme: 'colored'
    })
  }
  return (
    <Box
      px={2}
      display='flex'
      flexDirection='column'
      bgcolor='background.paper'
      minHeight='100vh'
      alignItems='center'
      justifyContent='center'
    >
      <Typography
        marginBottom={4}
        color='text.primary'
        textAlign='center'
        variant='h5'
      >
        Every great story begins with a name
      </Typography>
      <Box display='flex' width={{ xs: 'auto', md: '40%', lg: '30%' }}>
        <TextField
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          value={username}
          onChange={e => { setError(null); setUsername(e.target.value) }}
          fullWidth
          error={error}
          helperText={error}
          autoComplete='off'
          label="What's yours?"
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  color='primary'
                  disabled={username.length <= 0}
                  onClick={handleSubmit}
                  edge='end'
                >
                  <ArrowIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>
    </Box>
  )
}

export default NameScreen
