import  { useState } from 'react'
import apiClient from '../../api/apiClient'

interface ModalProps {
  isOpen: boolean
  message: string
  url: string
  method?: 'POST' | 'PATCH' | 'DELETE'
  body?: Record<string, any>
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  onClose: () => void
}

/**
 * Confirmation modal that calls your API via axios.
 */
export default function Modal({
  isOpen,
  message,
  url,
  method = 'POST',
  body,
  onSuccess,
  onError,
  onClose
}: ModalProps) {
  const [loading, setLoading] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)

  const handleConfirm = async () => {
    setLoading(true)
    setErrorText(null)
    try {
      const response = await apiClient.request({
        url,
        method,
        data: body
      })
      onSuccess?.(response.data)
      onClose()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message
      setErrorText(msg)
      onError?.(err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center overflow-y-auto overflow-x-hidden h-[calc(100%-1rem)] max-h-full">
      <div className="relative p-4 w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
          >
            <svg className="w-3 h-3" aria-hidden="true" fill="none" viewBox="0 0 14 14">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">Close modal</span>
          </button>
          <div className="p-4 md:p-5 text-center">
            <svg
              className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
              aria-hidden="true"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              {message}
            </h3>
            {errorText && (
              <p className="mb-4 text-red-600 text-sm">{errorText}</p>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 disabled:opacity-50"
            >
              {loading ? 'Processing…' : "Yes, I'm sure"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-2.5 px-5 ml-3 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 disabled:opacity-50"
            >
              No, cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
