import { describe, expect, it } from 'vitest'

import { normalizeTransactionError } from './transactionErrors'

describe('normalizeTransactionError', () => {
  it('maps user rejection to a cancelled message', () => {
    expect(normalizeTransactionError(new Error('User denied transaction signature'))).toEqual({
      kind: 'rejected',
      message: 'Transaction cancelled',
    })
  })

  it('maps unknown failures to a generic error message', () => {
    expect(normalizeTransactionError(new Error('execution reverted'))).toEqual({
      kind: 'error',
      message: 'Transaction failed',
    })
  })
})
