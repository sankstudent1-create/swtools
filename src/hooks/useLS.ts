'use client'

import { useCallback } from 'react'
import { lsGet, lsAdd } from '@/lib/td-commission/pdf'

export function useLS() {
  const get = useCallback((key: string): string[] => lsGet(key), [])

  const add = useCallback((key: string, value: string): void => {
    lsAdd(key, value)
  }, [])

  const getFirst = useCallback((key: string): string => {
    const arr = lsGet(key)
    return arr[0] || ''
  }, [])

  return { get, add, getFirst }
}
