import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import CloseIcon from '@mui/icons-material/CloseRounded'
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
    let id = null
    if (loading) {
      id = setTimeout(() => setLoading(false), 5000)
    }
    return () => clearTimeout(id)
  }, [loading])

  const navigate = useNavigate()
  return (
    <Dialog
      fullWidth
      maxWidth='xs'
      open={isOpen}
      onClose={(event, reason) => {
        if (reason && reason !== 'backdropClick') onClose()
      }}
    >
      <DialogTitle>
        <Box display='flex' alignItems='center'>
          <Box flexGrow={1}>
            {winner === 'draw'
              ? "It's a draw!"
              : winner === 'Nobody'
                ? 'Uh-oh!'
                : `${winner} wins!`}
          </Box>
          {winner !== 'Nobody' && (
            <IconButton sx={{ p: 0, color: 'grey.400' }} onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
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
        {winner !== 'Nobody' && (
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
        )}
      </DialogActions>
    </Dialog>
  )
}

export default GameOverModal
