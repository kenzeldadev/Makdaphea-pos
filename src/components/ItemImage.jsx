// Renders either an emoji placeholder or an uploaded (compressed) photo.
export default function ItemImage({ image, size = '3rem' }) {
  const isPhoto = /^(data:|blob:|https?:)/.test(image)
  if (isPhoto) {
    return (
      <img
        src={image}
        alt=""
        draggable={false}
        style={{ width: size, height: size }}
        className="pointer-events-none shrink-0 rounded-xl object-cover"
      />
    )
  }
  return (
    <span aria-hidden style={{ fontSize: size, lineHeight: 1 }} className="pointer-events-none shrink-0">
      {image || '🍽️'}
    </span>
  )
}
