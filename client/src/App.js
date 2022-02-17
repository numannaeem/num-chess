import React, { useEffect, useState } from 'react'
import './App.css'
import HomeComponent from './components/HomeComponent'
import LocalMultiplayer from './components/LocalMultiplayer'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import NameScreen from './components/NameScreen'
import WaitingRoom from './components/WaitingRoom'
import { io } from 'socket.io-client'
import baseUrl from './baseUrl'
import OnlineMultiplayer from './components/OnlineMultiplayer'
import { Typography, Box } from '@mui/material'

const theme = createTheme({
  palette: {
    mode: 'dark'
    // primary: {
    //   main: "#673ab7",
    //   light:"#9a67ea",
    //   dark:"#320b86"
    // },
    // secondary: {
    //   main: "#ffc107",
    //   light:"#fff350",
    //   dark:"#c79100"
    // }
  },
  typography: {
    fontFamily: 'JetBrains Mono, monospace'
  }
})

function App () {
  const [username, setUsername] = useState(localStorage.getItem('username'))
  const [socket, setSocket] = useState(null)

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

  if (!username) {
    return (
      <ThemeProvider theme={theme}>
        <NameScreen setOuterUsername={setUsername} toast={toast} />
      </ThemeProvider>
    )
  }
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomeComponent toast={toast} socket={socket} />} />
          <Route path='/local-multiplayer' element={<LocalMultiplayer />} />
          <Route path='/room' element={<WaitingRoom socket={socket} />} />
          {socket && <Route path='/online-multiplayer' element={<OnlineMultiplayer username={username} socket={socket} />} />}
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
