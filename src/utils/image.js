import imageCompression from 'browser-image-compression'

// Shrink a camera/gallery photo to ~480px and <80KB so IndexedDB stays small and the UI fast.
export async function fileToCompressedDataUrl(file) {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.08,
    maxWidthOrHeight: 480,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.8,
  })
  return imageCompression.getDataUrlFromFile(compressed)
}
