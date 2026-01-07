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
    // width: 1000,
    // height: 800,
    // x: screen.width / 2 - 500,
    // y: screen.height / 2 - 400,
    // frame: true,
    backgroundColor: '#00000000',
    resizeable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    minimizable: false,
    maximizable: false,
    movable: false,
    autoHideMenuBar: true,
    enableLargerThanScreen: true,
    transparent: true,
    // backgroundColor: '#FFFAF0',
    webPreferences: {
      // preload: 'sub_preload.js'
    }
  }
  // return utools.createBrowserWindow(src, {...defaultOption, ...options});
  let win = utools.createBrowserWindow(src, {...defaultOption, ...options});
  // win.webContents.openDevTools('right')
  return win;
}

module.exports = {
  createCustomWindow
}
