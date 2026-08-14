import { InputHTMLAttributes, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className, id, type, ...props }: InputProps) {
  const [reveal, setReveal] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={id} className="text-sm font-medium text-navy">{label}</label>}
      <div className="relative">
        <input
          id={id}
          type={isPassword && reveal ? 'text' : type}
          className={cn(
            'border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-primary focus:border-transparent transition w-full',
            isPassword && 'pr-11',
            error && 'border-red-500',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal(v => !v)}
            tabIndex={-1}
            aria-label={reveal ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition-colors"
          >
            {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
