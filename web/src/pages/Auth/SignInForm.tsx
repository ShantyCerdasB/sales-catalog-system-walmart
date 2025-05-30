import React, { useState } from 'react'

export interface SignInValues {
  username: string
  password: string
}

interface Props {
  onSubmit: (values: SignInValues) => void
  onSwitchToSignUp: () => void
}

export default function SignInForm({ onSubmit, onSwitchToSignUp }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username || !password) {
      setError('Both fields are required.')
      return
    }
    setError(null)
    setSubmitting(true)
    onSubmit({ username, password })
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
          Sign in to your account
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
            value={username}
            onChange={e => setUsername(e.target.value)}
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
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-500 disabled:opacity-50"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Not a member?{' '}
        <button
          onClick={onSwitchToSignUp}
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Register now
        </button>
      </p>
    </div>
  )
}
