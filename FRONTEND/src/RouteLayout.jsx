import React from 'react'
import Navbar from './components/Navbar.jsx'
import { Outlet } from '@tanstack/react-router'

const RootLayout = () => {
  return (
    <>
      <Navbar/>
      <Outlet/>
    </>
  )
}

export default RootLayout
