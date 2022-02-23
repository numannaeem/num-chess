import React, { useEffect, useState } from 'react'
import { Stack } from '@mui/material'

const PieceIcon = ({ piece_color }) => (
  <img
    alt={piece_color}
    src={`./pieces/${piece_color}.png`}
    height={piece_color[0] === 'p' ? '21px' : '25px'}
    width={piece_color[0] === 'p' ? '17px' : '21px'}
		style={{objectFit:'cover'}}
  />
)

function CapturedPieces ({ gameHistory, color, align }) {
  const [capturedIcons, setCapturedIcons] = useState([])

  useEffect(() => {
    if (gameHistory[gameHistory.length - 1]?.captured !== null) {
      //if latest move is a capture - just to optimize
      const temp = []
      for (const move of gameHistory) {
        if (move.hasOwnProperty('captured') && move.color !== color) {
          temp.push(`${move.captured}-${color}`)
        }
      }
      setCapturedIcons(temp)
    }
  }, [color, gameHistory])

  return (
    <>
      {capturedIcons.length > 0 && (
        <Stack
				alignItems={'end'}
				justifyContent={align || 'start'}
				width={'fit-content'}
				maxWidth={'100%'}
				flexWrap='wrap'
				px={'5px'}
				py={'3px'}
          direction={'row'}
          bgcolor={'rgba(170,170,170,0.45)'}
          borderRadius={1}
        >
          {capturedIcons.map((i, idx) => (
            <PieceIcon piece_color={i} key={idx} />
          ))}
        </Stack>
      )}
    </>
  )
}

export default CapturedPieces
