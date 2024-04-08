/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-24 21:08:24
 */
import React, { useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { faker } from '@faker-js/faker'
import { BoxOverflow } from 'react-box-overflow'

import 'virtual:uno.css'

function App() {
  const [maxLine, setMaxLine] = useState(2)
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
          <label htmlFor="maxCount">maxLine</label>
          <input
            id="maxCount"
            type="number"
            value={maxLine}
            onChange={e => setMaxLine(Number.parseInt(e.target.value))}
          />
        </div>
      </div>
      <BoxOverflow maxLine={maxLine} className="border border-solid p-2">
        <BoxOverflow.Prefix>**Prefix**</BoxOverflow.Prefix>
        <BoxOverflow.Suffix>**Suffix**</BoxOverflow.Suffix>
        {fakerData.map((data, index) => {
          return (
            <BoxOverflow.Item key={index} id={index}>
              <span key={index}>{data}</span>
            </BoxOverflow.Item>
          )
        })}
        <BoxOverflow.Rest>{(rests: string[]) => `+${rests.length}` }</BoxOverflow.Rest>
      </BoxOverflow>
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(
  // <StrictMode>
  <App />,
  // </StrictMode>,
)
