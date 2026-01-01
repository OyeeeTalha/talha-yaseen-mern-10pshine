import './App.css'

function App() {
  return (
    // 1. Container: Full screen height (h-screen), dark background (bg-slate-900)
    // 2. Layout: Flexbox to center everything (flex, justify-center, items-center)
    <div className="flex h-screen w-full items-center justify-center bg-slate-900">
      
      <div className="text-center">
        {/* 3. Typography: Large text (text-5xl), Bold, Blue color */}
        <h1 className="text-5xl font-bold text-red-500 mb-4">
          Hello World!
        </h1>
        
        <p className="text-slate-300 text-lg">
          Tailwind CSS is working perfectly.
        </p>
      </div>
      
    </div>
  )
}

export default App
