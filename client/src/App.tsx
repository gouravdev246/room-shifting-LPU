import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { HomePage } from './components/HomePage'
import { RoomAdd } from './components/RoomAdd'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen w-full flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/add-room" element={<RoomAdd />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
