"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Link {
  id: string
  title: string
  url: string
}

interface User {
  id: string
  name: string | null
  username: string | null
  email: string
  image: string | null
  bio: string | null
}

export default function Dashboard() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  
  const [user, setUser] = useState<User | null>(null)
  const [links, setLinks] = useState<Link[]>([])
  
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileUpdating, setProfileUpdating] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [linkLoading, setLinkLoading] = useState(false)
  
  const [editingLink, setEditingLink] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editUrl, setEditUrl] = useState("")
  
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

const loadProfile = async () => {
    try {
      setProfileLoading(true);
      setError(""); // เคลียร์ error เก่าก่อนเริ่มโหลดใหม่
      
      const res = await fetch("/api/user/profile");
      
      // ถ้า API พัง (เช่น 404 หา user ไม่เจอ หรือ 500 server error)
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Server Error:", errorData);
        throw new Error(errorData.message || "Failed to load profile");
      }
      
      const data = await res.json();
      console.log("Loaded Profile Data:", data); // ดูใน F12 ว่าข้อมูลมาครบไหม (name, username, bio)

      // นำข้อมูลมาเซตเข้า State
      setUser(data);
      setName(data.name ?? "");      // ใช้ ?? เพื่อกันกรณี null/undefined
      setUsername(data.username ?? "");
      setBio(data.bio ?? "");
      setPreviewImage(data.image ?? null);
      
    } catch (err) {
      console.error("Load Profile Error:", err);
      setError("Failed to load profile - ข้อมูลไม่โหลดหรือหาบัญชีไม่เจอ");
    } finally {
      setProfileLoading(false);
    }
  }

  const loadLinks = async () => {
    try {
      const res = await fetch("/api/link")
      if (!res.ok) throw new Error("Failed to load links")
      const data = await res.json()
      setLinks(data)
    } catch (err) {
      setError("Failed to load links")
    }
  }

  useEffect(() => {
    if (session) {
      loadProfile()
      loadLinks()
    }
  }, [session])

  const updateProfile = async () => {
    if (!name.trim() || !username.trim()) {
      setError("Name and username are required")
      return
    }
    setProfileUpdating(true)
    setError("")
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, bio }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "ชื่อนี้มีคนใช้แล้ว")
      }
      const updatedUserData = await res.json()
      setSuccess("Profile updated successfully!")
      await update({ name: updatedUserData.name })
      setTimeout(() => setSuccess(""), 3000)
      await loadProfile()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setProfileUpdating(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => { setPreviewImage(reader.result as string) }
    reader.readAsDataURL(file)
    setImageUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/user/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Failed to upload image")
      const data = await res.json()
      setUser(data)
      setPreviewImage(data.image)
      setSuccess("Profile picture updated!")
      await update({ image: data.image })
    } catch (err: any) {
      setError(err.message)
      setPreviewImage(user?.image || null)
    } finally {
      setImageUploading(false)
      e.target.value = ""
    }
  }

  const addLink = async () => {
  // 1. เช็กค่าว่างก่อน (สำคัญมาก)
  if (!title.trim() || !url.trim()) {
    setError("กรุณากรอกข้อมูลให้ครบครับ");
    return;
  }

  // 2. เช็กซ้ำเฉพาะเมื่อ links มีข้อมูลอยู่แล้วจริงๆ
  // และใช้ .trim() เพื่อกันช่องว่างที่เผลอพิมพ์เข้าไป
  const isDuplicate = links && links.length > 0 && links.some(
    link => link.url.trim().toLowerCase() === url.trim().toLowerCase()
  );

  if (isDuplicate) {
    setError("ลิ้งก์นี้คุณเคยเพิ่มไปแล้วครับ");
    return;
  }

  setLinkLoading(true);
  setError("");
  
  try {
    const res = await fetch("/api/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), url: url.trim() }), // ส่งค่าที่ trim แล้ว
    });

    // 3. ถ้า Backend ส่ง error กลับมา ให้เอา message จริงๆ มาโชว์
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "ลิ้งก์นี้มีคนใช้แล้ว");
    }

    setTitle("");
    setUrl("");
    setSuccess("Link added!");
    await loadLinks();
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLinkLoading(false);
  }
};

  const updateLink = async (id: string) => {
    try {
      const res = await fetch(`/api/link/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, url: editUrl }),
      })
      if (!res.ok) throw new Error("Failed to update link")
      setEditingLink(null)
      setSuccess("Link updated!")
      await loadLinks()
    } catch (err) { setError("Failed to update link") }
  }

  const deleteLink = async (id: string) => {
    if (!confirm("Are you sure?")) return
    try {
      const res = await fetch(`/api/link/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete link")
      setSuccess("Link deleted!")
      await loadLinks()
    } catch (err) { setError("Failed to delete link") }
  }

  if (status === "loading" || profileLoading) return <div className="p-6 text-center">Loading...</div>

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <button onClick={() => router.back()} className="bg-gray-200 px-4 py-2 rounded-lg">Back</button>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">{success}</div>}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-6">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 border-4 border-gray-200 flex items-center justify-center">
                {previewImage ? <img src={previewImage} className="w-full h-full object-cover" /> : <span className="text-gray-400 text-sm">No image</span>}
              </div>
              <div className="flex-1">
                <label className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer flex items-center justify-center">
                  <span className="text-sm text-gray-500">Click to upload</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={imageUploading} />
                </label>
              </div>
            </div>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-3 rounded-lg" placeholder="Name" />
            <input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))} className="w-full border p-3 rounded-lg" placeholder="Username" />
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full border p-3 rounded-lg" placeholder="Bio" rows={3} />
            <button onClick={updateProfile} disabled={profileUpdating} className="w-full bg-blue-600 text-white py-3 rounded-lg">{profileUpdating ? "Saving..." : "Save Profile"}</button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Add New Link</h2>
          <div className="space-y-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border p-3 rounded-lg" placeholder="Link title" />
            <input value={url} onChange={(e) => setUrl(e.target.value)} className="w-full border p-3 rounded-lg" placeholder="https://..." />
            <button onClick={addLink} disabled={linkLoading} className="w-full bg-green-600 text-white py-2 rounded-lg">Add Link</button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Your Links</h2>
          <div className="space-y-3">
            {links.map((link) => (
              <div key={link.id} className="border p-4 rounded-lg flex justify-between">
                <div>
                  <p className="font-bold">{link.title}</p>
                  <p className="text-sm text-gray-500">{link.url}</p>
                </div>
                <button onClick={() => deleteLink(link.id)} className="text-red-500">Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}