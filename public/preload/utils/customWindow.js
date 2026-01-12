function createCustomWindow(src, options={}) {
  const cursorPoint = utools.getCursorScreenPoint()
  const currentDisplay = utools.getDisplayNearestPoint(cursorPoint)
  // const displayBounds = currentDisplay.bounds
  // const fullscreenable = window.utools.isWindows()
  let defaultOption = {
    show: true,
    width: 360,
    height: 300,
    x: screen.width / 2 - 180,
    y: screen.height / 2 - 150,
    frame: false,
    backgroundColor: '#00000000',
    resizeable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    minimizable: false,
    maximizable: false,
    autoHideMenuBar: true,
    enableLargerThanScreen: true,
    transparent: true,
  }
  // return utools.createBrowserWindow(src, {...defaultOption, ...options});
  let win = utools.createBrowserWindow(src, {...defaultOption, ...options});
  // win.webContents.openDevTools('right')
  return win;
}

module.exports = {
  createCustomWindow
}
