import React, { useState, useEffect } from 'react'

/**
 * Field descriptor for the modal form.
 * - name: key in your data object
 * - label: human-friendly label
 * - type: “text” | “number” | “select”
 * - required: whether the field is required
 * - options: for selects, array of { value, label }
 */
export interface Field<T> {
  name: keyof T
  label: string
  type: 'text' | 'number' | 'select'
  required?: boolean
  options?: { value: string; label: string }[]
}

interface CrudModalProps<T extends { id?: string }> {
  /** Show or hide the modal */
  isOpen: boolean
  /** Title, e.g. “Create New Client” or “Edit Client” */
  title: string
  /** Field definitions */
  fields: Field<T>[]
  /** Initial values for editing; omit for create */
  initial?: Partial<T>
  /** Called with the form data on submit */
  onSubmit: (data: Partial<T>) => Promise<void> | void
  /** Close handler */
  onClose: () => void
}

/**
 * A Tailwind-styled modal that builds its form from `fields`.
 */
export default function CrudModal<T extends { id?: string }>({
  isOpen,
  title,
  fields,
  initial,
  onSubmit,
  onClose,
}: CrudModalProps<T>) {
  const [form, setForm] = useState<Partial<T>>(initial || {})
  const [submitting, setSubmitting] = useState(false)

  // Reset form whenever initial changes (open for edit vs create)
  useEffect(() => {
    setForm(initial || {})
  }, [initial, isOpen])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit(form)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-700 rounded-lg shadow-lg w-full max-w-md p-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {fields.map((field) => {
              const key = field.name as string
              const value = form[field.name] ?? ''
              return (
                <div key={key} className={field.type === 'select' ? 'col-span-2' : ''}>
                  <label
                    htmlFor={key}
                    className="block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {field.label}
                  </label>

                  {field.type === 'select' && field.options ? (
                    <select
                      id={key}
                      value={String(value)}
                      required={field.required}
                      onChange={e =>
                        setForm(f => ({
                          ...f,
                          [field.name]: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-gray-900 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    >
                      <option value="">Select {field.label.toLowerCase()}</option>
                      {field.options.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={key}
                      type={field.type}
                      value={String(value)}
                      required={field.required}
                      onChange={e =>
                        setForm(f => ({
                          ...f,
                          [field.name]:
                            field.type === 'number'
                              ? Number(e.target.value)
                              : e.target.value,
                        }))
                      }
                      className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-gray-900 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  )}
                </div>
              )
            })}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex justify-center items-center bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg px-5 py-2.5"
          >
            {submitting ? 'Saving…' : initial?.id ? 'Update' : 'Create'}
          </button>
        </form>
      </div>
    </div>
  )
}
