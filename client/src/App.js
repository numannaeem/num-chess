import React, { useEffect, useState } from 'react'
import HomeComponent from './components/HomeComponent'
import LocalMultiplayer from './components/LocalMultiplayer'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { ToastContainer, toast, Flip } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import NameScreen from './components/NameScreen'
import WaitingRoom from './components/WaitingRoom'
import { io } from 'socket.io-client'
import baseUrl from './baseUrl'
import OnlineMultiplayer from './components/OnlineMultiplayer'
import { Box, Typography } from '@mui/material'
import Matchmaking from './components/Matchmaking'

function App () {
  const [username, setUsername] = useState(
    window.localStorage.getItem('username')
  )
  const [themeMode, setThemeMode] = useState(
    window.localStorage.getItem('themeMode') || 'dark'
  )
  const [socket, setSocket] = useState(null)
  const [online, setOnline] = useState(window.navigator.onLine)

  const theme = createTheme({
    palette: {
      mode: themeMode
    },
    typography: {
      fontFamily: 'JetBrains Mono, monospace'
    }
  })

  useEffect(() => {
    const newSocket = io(baseUrl, {
      transports: ['websocket', 'polling', 'flashsocket'],
      query: {
        username
      }
    })
    setSocket(newSocket)

    return () => newSocket.close()
  }, [username])

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    socket?.on('error-occurred', () => {
      toast.error(<ErrorToast />, {
        position: 'top-right',
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: true,
        draggable: true,
        theme: 'colored',
        onClick: () => {
          window.location.assign('/')
        }
      })
    })
  }, [socket])

  const ErrorToast = () => {
    return (
      <Box>
        <Typography fontWeight='bolder'>Something went wrong!</Typography>
        <Typography fontSize='80%'>
          Click here to return to menu and start a new game :/
        </Typography>
      </Box>
    )
  }
  return (
    <ThemeProvider theme={theme}>
      {!username ? (
        <NameScreen setOuterUsername={setUsername} toast={toast} />
      ) : (
        <BrowserRouter>
          <Routes>
            <Route
              path='/'
              element={
                <HomeComponent
                  online={online}
                  theme={themeMode}
                  username={username}
                  setUsername={setUsername}
                  setTheme={setThemeMode}
                  toast={toast}
                  socket={socket}
                />
              }
            />
            <Route path='/local-multiplayer' element={<LocalMultiplayer />} />
            {online && (
              <Route path='/room' element={<WaitingRoom socket={socket} />} />
            )}
            {online && (
              <Route
                path='/matchmake'
                element={<Matchmaking socket={socket} />}
              />
            )}
            {socket && (
              <Route
                path='/online-multiplayer'
                element={
                  <OnlineMultiplayer username={username} socket={socket} />
                }
              />
            )}
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
          <ToastContainer transition={Flip} />
        </BrowserRouter>
      )}
    </ThemeProvider>
  )
}

export default App
