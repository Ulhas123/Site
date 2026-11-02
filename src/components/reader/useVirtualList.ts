import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface UseVirtualListOptions {
  totalItems: number
  rowHeight: number
  overscan?: number
  containerHeight?: number
}

export interface VirtualItem {
  index: number
  offsetTop: number
}

export function useVirtualList({
  totalItems,
  rowHeight,
  overscan = 4,
  containerHeight = 480,
}: UseVirtualListOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [measuredHeight, setMeasuredHeight] = useState(containerHeight)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const updateHeight = () => {
      if (el.clientHeight > 0) {
        setMeasuredHeight(el.clientHeight)
      }
    }

    updateHeight()

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => updateHeight())
      ro.observe(el)
      return () => ro.disconnect()
    }
  }, [])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  const totalHeight = totalItems * rowHeight

  const { virtualItems, startIndex, endIndex } = useMemo(() => {
    if (totalItems === 0) {
      return { virtualItems: [], startIndex: 0, endIndex: 0 }
    }

    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
    const end = Math.min(
      totalItems - 1,
      Math.ceil((scrollTop + measuredHeight) / rowHeight) + overscan
    )

    const items: VirtualItem[] = []
    for (let i = start; i <= end; i++) {
      items.push({
        index: i,
        offsetTop: i * rowHeight,
      })
    }

    return {
      virtualItems: items,
      startIndex: start,
      endIndex: end,
    }
  }, [totalItems, rowHeight, overscan, scrollTop, measuredHeight])

  const scrollToItem = useCallback(
    (index: number, align: 'start' | 'center' = 'center') => {
      const el = containerRef.current
      if (!el) return

      let target = index * rowHeight
      if (align === 'center') {
        target = Math.max(0, target - measuredHeight / 2 + rowHeight / 2)
      }

      el.scrollTop = target
    },
    [rowHeight, measuredHeight]
  )

  return {
    containerRef,
    handleScroll,
    virtualItems,
    totalHeight,
    startIndex,
    endIndex,
    scrollToItem,
  }
}
