import React, { useEffect, useState } from 'react'
import { Stack } from '@mui/material'

const PieceIcon = ({ pieceDashColor }) => (
  <img
    alt={pieceDashColor}
    src={`./pieces/${pieceDashColor}.png`}
    height={pieceDashColor[0] === 'p' ? '21px' : '25px'}
    width={pieceDashColor[0] === 'p' ? '15px' : '23px'}
    style={{
      objectFit: 'cover',
      filter:
        pieceDashColor[2] === 'b'
          ? 'drop-shadow(1px 0px 0 white) drop-shadow(0px 1px 0 white) drop-shadow(-1px -0px 0 white) drop-shadow(-0px -1px 0 white)'
          : 'none'
    }}
  />
)

function CapturedPieces ({ gameHistory, color, align }) {
  const [capturedPieces, setCapturedPieces] = useState([])

  useEffect(() => {
    if (gameHistory[gameHistory.length - 1]?.captured !== null) {
      // 👆 if latest move is a capture - just to optimize
      const pieces = { p: 0, n: 0, b: 0, r: 0, q: 0 }
      for (const move of gameHistory) {
        if (move.captured && move.color !== color) {
          pieces[move.captured]++
        }
      }
      const final = []
      pieces.p > 0 && final.push(...new Array(pieces.p).fill(`p-${color}`))
      pieces.n > 0 && final.push(...new Array(pieces.n).fill(`n-${color}`))
      pieces.b > 0 && final.push(...new Array(pieces.b).fill(`b-${color}`))
      pieces.r > 0 && final.push(...new Array(pieces.r).fill(`r-${color}`))
      pieces.q > 0 && final.push(...new Array(pieces.q).fill(`q-${color}`))
      setCapturedPieces(final)
    }
  }, [color, gameHistory])

  return (
    <>
      {capturedPieces.length > 0
        ? (
          <Stack
            alignItems='end'
            justifyContent={align || 'start'}
            width='fit-content'
            maxWidth='100%'
            flexWrap='wrap'
            px='5px'
            py='3px'
            direction='row'
            bgcolor='rgba(170,170,170,0.2)'
            borderRadius={1}
          >
            {capturedPieces.map((p, idx) => (
              <PieceIcon key={idx} pieceDashColor={p} />
            ))}
          </Stack>
          )
        : (
          <div style={{ height: '27px', width: '1px' }} />
          )}
    </>
  )
}

export default CapturedPieces
