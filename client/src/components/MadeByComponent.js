import { ExpandLessRounded } from '@mui/icons-material'
import { Box, Link, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'

function MadeByComponent () {
  const [opened, setOpened] = useState({ open: true, touched: false })

  useEffect(() => {
    const interval = opened.touched === false ? setTimeout(() => setOpened(false), 3000) : null
    return () => clearTimeout(interval)
  }, [opened])
  return (
    <>
      <Box
        display='flex'
        alignItems='center'
        justifyContent='center'
      >
        <ExpandLessRounded
          onClick={() => setOpened(p => !p)}
          sx={{
            color: theme => theme.palette.text.primary,
            transform: opened ? 'rotate(180deg)' : ' translateY(145%)',
            transition: 'transform 400ms',
            cursor: 'pointer'
          }}
        />
      </Box>
      <Box
        sx={{
          transform: opened ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 400ms ease-out'
        }}
        position='relative'
        py={1}
        px={4}
        borderRadius='16px 16px 0 0'
        bgcolor='rgba(155, 155, 155, 0.2)'
      >
        <Typography fontSize='85%' color='text.primary' fontWeight='600'>
          made by{' '}
          <Link
            target='_blank'
            sx={{
              '&:hover': {
                color: theme => theme.palette.text.secondary
              }
            }}
            color='inherit'
            href='https://www.github.com/numannaeem'
            rel='noreferrer'
          >
            Numan Naeem
          </Link>
          {' '}
          <span className='wave'>👋</span>
        </Typography>
      </Box>
    </>
  )
}

export default MadeByComponent
