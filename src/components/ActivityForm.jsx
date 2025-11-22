import React, { useLayoutEffect, useRef } from 'react'
import CustomSelect from './CustomSelect'
import DatePicker from './DatePicker'

export default function ActivityForm({ prefix = '', form = {}, onChangeForm = () => {}, schema = null, optionSelect = null }) {
  const f = form || { caller: '', effDate: '', policy: '', notes: '' }
  const formRef = useRef(null)

  // measure label widths and set a CSS variable on the closest note-card so header selects can align
  useLayoutEffect(() => {
    if (!formRef?.current) return
    const formEl = formRef.current
    const card = formEl.closest && formEl.closest('.note-card')
    if (!card) return

    const measure = () => {
      const labels = formEl.querySelectorAll('.form-label')
      let max = 0
      labels.forEach((l) => {
        const r = l.getBoundingClientRect()
        if (r.width > max) max = r.width
      })
      // add a small gap to account for column-gap
      const width = Math.ceil(max + 12)
      card.style.setProperty('--form-label-width', `${width}px`)
    }

    measure()
    let ro
    if (window.ResizeObserver) {
      ro = new ResizeObserver(measure)
      ro.observe(formEl)
      const labels = formEl.querySelectorAll('.form-label')
      labels.forEach((l) => ro.observe(l))
    }
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('resize', measure)
      if (ro) ro.disconnect()
    }
  }, [formRef.current])

  const handleChange = (field) => (e) => onChangeForm(field, e.target.value)

  // Render a field based on a schema entry
  const renderField = (fieldDef) => {
    const name = fieldDef.name
    const label = fieldDef.label || name
    const type = fieldDef.type || 'text'

    if (type === 'select') {
      // options: [{key,label}]
      const opts = (fieldDef.options || []).map((o) => {
        if (typeof o === 'string') return { key: o, label: o }
        return { key: o.key ?? o.value ?? o.label, label: o.label ?? o.value ?? String(o) }
      })
      return (
        <div className="form-row" key={name}>
          <label className="form-label">{label}:</label>
          <div data-field={name}>
            <CustomSelect
              options={opts}
              value={f[name] || ''}
              onChange={(v) => onChangeForm(name, v)}
            />
          </div>

          {/* Special case: if this field is the household question, show an extra dependent select when Yes */}
          {name === 'stillInHH' && (f[name] === 'Yes' || f[name] === 'yes') && (
            <>
              <label className="form-label">If yes:</label>
              <CustomSelect
                options={[{ key: 'Restricted', label: 'Restricted' }, { key: 'Own vehicle insured', label: 'Own vehicle insured' }]}
                value={f['ifYes'] || ''}
                onChange={(v) => onChangeForm('ifYes', v)}
              />
            </>
          )}
          {/* Special case: if this field is Alarm System, show Certificate select when Yes */}
          {name === 'Alarm System' && (f[name] === 'Yes' || f[name] === 'yes') && (
            <>
              <label className="form-label">Certificate</label>
              <CustomSelect
                options={[{ key: 'Yes', label: 'Yes' }, { key: 'No', label: 'No' }]}
                value={f['Certificate'] || ''}
                onChange={(v) => onChangeForm('Certificate', v)}
              />
            </>
          )}
          {/* Special case: if New plan is Monthly, show VOID & MAC select */}
          {name === 'New plan' && (f[name] === 'Monthly' || f[name] === 'monthly') && (
            <>
              <label className="form-label">VOID &amp; MAC</label>
              <CustomSelect
                options={[{ key: 'Yes', label: 'Yes' }, { key: 'No', label: 'No' }]}
                value={f['VOID & MAC'] || ''}
                onChange={(v) => onChangeForm('VOID & MAC', v)}
              />
            </>
          )}
        </div>
      )
    }

    if (type === 'textarea') {
      return (
        <div className="form-row" key={name}>
          <label className="form-label">{label}:</label>
          <textarea name={name} data-field={name} className="form-textarea" value={f[name] || ''} onChange={handleChange(name)} placeholder={fieldDef.placeholder || ''} />
        </div>
      )
    }

    // date: use custom date picker
    if (type === 'date') {
      return (
        <div className="form-row" key={name}>
          <label className="form-label">{label}:</label>
          <div data-field={name}>
            <DatePicker
              value={f[name] || ''}
              onChange={(v) => onChangeForm(name, v)}
              placeholder={fieldDef.placeholder || 'YYYY-MM-DD'}
              className="form-input"
            />
          </div>
        </div>
      )
    }

    // default to input
    return (
      <div className="form-row" key={name}>
        <label className="form-label">{label}:</label>
        <input name={name} data-field={name} className="form-input" type={type} value={f[name] || ''} onChange={handleChange(name)} placeholder={fieldDef.placeholder || ''} />
      </div>
    )
  }

  // If a schema is provided, render dynamic fields; otherwise render the default set
  const fieldsToRender = schema && Array.isArray(schema) ? schema : [
    { name: 'caller', label: 'Caller', type: 'text', placeholder: 'Caller name' },
    { name: 'effDate', label: 'Eff Date', type: 'date', placeholder: 'YYYY-MM-DD' },
    { name: 'policy', label: 'Policy #', type: 'text', placeholder: 'Policy number' },
    { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Details...' },
  ]

  return (
    <form id={`activity-form-${prefix}`} className="activity-form" ref={formRef} onSubmit={(e) => e.preventDefault()}>
      {optionSelect && (
        <div className="form-row option-row">
          {/* render an intentionally blank label so the select lines up but shows no text */}
          <label className="form-label" aria-hidden="true">&nbsp;</label>
          <div data-field="optionSelect">
            <CustomSelect
              options={(optionSelect.options || []).map((o) => (typeof o === 'string' ? { key: o, label: o } : { key: o.key, label: o.label }))}
              value={optionSelect.value}
              onChange={optionSelect.onChange}
            />
          </div>
        </div>
      )}

      {fieldsToRender.map((fd) => renderField(fd))}
    </form>
  )
}
