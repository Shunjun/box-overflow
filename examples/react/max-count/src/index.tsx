/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-24 21:08:24
 */
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { faker } from '@faker-js/faker'
import Overflow from 'react-box-overflow'

import 'virtual:uno.css'

function App() {
  return (
    <div>
      <div>Max Line</div>
      <Overflow>
        {Array.from({ length: 100 }).map((_, index) => {
          return (
            <Overflow.Item key={index}>
              <span key={index}>{faker.person.fullName()}</span>
            </Overflow.Item>
          )
        })}
        <Overflow.Rest>123</Overflow.Rest>
      </Overflow>
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
