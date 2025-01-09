'use client'

import { useCallback, useEffect, useState } from 'react'
import * as faceapi from '@vladmandic/face-api'

const RETRY_DELAY = 2000 // 2 seconds
const MAX_RETRIES = 5

export const useFaceDetection = () => {
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let retries = 0

    const loadFaceApi = async () => {
      try {
        console.log('Starting to load face-api.js models...')
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
        console.log('Face-api.js models loaded successfully')
        setIsModelLoaded(true)
        setError(null)
      } catch (error) {
        console.error('Error loading face-api.js:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setError(`Failed to load face detection model: ${errorMessage}`)
        
        if (retries < MAX_RETRIES) {
          retries++
          console.log(`Retrying in ${RETRY_DELAY / 1000} seconds... (Attempt ${retries}/${MAX_RETRIES})`)
          setTimeout(loadFaceApi, RETRY_DELAY)
        } else {
          console.error('Max retries reached. Unable to load face-api.js')
          setError('Failed to load face detection model after multiple attempts. Please check your internet connection and refresh the page.')
        }
      }
    }

    loadFaceApi()

    return () => {
      // Cleanup function to cancel any ongoing operations if the component unmounts
      retries = MAX_RETRIES
    }
  }, [])

  const detectFace = useCallback(async (imageData: ImageData) => {
    if (!isModelLoaded) return null

    try {
      const detection = await faceapi.detectSingleFace(
        imageData,
        new faceapi.TinyFaceDetectorOptions()
      )

      if (detection) {
        return {
          x: detection.box.x + detection.box.width / 2,
          y: detection.box.y + detection.box.height / 2,
          size: (detection.box.width + detection.box.height) / 2
        }
      }
    } catch (error) {
      console.error('Error detecting face:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(`Error detecting face: ${errorMessage}`)
    }

    return null
  }, [isModelLoaded])

  return { detectFace, isModelLoaded, error }
}

