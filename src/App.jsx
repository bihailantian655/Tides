import React, { useState, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'

const PANELS = [
  { id: 0, label: 'P1', placeholder: 'm.taobao.com' },
  { id: 1, label: 'P2', placeholder: 'm.jd.com' },
  { id: 2, label: 'P3', placeholder: 'm.weibo.cn' },
  { id: 3, label: 'P4', placeholder: 'm.baidu.com' }
]

function sanitizeUrl(input) {
  input = input.trim()
  if (/^https?:\/\//i.test(input)) return input
  if (/^[\w-]+(\.[\w-]+)+/.test(input)) return 'https://' + input
  return 'https://www.google.com/search?q=' + encodeURIComponent(input)
}

export default function App() {
  const [urls, setUrls] = useState(['', '', '', ''])
  const [status, setStatus] = useState('4 panels ready')

  const navigate = useCallback(async (id, rawUrl) => {
    if (!rawUrl.trim()) return
    const url = sanitizeUrl(rawUrl)
    try {
      await invoke('navigate_panel', { panelId: id, url })
      setStatus(`Panel ${id + 1}: navigating...`)
    } catch (e) {
      setStatus(`Error: ${e}`)
    }
  }, [])

  const handleKeyDown = useCallback((id, e) => {
    if (e.key === 'Enter') {
      navigate(id, urls[id])
    }
  }, [urls, navigate])

  const updateUrl = useCallback((id, value) => {
    setUrls(prev => {
      const next = [...prev]
      next[id] = value
      return next
    })
  }, [])

  return (
    <div className="app">
      <header>
        <h1>MobileBrowser</h1>
        <span className="tag">4-Panel | Mobile UA | Independent Cookies</span>
      </header>

      <div className="panels">
        {PANELS.map(panel => (
          <div className="panel-row" key={panel.id}>
            <span className="idx">{panel.label}</span>
            <input
              type="text"
              className="url"
              placeholder={panel.placeholder}
              value={urls[panel.id]}
              onChange={e => updateUrl(panel.id, e.target.value)}
              onKeyDown={e => handleKeyDown(panel.id, e)}
            />
            <button
              className="btn go"
              onClick={() => navigate(panel.id, urls[panel.id])}
            >
              Go
            </button>
            <button
              className="btn nav"
              title="Back"
              onClick={() => invoke('go_back', { panelId: panel.id })}
            >
              ◀
            </button>
            <button
              className="btn nav"
              title="Forward"
              onClick={() => invoke('go_forward', { panelId: panel.id })}
            >
              ▶
            </button>
            <button
              className="btn nav"
              title="Reload"
              onClick={() => invoke('reload_page', { panelId: panel.id })}
            >
              ↻
            </button>
            <button
              className="btn scroll"
              title="Scroll Up"
              onClick={() => invoke('scroll_up', { panelId: panel.id })}
            >
              ↑
            </button>
            <button
              className="btn scroll"
              title="Scroll Down"
              onClick={() => invoke('scroll_down', { panelId: panel.id })}
            >
              ↓
            </button>
          </div>
        ))}
      </div>

      <footer>
        <span>{status}</span>
        <span className="ua-info">UA: iPhone iOS 17.5 Safari</span>
      </footer>
    </div>
  )
}