import React, { useState, useEffect } from 'react'

/**
 * Props for the ClientForm.
 * - `initial` can be used for edits; omit for "create".
 */
interface Client {
  id?: string
  code: string
  name: string
  nit: string
  email?: string
  phone?: string
}

interface Props {
  initial?: Client
  onSubmit: (client: Client) => void
}

const ClientForm: React.FC<Props> = ({ initial, onSubmit }) => {
  // Initialize form state with initial values or empty strings
  const [form, setForm] = useState<Client>({
    code: '',
    name: '',
    nit: '',
    email: '',
    phone: '',
    ...initial,
  })
  const [error, setError] = useState<string|null>(null)

  // Update form if `initial` changes (for edit forms)
  useEffect(() => {
    if (initial) {
      setForm({ ...form, ...initial })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.code || !form.name || !form.nit) {
      setError('Code, Name and NIT are required.')
      return
    }
    setError(null)
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700">Code</label>
        <input
          name="code"
          value={form.code}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">NIT</label>
        <input
          name="nit"
          value={form.nit}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-500"
      >
        Save Client
      </button>
    </form>
  )
}

export default ClientForm
