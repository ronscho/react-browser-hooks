import { useState, useEffect } from 'react'
import { IS_SERVER } from '../constants'

const defaultState = {
  height: null,
  width: null
}

export function useResize() {
  const [size, setSize] = useState(IS_SERVER ? defaultState : getWindowSize())

  function handleResize() {
    setSize(getWindowSize())
  }

  function getWindowSize() {
    return {
      height: window.innerHeight,
      width: window.innerWidth
    }
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize, false)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}
