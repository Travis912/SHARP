import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

function formatISO(d) {
  if (!d) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function parseISO(s) {
  if (!s) return null
  const parts = s.split('-')
  if (parts.length !== 3) return null
  const [y, m, d] = parts.map((p) => parseInt(p, 10))
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null
  return new Date(y, m - 1, d)
}

export default function DatePicker({ value = '', onChange = () => {}, placeholder = 'YYYY-MM-DD', className = '' }) {
  const initial = parseISO(value)
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(initial || new Date())
  const [selected, setSelected] = useState(initial)
  const wrapRef = useRef(null)
  const buttonRef = useRef(null)
  const [measuredWidth, setMeasuredWidth] = useState(null)

  useEffect(() => {
    setSelected(parseISO(value))
  }, [value])

  // measure nearest input/container width and keep in sync
  useEffect(() => {
    if (!wrapRef.current) return
    const container = wrapRef.current.closest('.form-row') || wrapRef.current.parentElement || wrapRef.current

    const measure = () => {
      try {
        // prefer a sibling .form-input width if present
        const inputEl = container.querySelector && (container.querySelector('.form-input') || container.querySelector('.date-picker-button'))
        const el = inputEl || container
        const w = Math.round(el.getBoundingClientRect().width)
        if (w && w > 40) setMeasuredWidth(w)
      } catch (e) {
        // ignore
      }
    }

    measure()

    let ro
    if (window.ResizeObserver) {
      ro = new ResizeObserver(measure)
      ro.observe(container)
      if (container.querySelector) {
        const inp = container.querySelector('.form-input')
        if (inp) ro.observe(inp)
      }
    }
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('resize', measure)
      if (ro) ro.disconnect()
    }
  }, [wrapRef.current])

  useEffect(() => {
    if (!open) return
    const onDocClick = (e) => {
      if (!wrapRef.current) return
      const target = e.target
      // if click happened inside the original wrapper, keep open
      if (wrapRef.current.contains(target)) return
      // if popover was rendered into a portal, clicks inside it should not close the picker
      if (target && target.closest && target.closest('.date-picker-popover')) return
      setOpen(false)
    }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('touchstart', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('touchstart', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1)
  const prevMonth = () => setVisible(new Date(visible.getFullYear(), visible.getMonth() - 1, 1))
  const nextMonth = () => setVisible(new Date(visible.getFullYear(), visible.getMonth() + 1, 1))

  const weeks = []
  const first = startOfMonth(visible)
  const startDay = (first.getDay() + 6) % 7 // make Monday=0 if you prefer; here Sunday=6 -> shift so Monday-first
  // We'll display a 7x6 grid
  const gridStart = new Date(first)
  gridStart.setDate(first.getDate() - startDay)

  for (let week = 0; week < 6; week++) {
    const days = []
    for (let day = 0; day < 7; day++) {
      const d = new Date(gridStart)
      d.setDate(gridStart.getDate() + week * 7 + day)
      days.push(d)
    }
    weeks.push(days)
  }

  const onSelect = (d) => {
    setSelected(d)
    onChange(formatISO(d))
    setOpen(false)
  }

  const displayLabel = selected ? selected.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''

  const popStyle = {}
  if (measuredWidth && wrapRef.current) {
    try {
      const rect = wrapRef.current.getBoundingClientRect()
      const rightSpace = Math.max(0, Math.floor(window.innerWidth - rect.right - 20))
      const leftSpace = Math.max(0, Math.floor(rect.left - 20))
      const available = Math.max(rightSpace, leftSpace)
      // prefer a reasonably wide popover (at least 320px) but never exceed available viewport space
      const desired = Math.max(320, measuredWidth)
      const widthPx = Math.max(200, Math.min(desired, available || Math.min(window.innerWidth - 40, desired)))
      popStyle.width = `${widthPx}px`
      // position popover on the side with more room (prefer right)
      if (rightSpace >= widthPx) {
        popStyle.right = 0
      } else if (leftSpace >= widthPx) {
        popStyle.left = 0
      } else {
        // fallback: anchor to right but allow it to shrink to viewport
        popStyle.right = 0
      }
    } catch (e) {
      // ignore measurement errors
    }
  }
  // make the visible button fill its grid cell so it matches other inputs
  const btnStyle = { width: '100%' }

  // coordinates for portal rendering
  const [popCoords, setPopCoords] = useState(null)

  // compute fixed coordinates for the popover when open so portal avoids clipping
  useEffect(() => {
    if (!open || !wrapRef.current) {
      setPopCoords(null)
      return
    }

    const compute = () => {
      try {
        const rect = wrapRef.current.getBoundingClientRect()
        const rightSpace = Math.max(0, Math.floor(window.innerWidth - rect.right - 20))
        const leftSpace = Math.max(0, Math.floor(rect.left - 20))
        const available = Math.max(rightSpace, leftSpace)
        const desired = Math.max(320, measuredWidth || Math.round(rect.width))
        const widthPx = Math.max(200, Math.min(desired, available || Math.min(window.innerWidth - 40, desired)))

        let left
        if (rightSpace >= widthPx) {
          left = rect.right - widthPx
        } else if (leftSpace >= widthPx) {
          left = rect.left
        } else {
          left = Math.max(12, Math.min(rect.left, window.innerWidth - widthPx - 12))
        }

        // vertical placement: prefer below, but if not enough space place above
        const maxHeight = Math.max(360, Math.min(window.innerHeight - 40, 900))
        let top = rect.bottom + 8
        const spaceBelow = window.innerHeight - rect.bottom - 8
        if (spaceBelow < 320 && rect.top > spaceBelow) {
          // place above if there's more room
          top = Math.max(8, rect.top - 8 - maxHeight)
        }

        setPopCoords({ left: Math.round(left), top: Math.round(top), width: Math.round(widthPx), maxHeight })
      } catch (e) {
        // ignore
      }
    }

    compute()
    let ro
    if (window.ResizeObserver) {
      ro = new ResizeObserver(compute)
      ro.observe(wrapRef.current)
    }
    window.addEventListener('resize', compute)
    window.addEventListener('scroll', compute, true)
    return () => {
      if (ro) ro.disconnect()
      window.removeEventListener('resize', compute)
      window.removeEventListener('scroll', compute, true)
    }
  }, [open, measuredWidth, wrapRef.current])

  // popover content (used either in-Place or via portal)
  const popoverContent = (
    <div
      className="date-picker-popover"
      role="dialog"
      aria-label="Select date"
      style={{
        position: popCoords ? 'fixed' : 'absolute',
        zIndex: 1400,
        left: popCoords ? `${popCoords.left}px` : undefined,
        top: popCoords ? `${popCoords.top}px` : 'calc(100% + 8px)',
        width: popCoords ? `${popCoords.width}px` : undefined,
        maxHeight: popCoords ? popCoords.maxHeight : Math.max(360, Math.min(window.innerHeight - 40, 900)),
        overflow: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <div className="date-picker-header">
        <button className="date-picker-nav" type="button" onClick={prevMonth} aria-label="Previous month">◀</button>
        <div className="date-picker-month">{visible.toLocaleString(undefined, { month: 'short', year: 'numeric' })}</div>
        <button className="date-picker-nav" type="button" onClick={nextMonth} aria-label="Next month">▶</button>
      </div>
      <table className="date-picker-calendar" role="grid">
        <thead>
          <tr>
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => <th key={d}>{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((d) => {
                const inMonth = d.getMonth() === visible.getMonth()
                const isSelected = selected && selected.toDateString() === d.toDateString()
                return (
                  <td key={d.toISOString()}>
                    <button type="button" className={`date-picker-day ${inMonth ? '' : 'muted'} ${isSelected ? 'selected' : ''}`} onClick={() => onSelect(d)}>
                      {d.getDate()}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className={`date-picker-wrapper ${className}`} ref={wrapRef} style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      <button ref={buttonRef} type="button" className={`date-picker-button`} style={btnStyle} onClick={() => setOpen((v) => !v)} aria-haspopup="dialog" aria-expanded={open}>
        <span className="date-picker-value">{displayLabel || placeholder}</span>
        <svg className="date-picker-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 11H12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 15H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 8H21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6"/></svg>
      </button>
      {open && (popCoords ? createPortal(popoverContent, document.body) : popoverContent)}
    </div>
  )
}
