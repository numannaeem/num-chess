import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function GameOverModal ({
  isOpen,
  onClose,
  winner,
  restartGame,
  subtitleText,
  multiplayer
}) {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (loading) { setTimeout(() => setLoading(false), 5000) }
  }, [loading])

  const navigate = useNavigate()
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
    >
      <DialogTitle>
        {winner === 'draw' ? "It's a draw!" : `${winner} wins!`}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {subtitleText || 'What a game! 😯'}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color='primary' onClick={() => navigate('/')}>
          Back to menu
        </Button>
        <Button
          color='primary'
          disabled={loading}
          onClick={() => {
            restartGame()
            if (multiplayer) {
              setLoading(true)
              return
            }
            onClose()
          }}
        >
          {multiplayer ? 'Rematch' : 'New game'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default GameOverModal
