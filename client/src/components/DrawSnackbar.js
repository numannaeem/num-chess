import { IconButton, Snackbar } from '@mui/material'
import { Check, Close } from '@mui/icons-material'
import React from 'react'

function DrawSnackbar ({ drawSnackbarOpen, setDrawSnackbarOpen, handleAcceptDraw }) {
  return (
    <Snackbar
      open={drawSnackbarOpen}
        // autoHideDuration={6000}
      onClose={() => setDrawSnackbarOpen(false)}
      message='Opponent has offered a draw. Accept?'
      action={
        <>
          <IconButton color='inherit' onClick={handleAcceptDraw}>
            <Check />
          </IconButton>
          <IconButton
            aria-label='close'
            color='inherit'
            onClick={() => setDrawSnackbarOpen(false)}
          >
            <Close />
          </IconButton>
        </>
        }
    />
  )
}

export default DrawSnackbar
