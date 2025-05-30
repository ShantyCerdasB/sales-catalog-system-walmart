import React, { useState } from 'react'

export interface SignUpValues {
  username: string
  email:    string
  password: string
}

interface Props {
  onSubmit: (values: SignUpValues) => void
  onSwitchToSignIn: () => void
}

export default function SignUpForm({ onSubmit, onSwitchToSignIn }: Props) {
  const [form, setForm] = useState({
    username: '',
    email:    '',
    password: '',
    confirm:  '',
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.username || !form.email || !form.password || !form.confirm) {
      setError('All fields are required.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    setError(null)
    setSubmitting(true)
    onSubmit({
      username: form.username,
      email:    form.email,
      password: form.password,
    })
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <img
          alt="Logo"
          src="/logo192.png"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-2xl font-bold text-gray-900">
          Create your account
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6 sm:mx-auto sm:w-full sm:max-w-sm">
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-900">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-900">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-900">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-gray-900">
            Confirm Password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            value={form.confirm}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-500 disabled:opacity-50"
        >
          {submitting ? 'Creating…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <button
          onClick={onSwitchToSignIn}
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Sign in
        </button>
      </p>
    </div>
  )
}
