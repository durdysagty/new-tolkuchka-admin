import { useState } from 'react'
import { keyframes } from '@emotion/react'
import { Autorenew } from '@mui/icons-material'


export default function AutorenewRotate(props) {


  const [toRotate, setToRotate] = useState(false)

  const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`
  function setRotate() {
    setToRotate(true)
    setTimeout(() => props.update(), 1000)
    setTimeout(() => setToRotate(false), 2000)
  }

  return <Autorenew onClick={setRotate} sx={{ cursor: 'pointer', animation: toRotate ? `${spin} 1s ease` : null }} />
}