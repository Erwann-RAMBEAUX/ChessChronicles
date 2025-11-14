import React, { useEffect, useRef, useState } from 'react'

export type Option = { value: string; label: string }

type Props = {
  options: Option[]
  value: string
  onChange: (v: string) => void
  buttonClassName?: string
  menuClassName?: string
  placeholder?: string
  widthClass?: string
}

export function Dropdown({ options, value, onChange, buttonClassName = '', menuClassName = '', placeholder = 'Select…', widthClass = 'w-full' }: Props) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const selected = options.find(o => o.value === value)
  const label = selected?.label ?? placeholder

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (!menuRef.current || !btnRef.current) return
      if (!menuRef.current.contains(t) && !btnRef.current.contains(t)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div className={`relative ${widthClass}`}>
      <button
        ref={btnRef}
        type="button"
        className={`select-btn ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <span className="truncate">{label}</span>
        <svg className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.187l3.71-3.956a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0l-4.24-4.52a.75.75 0 01.02-1.06z"/></svg>
      </button>
      {open && (
        <div ref={menuRef} role="listbox" className={`select-menu ${menuClassName}`}>
          {options.map(opt => (
            <button
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`select-item ${opt.value === value ? 'selected' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false) }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
