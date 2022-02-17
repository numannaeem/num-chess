import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'

function GameOverModal ({ isOpen, onClose, winner, restartGame, subtitleText }) {
  const navigate = useNavigate()
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>
        {winner === 'draw'
          ? "It's a draw!"
          : `${winner} wins!`}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{subtitleText || 'What a game! 😯'}</DialogContentText>
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
