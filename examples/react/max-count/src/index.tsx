/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-24 21:08:24
 */
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { faker } from '@faker-js/faker'
import 'virtual:uno.css'

function App() {
  const containerRef = React.useRef<HTMLDivElement>(null)

  return (
    <div>
      <div>Max Line</div>
      <div ref={containerRef} className="w-400px inline-block border border-solid border-green">
        {Array.from({ length: 100 }).map((_, index) => {
          return <span key={index} data-index={index}>{faker.person.fullName()}</span>
        })}
      </div>
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
