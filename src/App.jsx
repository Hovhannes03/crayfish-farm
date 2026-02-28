import { useState } from 'react'
import './App.css'
import Header from './header/header'
import { Route, Router, Routes } from 'react-router-dom'
import Home from './homepage/homepage'
import Blog from './blogpage/blogpage'
import HomeProductDetails from './productDetails/homeProductDetails'

function App() {
    const [search, setSearch] = useState("")
    console.log(search, "search");
    
  return (
    <>
      <Header setSearch={setSearch}/>
      <Routes>
        <Route path="/" element={<Home search={search}/>} />
        <Route path='/products/:id' element={<HomeProductDetails/>}/>
        <Route path="/blog" element={<Blog />} />
      </Routes>
    </>
  )
}

export default App
