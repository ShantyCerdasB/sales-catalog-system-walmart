import  { useEffect } from 'react'

interface Props {
  type: 'success' | 'error'
  message: string
  onClose: () => void
}

/**
 * Toast notification at top-right that auto-dismisses.
 */
export default function Toast({ type, message, onClose }: Props) {
  useEffect(() => {
    const id = setTimeout(onClose, 3000)
    return () => clearTimeout(id)
  }, [onClose])

  const bg = type === 'success' ? 'bg-green-100' : 'bg-red-100'
  const text = type === 'success' ? 'text-green-800' : 'text-red-800'

  return (
    <div className={`fixed top-4 right-4 p-4 rounded shadow ${bg} ${text} z-50`}>
      <p>{message}</p>
    </div>
  )
}
