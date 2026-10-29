import { useEffect, useRef } from "react"
import { animate, useReducedMotion } from "motion/react"

/** A number that counts smoothly to its new value, so dashboard changes are noticed without a flash. */
export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const previous = useRef(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (reduceMotion) {
      node.textContent = String(value)
      previous.current = value
      return
    }
    const controls = animate(previous.current, value, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        node.textContent = String(Math.round(latest))
      },
    })
    previous.current = value
    return () => controls.stop()
  }, [value, reduceMotion])

  return (
    <span ref={ref} className={className} aria-label={String(value)}>
      {value}
    </span>
  )
}
