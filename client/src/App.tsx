import './App.css'
import { HomePage } from './components/HomePage'

function App() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground">
      <HomePage />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main page content goes here */}
      </main>
    </div>
  )
}

export default App
