'use client'

import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { useWebcam } from '@/hooks/useWebcam'
import { useFaceDetection } from '@/hooks/useFaceDetection'
import { useGameLogic } from '@/hooks/useGameLogic'

interface GameProps {
  onEnd: (result: 'dead' | 'win') => void
}

const Game: React.FC<GameProps> = ({ onEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const threeContainerRef = useRef<HTMLDivElement>(null)
  const { videoRef, startWebcam } = useWebcam()
  const { detectFace, isModelLoaded, error: faceDetectionError } = useFaceDetection()
  const { 
    distance, 
    isWatching, 
    distanceSinceWatching, 
    timeLeft, 
    updateGameState 
  } = useGameLogic(onEnd)

  const [sceneWidth, setSceneWidth] = useState(0)
  const [sceneHeight, setSceneHeight] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    startWebcam()
  }, [startWebcam])

  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, sceneWidth / sceneHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })

    renderer.setSize(sceneWidth, sceneHeight)
    threeContainerRef.current?.appendChild(renderer.domElement)

    camera.position.set(0, 2.8, 11)

    const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1)
    scene.add(light)

    const light2 = new THREE.AmbientLight(0x404040, 1.2)
    scene.add(light2)

    const spotLight = new THREE.SpotLight(0xffffff)
    spotLight.position.set(100, 1000, 100)
    scene.add(spotLight)

    const head = new THREE.Group()
    scene.add(head)

    const loader = new GLTFLoader()
    loader.load(
      'https://assets.codepen.io/127738/Squid_game_doll.gltf',
      (gltf) => {
        scene.add(gltf.scene)
        head.add(gltf.scene.children[0].children[0].children[0].children[1])
        head.add(gltf.scene.children[0].children[0].children[0].children[2])
        head.children[0].position.set(0, -8, 1)
        head.children[1].position.set(0, -8, 1)
        head.children[0].scale.setScalar(1)
        head.children[1].scale.setScalar(1)
        head.position.set(0, 8, -1)
      },
      undefined,
      (error: any) => console.error('An error happened', error)
    )

    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }

    animate()

    return () => {
      renderer.dispose()
    }
  }, [sceneWidth, sceneHeight])

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth > 1.9 * window.innerHeight
        ? window.innerWidth * 0.6
        : window.innerWidth * 0.95
      const height = width / 2
      setSceneWidth(width)
      setSceneHeight(height)
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    const processFrame = async () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        try {
          const face = await detectFace(imageData)

          if (face) {
            ctx.beginPath()
            ctx.arc(face.x, face.y, face.size / 2, 0, 2 * Math.PI, false)
            ctx.strokeStyle = '#d7327a'
            ctx.lineWidth = 4
            ctx.stroke()

            updateGameState(face.x, face.y)
          }
        } catch (error) {
          console.error('Error processing frame:', error)
          setError('Error processing video frame. Please try refreshing the page.')
        }
      }

      animationFrameId = requestAnimationFrame(processFrame)
    }

   // if (isModelLoaded) {
      processFrame()
   // } else if (faceDetectionError) {
    //  setError(faceDetectionError)
    //} else {
     // setError('Face detection model is loading. Please wait...')
   // }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [detectFace, updateGameState, videoRef, isModelLoaded, faceDetectionError])

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        {error.includes('loading') && (
          <p>This may take a few moments. If it persists, please refresh the page.</p>
        )}
      </div>
    )
  }

  return (
    <div className="game">
      <canvas ref={canvasRef} className="webcam" width={640} height={480} />
      <div ref={threeContainerRef} />
      <div className="timer"><span className="time">{formatTime(timeLeft)}</span></div>
      <div className="distance">
        <span className="total">{formatDistance(distance)}</span> /<span>100</span>
      </div>
      <div className="movement"><span className="total">{formatMovement(distanceSinceWatching)}</span></div>
      <video ref={videoRef} style={{ display: 'none' }} />
    </div>
  )
}

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const formatDistance = (distance: number): string => {
  return Math.min(100, Math.floor(distance)).toString().padStart(3, '0')
}

const formatMovement = (movement: number): string => {
  return `${Math.min(100, Math.floor(movement)).toString().padStart(2, '0')}%`
}

export default Game

