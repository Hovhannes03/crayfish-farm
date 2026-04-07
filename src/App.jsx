import React, { useState } from 'react'
import './App.css'
import Header from './header/header'
import { Route, Routes } from 'react-router-dom'
import Home from './homepage/homepage'
import Blog from './blogpage/blogpage'
import HomeProductDetails from './productDetails/homeProductDetails'
import Footer from './footer/footer'

export const CountryContext = React.createContext("")

function App() {
  const [lang, setLang] = useState("am");
  const [search, setSearch] = useState("")
    
  return (
    <CountryContext.Provider value={{lang, setLang}}>
      <Header setSearch={setSearch} search={search}/>
      <Routes>
        <Route path="/" element={<Home search={search}/>} />
        <Route path='/products/:id' element={<HomeProductDetails/>}/>
        <Route path="/blog" element={<Blog />} />
      </Routes>
      <Footer />
    </CountryContext.Provider>
  )
}

export default App
