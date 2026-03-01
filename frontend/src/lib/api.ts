const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

export type ClothingItem = {
  id: number
  category: string
  processed_path: string
  width: number
  height: number
}

export async function signup(email: string, fullName: string, password: string) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, full_name: fullName, password }),
  })
  if (!res.ok) throw new Error('Signup failed')
  return res.json()
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error('Login failed')
  return res.json()
}

export async function uploadClothing(token: string, file: File, category: string) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('category', category)

  const res = await fetch(`${API_URL}/clothes/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  if (!res.ok) throw new Error('Upload failed')
  return res.json()
}

export async function getMyClothes(token: string): Promise<ClothingItem[]> {
  const res = await fetch(`${API_URL}/clothes/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to load clothes')
  return res.json()
}

export async function saveTryOn(token: string, clothingId: number, snapshotBase64: string) {
  const res = await fetch(`${API_URL}/tryon/save`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ clothing_id: clothingId, snapshot_base64: snapshotBase64 }),
  })
  if (!res.ok) throw new Error('Failed to save snapshot')
  return res.json()
}

export function getClothingAssetUrl(itemId: number, token: string) {
  return `${API_URL}/clothes/${itemId}/file?token=${encodeURIComponent(token)}`
}
