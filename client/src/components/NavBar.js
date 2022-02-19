import { AppBar, IconButton, Toolbar, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/ArrowBackIos'
import React from 'react'
import { useNavigate } from 'react-router-dom'

function NavBar ({ onClick }) {
  const navigate = useNavigate()
  return (
    <AppBar sx={{ zIndex: 1202 }} position='static'>
      <Toolbar>
        <IconButton
          size='large'
          edge='start'
          color='inherit'
          aria-label='menu'
          sx={{ mr: 2 }}
          onClick={onClick || (() => navigate('/'))}
          title='Back to menu'
        >
          <MenuIcon />
        </IconButton>
        <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
          Back to menu
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

export default NavBar
