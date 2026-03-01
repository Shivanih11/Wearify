import { Pose } from '@mediapipe/pose'
import { Camera } from '@mediapipe/camera_utils'
import { useEffect, useRef, useState, type ChangeEventHandler } from 'react'
import { getClothingAssetUrl, getMyClothes, saveTryOn, uploadClothing, type ClothingItem } from '../lib/api'

const API_HOST = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api').replace('/api', '')

export function TryOnStudioPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [token, setToken] = useState(localStorage.getItem('wearify_token') ?? '')
  const [clothes, setClothes] = useState<ClothingItem[]>([])
  const [selectedCloth, setSelectedCloth] = useState<number | null>(null)
  const [status, setStatus] = useState('Upload a dress and start camera')
  const angleRef = useRef(0)
  const centerRef = useRef({ x: 320, y: 240, scale: 1 })

  const loadClothes = async () => {
    if (!token) return
    const items = await getMyClothes(token)
    setClothes(items)
    if (items[0]) setSelectedCloth(items[0].id)
  }

  useEffect(() => {
    loadClothes().catch(() => setStatus('Unable to load wardrobe'))
  }, [token])

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !selectedCloth || !token) return
    let camera: Camera | undefined
    const clothImg = new Image()
    clothImg.crossOrigin = 'anonymous'
    clothImg.src = `${API_HOST}${getClothingAssetUrl(selectedCloth, token).replace(API_HOST, '')}`

    const pose = new Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` })
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    pose.onResults((results) => {
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!
      const w = canvas.width
      const h = canvas.height

      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(results.image, 0, 0, w, h)

      const lm = results.poseLandmarks
      if (!lm || !clothImg.complete) return

      const leftShoulder = lm[11]
      const rightShoulder = lm[12]
      const leftHip = lm[23]
      const rightHip = lm[24]
      if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return

      const sx = (leftShoulder.x + rightShoulder.x) / 2 * w
      const sy = (leftShoulder.y + rightShoulder.y) / 2 * h
      const hipY = (leftHip.y + rightHip.y) / 2 * h
      const shoulderDist = Math.hypot((leftShoulder.x - rightShoulder.x) * w, (leftShoulder.y - rightShoulder.y) * h)
      const torsoHeight = Math.max(130, hipY - sy)

      const rawAngle = Math.atan2((rightShoulder.y - leftShoulder.y), (rightShoulder.x - leftShoulder.x))
      angleRef.current = angleRef.current * 0.8 + rawAngle * 0.2
      centerRef.current = {
        x: centerRef.current.x * 0.75 + sx * 0.25,
        y: centerRef.current.y * 0.75 + sy * 0.25,
        scale: centerRef.current.scale * 0.8 + shoulderDist / 180,
      }

      const clothWidth = shoulderDist * 1.8 * centerRef.current.scale
      const clothHeight = torsoHeight * 1.8

      ctx.save()
      ctx.translate(centerRef.current.x, centerRef.current.y + torsoHeight * 0.4)
      ctx.rotate(angleRef.current)
      ctx.drawImage(clothImg, -clothWidth / 2, -clothHeight / 2, clothWidth, clothHeight)
      ctx.restore()
    })

    camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await pose.send({ image: videoRef.current! })
      },
      width: 640,
      height: 480,
    })

    camera.start().then(() => setStatus('Live AR filter active'))

    return () => {
      camera?.stop()
    }
  }, [selectedCloth, token])

  const onUpload: ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0]
    if (!file || !token) return
    setStatus('Processing with AI background removal...')
    try {
      await uploadClothing(token, file, 'dress')
      setStatus('Clothing processed successfully')
      loadClothes()
    } catch {
      setStatus('Upload failed')
    }
  }

  const saveSnapshot = async () => {
    if (!canvasRef.current || !selectedCloth || !token) return
    const data = canvasRef.current.toDataURL('image/png')
    await saveTryOn(token, selectedCloth, data)
    setStatus('Snapshot saved to your wardrobe history')
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[2fr_1fr]">
      <section className="glass p-4">
        <h2 className="mb-3 text-xl font-semibold">Try-On Studio</h2>
        <video ref={videoRef} className="hidden" />
        <canvas ref={canvasRef} width={640} height={480} className="w-full rounded-xl border border-white/20" />
        <p className="mt-2 text-sm text-cyan-300">{status}</p>
      </section>
      <aside className="space-y-4">
        <div className="glass p-4">
          <h3 className="mb-2 font-semibold">Upload Dress</h3>
          <input type="file" accept="image/*" onChange={onUpload} className="w-full text-sm" />
        </div>
        <div className="glass p-4">
          <h3 className="mb-3 font-semibold">Clothing Gallery</h3>
          <div className="grid grid-cols-2 gap-2">
            {clothes.map((item) => (
              <button key={item.id} onClick={() => setSelectedCloth(item.id)} className={`rounded-lg border p-2 text-xs ${selectedCloth === item.id ? 'border-cyan-400' : 'border-white/20'}`}>
                #{item.id} {item.category}
              </button>
            ))}
          </div>
        </div>
        <button onClick={saveSnapshot} className="w-full rounded-xl bg-cyan-400 py-3 font-semibold text-slate-900">Take Snapshot</button>
      </aside>
    </main>
  )
}
