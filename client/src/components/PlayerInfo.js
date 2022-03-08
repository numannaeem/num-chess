import React from 'react'
import { Stack, Typography, useMediaQuery } from '@mui/material'
import CapturedPieces from './CapturedPieces'

function PlayerInfo ({
  opponent,
  gameHistory,
  white,
  black,
  username,
  oppTimer,
  yourTimer
}) {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'))

  return opponent
    ? (
        isMobile
          ? (
            <Stack
              direction='column'
              alignItems={{ xs: 'space-between', sm: 'center' }}
              justifyContent='start'
              flexGrow={1}
              width='100%'
              color='text.primary'
              mb={2}
            >
              <CapturedPieces
                align='end'
                gameHistory={gameHistory}
                color={white.username === username ? 'w' : 'b'}
              />
              <Stack
                direction='row'
                justifyContent='space-between'
                flexGrow={1}
                flexBasis='100%'
                alignItems='center'
                mt={1}
              >
                <Typography
                  lineHeight='100%'
                  mr={1}
                  fontWeight='600'
                  fontSize='1.9rem'
                  textAlign='center'
                >
                  {white.username === username ? black.username : white.username}
                </Typography>{' '}
                <Typography
                  borderRadius={5}
                  bgcolor='rgba(170,170,170,0.25)'
                  px={2}
                  py={0.5}
                  fontWeight='200'
                  fontSize='1rem'
                  textAlign='center'
                >
                  {Math.floor(oppTimer / 60) +
              ':' +
              `${oppTimer % 60 < 10 ? '0' : ''}${oppTimer % 60}`}
                </Typography>
              </Stack>
            </Stack>
            )
          : (
            <Stack
              justifyContent='end'
              alignItems='end'
              flexGrow={1}
              flexBasis={0}
              width='fill-available'
              alignSelf='start'
              color='text.primary'
              mr={3}
            >
              <Typography fontWeight='600' fontSize='3rem' textAlign='end'>
                {white.username === username ? black.username : white.username}
              </Typography>
              <Typography fontWeight='200' fontSize='2rem' textAlign='end' mb={1}>
                {Math.floor(oppTimer / 60) +
            ':' +
            `${oppTimer % 60 < 10 ? '0' : ''}${oppTimer % 60}`}
              </Typography>
              <CapturedPieces
                align='end'
                gameHistory={gameHistory}
                color={white.username === username ? 'w' : 'b'}
              />
            </Stack>
            )
      )
    : isMobile
      ? (
        <Stack
          direction='column'
          alignItems={{ xs: 'space-between', sm: 'center' }}
          justifyContent='start'
          flexGrow={1}
          width='100%'
          color='text.primary'
          mt={2}
        >
          <Stack
            direction='row'
            justifyContent='space-between' alignItems='center' mb={1}
          >
            <Typography
              lineHeight='100%'
              mr={1}
              fontWeight='600'
              fontSize='1.9rem'
              textAlign='center'
            >
              {white.username === username ? white.username : black.username}
            </Typography>{' '}
            <Typography
              borderRadius={5}
              bgcolor='rgba(170,170,170,0.25)'
              px={2}
              py={0.5}
              fontWeight='200'
              fontSize='1rem'
              textAlign='center'
            >
              {Math.floor(yourTimer / 60) +
            ':' +
            `${yourTimer % 60 < 10 ? '0' : ''}${yourTimer % 60}`}
            </Typography>
          </Stack>
          <CapturedPieces
            align='end'
            gameHistory={gameHistory}
            color={black.username === username ? 'w' : 'b'}
          />
        </Stack>
        )
      : (
        <Stack
          flexGrow={1}
          flexBasis={0}
          width='fill-available'
          alignSelf='end'
          color='text.primary'
          ml={3}
        >
          <CapturedPieces
            gameHistory={gameHistory}
            color={black.username === username ? 'w' : 'b'}
          />
          <Typography mt={1} fontWeight='200' fontSize='2rem' textAlign='start'>
            {Math.floor(yourTimer / 60) +
          ':' +
          `${yourTimer % 60 < 10 ? '0' : ''}${yourTimer % 60}`}
          </Typography>
          <Typography
            lineHeight='110%'
            fontWeight='600'
            fontSize='3rem'
            textAlign='start'
          >
            {white.username === username ? white.username : black.username}
          </Typography>
        </Stack>
        )
}

export default PlayerInfo
