/**
 * رفع صورة على Cloudinary بنفس طريقة نسخة Flutter (Unsigned Upload
 * Preset). القيم دي مش سرية حقيقية (تظهر أصلاً في أي طلب شبكة من
 * المتصفح)، فمحطوطة هنا مباشرة بدل GitHub Secrets - أبسط وأقل عرضة للغلط.
 */
const CLOUDINARY_CLOUD_NAME = 'xtfe29zu'
const CLOUDINARY_UPLOAD_PRESET = 'mosafer'

export async function uploadImageToCloudinary(file: File, folder: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('folder', folder)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('فشل رفع الصورة، تأكد من اتصال الإنترنت وحاول تاني')
  }

  const data = await response.json()
  return data.secure_url as string
}
