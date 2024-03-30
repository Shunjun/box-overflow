/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-24 21:08:24
 */
import React, { StrictMode, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { faker } from '@faker-js/faker'
import Overflow from 'react-box-overflow'

import 'virtual:uno.css'

function App() {
  const [maxCount, setMaxCount] = useState(10)
  const [dataCount, setDataCount] = useState(100)

  const prevList = useRef<string[]>([])
  const fakerData = useMemo (() => {
    const newData = [...prevList.current]
      .slice(0, dataCount)
      .concat (Array.from({ length: dataCount - prevList.current.length }).map(() => faker.person.fullName()))
    prevList.current = newData
    return newData
  }, [dataCount])

  return (
    <div>
      <div>Max Count</div>
      <div className="flex">
        <div>
          <label htmlFor="dataCount">dataCount</label>
          <input
            id="dataCount"
            type="number"
            value={dataCount}
            onChange={e => setDataCount(Number.parseInt(e.target.value))}
          />
        </div>
        <div>
          <label htmlFor="maxCount">maxCount</label>
          <input
            id="maxCount"
            type="number"
            value={maxCount}
            onChange={e => setMaxCount(Number.parseInt(e.target.value))}
          />
        </div>
      </div>
      <Overflow maxCount={maxCount} className="border border-solid p-2">
        {fakerData.map((data, index) => {
          return (
            <Overflow.Item key={index} id={index}>
              <span key={index}>{data}</span>
            </Overflow.Item>
          )
        })}
        <Overflow.Rest>Rest</Overflow.Rest>
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
