import { IconButton, Snackbar } from '@mui/material'
import { Check, Close } from '@mui/icons-material'
import React from 'react'

function RematchSnackbar ({ rematchSnackbarOpen, setRematchSnackbarOpen, handleAcceptRematch }) {
  return (
    <Snackbar
      open={rematchSnackbarOpen}
        // autoHideDuration={6000}
      onClose={() => setRematchSnackbarOpen(false)}
      message='Opponent wants a rematch. Accept?'
      action={
        <>
          <IconButton color='inherit' onClick={handleAcceptRematch}>
            <Check />
          </IconButton>
          <IconButton
            aria-label='close'
            color='inherit'
            onClick={() => setRematchSnackbarOpen(false)}
          >
            <Close />
          </IconButton>
        </>
        }
    />
  )
}

export default RematchSnackbar
