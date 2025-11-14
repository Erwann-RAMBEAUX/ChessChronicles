import { PropsWithChildren } from 'react'

/**
 * Simple titled section wrapper used inside the Filters panel.
 */
export function FilterSection({ title, children, inline = false }: PropsWithChildren<{ title: string; inline?: boolean }>) {
  if (inline) {
    return (
      <div className="flex items-center gap-3"> 
        <div className="text-sm text-gray-300 w-48">{title}</div>
        <div>{children}</div>
      </div>
    )
  }
  return (
    <div>
      <div className="text-sm text-gray-300 mb-1">{title}</div>
      {children}
    </div>
  )
}
