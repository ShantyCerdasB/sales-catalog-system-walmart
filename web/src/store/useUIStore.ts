import { create } from 'zustand'

/**
 * UI state for shared elements like modals and toasts.
 */
interface UIStore {
  /** Whether a global confirmation modal is open */
  isModalOpen: boolean
  /** Message to display in the modal */
  modalMessage: string
  /** Open the modal with a message */
  openModal: (message: string) => void
  /** Close the modal */
  closeModal: () => void

  /** Toast notifications queue */
  toasts: string[]
  /** Add a new toast */
  addToast: (message: string) => void
  /** Remove the oldest toast */
  removeToast: () => void
}

export const useUIStore = create<UIStore>((set, get) => ({
  isModalOpen:  false,
  modalMessage: '',
  openModal:    (message) =>
    set({ isModalOpen: true, modalMessage: message }),
  closeModal:   () =>
    set({ isModalOpen: false, modalMessage: '' }),

  toasts:      [],
  addToast:    (message) =>
    set({ toasts: [...get().toasts, message] }),
  removeToast: () =>
    set({ toasts: get().toasts.slice(1) }),
}))
