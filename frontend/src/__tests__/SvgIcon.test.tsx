import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { SvgIcon } from '../components/SvgIcon'

const RAW = '<svg width="90" height="90"><circle cx="10" cy="10" r="5"/></svg>'

describe('SvgIcon', () => {
  it('normalizes raw SVG (removes width/height, ensures viewBox)', () => {
    const { container } = render(<SvgIcon raw={RAW} className="h-6 w-6" />)
    const span = container.querySelector('span')
    expect(span).toBeTruthy()
    const svg = span!.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('100%')
    expect(svg.getAttribute('height')).toBe('100%')
    // either preexisting or derived from width/height
    expect(svg.getAttribute('viewBox')).toBeTruthy()
  })
})
