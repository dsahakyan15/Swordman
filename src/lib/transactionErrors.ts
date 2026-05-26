export type NormalizedTransactionError = {
  kind: 'rejected' | 'error'
  message: string
}

export function normalizeTransactionError(error: unknown): NormalizedTransactionError {
  const message = error instanceof Error ? error.message : String(error)

  if (/user denied|rejected/i.test(message)) {
    return {
      kind: 'rejected',
      message: 'Transaction cancelled',
    }
  }

  return {
    kind: 'error',
    message: 'Transaction failed',
  }
}
