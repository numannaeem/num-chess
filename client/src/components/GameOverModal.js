import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Modal,
  Typography
} from '@mui/material'
import { grey } from '@mui/material/colors'
import React from 'react'
import { useNavigate } from 'react-router-dom'

function GameOverModal ({ isOpen, onClose, winner, restartGame }) {
  const navigate = useNavigate()
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'fit-content',
    bgcolor: grey[900],
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    borderRadius: '1rem'
  }
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>
        {winner === 'd'
          ? "It's a draw!"
          : winner === 'b'
            ? 'Black wins by checkmate!'
            : 'White wins by checkmate!'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>That was quick 😯</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color='primary' onClick={() => navigate('/')}>
          Back to menu
        </Button>
        <Button
          color='primary'
          onClick={() => {
            restartGame()
            onClose()
          }}
          autoFocus
        >
          New game
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default GameOverModal
