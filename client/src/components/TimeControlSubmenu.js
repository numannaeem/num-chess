import {
  Button,
  Stack,
  Typography
} from '@mui/material'
import { ArrowBackIos } from '@mui/icons-material'
import React from 'react'
import { useNavigate } from 'react-router-dom'

function TimeControlSubmenu ({ setTimeControlMenu }) {
  const navigate = useNavigate()
  return (
    <Stack py={5} spacing={1}>
      <Stack mb={1} position='relative' direction='row' alignItems='center'>
        <Button
          onClick={() => setTimeControlMenu(false)}
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
          fontSize='90%'
          flexGrow={1}
          textAlign='center'
          textTransform='uppercase'
          color='primary.main'
        >
          Time control
        </Typography>
      </Stack>
      <Button
        color='secondary'
        type='submit'
        variant='outlined'
        fullWidth
        onClick={() =>
          navigate('/room', {
            state: { time: 300 }
          })}
      >
        5 mins
      </Button>
      <Button
        color='secondary'
        type='submit'
        variant='outlined'
        fullWidth
        onClick={() =>
          navigate('/room', {
            state: { time: 600 }
          })}
      >
        10 mins
      </Button>
      <Button
        color='secondary'
        type='submit'
        variant='outlined'
        fullWidth
        onClick={() =>
          navigate('/room', {
            state: { time: 1200 }
          })}
      >
        20 mins
      </Button>
    </Stack>
  )
}

export default TimeControlSubmenu
