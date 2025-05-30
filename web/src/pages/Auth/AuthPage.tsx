
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SignInForm, { type SignInValues } from './SignInForm'
import SignUpForm, { type SignUpValues } from './SignUpForm'
import Modal from '../../components/ui/Modal'
import Toast from '../../components/ui/Toast'

export default function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signIn'|'signUp'>('signIn')
  const [modalMessage, setModalMessage] = useState<string|null>(null)
  const [credentials, setCredentials] = useState<SignInValues|SignUpValues>()
  const [toast, setToast] = useState<{type:'success'|'error'; text:string}|null>(null)

  const toggleMode = () => {
    setMode(prev => prev === 'signIn' ? 'signUp' : 'signIn')
  }

  const showConfirm = (message: string, values: SignInValues|SignUpValues) => {
    setCredentials(values)
    setModalMessage(message)
  }

  const handleSuccess = (data: any) => {
    data = data || {}
    setModalMessage(null)
    setToast({ type:'success', text:'Welcome!' })
    navigate('/products')
  }

  const handleError = (err: Error) => {
    setModalMessage(null)
    setToast({ type:'error', text:err.message })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow">
        {mode === 'signIn' ? (
          <>
            <SignInForm onSubmit={(v) => showConfirm('Proceed with sign-in?', v)} onSwitchToSignUp={toggleMode}/>
          </>
        ) : (
          <>
            <SignUpForm onSubmit={(v) => showConfirm('Proceed with sign-up?', v)} onSwitchToSignIn={toggleMode}/>
          </>
        )}
      </div>

      {modalMessage && credentials && (
        <Modal
          isOpen={true}
          message={modalMessage}
          url={mode === 'signIn' ? '/auth/login' : '/auth/signup'}
          method="POST"
          body={credentials as Record<string, any>}
          onSuccess={handleSuccess}
          onError={handleError}
          onClose={() => setModalMessage(null)}
        />
      )}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.text}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
