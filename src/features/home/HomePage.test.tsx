import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('renders the hero copy, actions, and placeholder slots', () => {
    render(<HomePage />)

    expect(screen.getByRole('heading', { name: /bankeer/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enter game/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument()
    expect(screen.getAllByLabelText(/featured slot/i)).toHaveLength(3)
  })
})
