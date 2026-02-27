import { HiXMark, HiExclamationTriangle } from 'react-icons/hi2'

export default function Modal({ isOpen, onClose, title, children, size = 'md', danger = false }) {
     if (!isOpen) return null

     const sizes = {
          sm: 'max-w-md',
          md: 'max-w-lg',
          lg: 'max-w-2xl',
          xl: 'max-w-4xl',
          full: 'max-w-6xl',
     }

     return (
          <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
               <div className="flex min-h-screen items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                         className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
                         onClick={onClose}
                    />

                    {/* Modal */}
                    <div className={`relative w-full ${sizes[size]} card-glass p-0 animate-scale-in z-10`}>
                         {/* Header */}
                         <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700">
                              <div className="flex items-center gap-3">
                                   {danger && (
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                             <HiExclamationTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                        </div>
                                   )}
                                   <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50">{title}</h3>
                              </div>
                              <button
                                   onClick={onClose}
                                   className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-all"
                              >
                                   <HiXMark className="w-5 h-5" />
                              </button>
                         </div>

                         {/* Body */}
                         <div className="px-6 py-4">
                              {children}
                         </div>
                    </div>
               </div>
          </div>
     )
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', loading = false }) {
     return (
          <Modal isOpen={isOpen} onClose={onClose} title={title} danger>
               <div className="space-y-4">
                    <p className="text-surface-600 dark:text-surface-400">{message}</p>
                    <div className="flex justify-end gap-3 pt-2">
                         <button onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
                         <button onClick={onConfirm} className="btn-danger" disabled={loading}>
                              {loading ? 'Processing...' : confirmText}
                         </button>
                    </div>
               </div>
          </Modal>
     )
}
