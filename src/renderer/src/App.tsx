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

  function handleDrop(event) {
    console.log('active drop')
    event.stopPropagation()
    event.preventDefault()
    const files = event.dataTransfer.files
    const fileList :any[] = []
    for (let index = 0; index < files.length; index++) {
    
      
      fileList.push({
          path: window.electron.webUtils.getPathForFile(files[index]),
          name: files[index].name,
          type: files[index].type,
          size: files[index].size
        })
    }
    if(fileList.length > 0) {
      console.log(fileList[0]);
      
    }
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
      <input type="file" name="sss" id="sss" onDrop={handleDrop} multiple/>
      <div style={{ height: 300, width: 300, backgroundColor: '#ccc' }} onDrop={handleDrop}>
        ???
      </div>
    </>
  )
}

export default App
