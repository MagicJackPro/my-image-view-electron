import { useState } from 'react'
function App(): React.JSX.Element {
  const [isDarkMode, setDarkMode] = useState(false)
  const [isSystemMode, setSystemMode] = useState(false)

  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  async function handelToggle() {
    const isDarkMode = await window.electron.ipcRenderer.invoke('dark-mode:toggle')
    setDarkMode(isDarkMode)
    setSystemMode(false)
  }

  async function handelSystem() {
    await window.electron.ipcRenderer.invoke('dark-mode:system')
    setSystemMode(true)
  }

  async function showNotification() {
    await window.electron.ipcRenderer.invoke('notification:test')
  }

  const text = isSystemMode ? 'System' : isDarkMode ? 'Dark' : 'light'

  return (
    <>
      <div className="titlebar">Cool titlebar</div>
      <h1>Hello World!</h1>
      <p>
        Current theme source: <strong id="theme-source">{text}</strong>
      </p>

      <button id="toggle-dark-mode" onClick={handelToggle}>
        Toggle Dark Mode
      </button>
      <button id="reset-to-system" onClick={handelSystem}>
        Reset to System Theme
      </button>
      <button onClick={showNotification}>showNotification</button>
    </>
  )
}

export default App
