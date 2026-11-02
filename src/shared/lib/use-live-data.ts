import { useEffect, useRef, useState } from "react"

export interface LiveData<T> {
  data: T | undefined
  loading: boolean
  error: Error | undefined
}

interface Subscribable {
  subscribe(onChange: () => void): () => void
}

/**
 * Loads data from an async repository and reloads whenever the repository
 * says it changed. Repositories are async so a v1.1 online implementation can
 * drop in without screens changing.
 */
export function useLiveData<S extends Subscribable, T>(source: S, load: (source: S) => Promise<T>): LiveData<T> {
  const [state, setState] = useState<LiveData<T>>({ data: undefined, loading: true, error: undefined })
  // Keep the latest loader without re-subscribing every render.
  const loadRef = useRef(load)
  useEffect(() => {
    loadRef.current = load
  })

  useEffect(() => {
    let cancelled = false
    const run = () => {
      loadRef.current(source).then(
        (data) => {
          if (!cancelled) setState({ data, loading: false, error: undefined })
        },
        (error: unknown) => {
          if (cancelled) return
          setState((previous) => ({
            data: previous.data,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          }))
        },
      )
    }
    run()
    const unsubscribe = source.subscribe(run)
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [source])

  return state
}
