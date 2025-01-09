'use client'

import { useRef, useCallback } from 'react'

export const useWebcam = () => {
  const videoRef = useRef<HTMLVideoElement>(null)

  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (error) {
      console.error('Error accessing webcam:', error)
    }
  }, [])

  return { videoRef, startWebcam }
}

