import React, { useState } from 'react'
import './App.css'
import HomeComponent from './components/HomeComponent'
import LocalMultiplayer from './components/LocalMultiplayer'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import NameScreen from './components/NameScreen'

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
    fontFamily: 'monospace'
  }
})

function App () {
  const [username, setUsername] = useState(localStorage.getItem('username'))
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
          <Route path='/' element={<HomeComponent toast={toast} />} />
          <Route path='/local-multiplayer' element={<LocalMultiplayer />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
