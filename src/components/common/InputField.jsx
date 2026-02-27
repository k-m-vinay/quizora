import { useState } from 'react'
import { HiEye, HiEyeSlash } from 'react-icons/hi2'

export default function InputField({
     label,
     type = 'text',
     name,
     value,
     onChange,
     placeholder,
     error,
     icon: Icon,
     required = false,
     disabled = false,
     className = '',
     ...props
}) {
     const [showPassword, setShowPassword] = useState(false)
     const isPassword = type === 'password'
     const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

     return (
          <div className={`space-y-1.5 ${className}`}>
               {label && (
                    <label htmlFor={name} className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                         {label}
                         {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
               )}
               <div className="relative">
                    {Icon && (
                         <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Icon className="h-4.5 w-4.5 text-surface-400" />
                         </div>
                    )}
                    <input
                         id={name}
                         name={name}
                         type={inputType}
                         value={value}
                         onChange={onChange}
                         placeholder={placeholder}
                         required={required}
                         disabled={disabled}
                         className={`input ${Icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''} ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                         {...props}
                    />
                    {isPassword && (
                         <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
                         >
                              {showPassword ? <HiEyeSlash className="h-4.5 w-4.5" /> : <HiEye className="h-4.5 w-4.5" />}
                         </button>
                    )}
               </div>
               {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
     )
}
