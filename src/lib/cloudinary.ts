/**
 * رفع صورة على Cloudinary بنفس طريقة نسخة Flutter (Unsigned Upload
 * Preset) - القيم بتيجي من متغيرات بيئة Vite (.env بادئة VITE_).
 */
export async function uploadImageToCloudinary(file: File, folder: string): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', folder)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('فشل رفع الصورة، تأكد من اتصال الإنترنت وحاول تاني')
  }

  const data = await response.json()
  return data.secure_url as string
}
