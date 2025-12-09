const fs = require('node:fs')
const path = require('node:path')
const { spawn } = require('node:child_process')
const schedule = require('node-schedule')

// 通过 window 对象向渲染进程注入 nodejs 能力
window.services = {
  // 创建计划任务
  createScheduleTask(cron, scriptName) {
    const script = window.utools.dbStorage.getItem(scriptName);
    const job = schedule.scheduleJob(cron, () => {
      if (script.type === 'python')  {
        this.runPythonScript(script.path);
      }
    })
    console.log('注册任务成功')
  },
  // 读文件
  readFile (file) {
    return fs.readFileSync(file, { encoding: 'utf-8' })
  },
  // 文本写入到下载目录
  writeTextFile (text) {
    const filePath = path.join(window.utools.getPath('downloads'), Date.now().toString() + '.txt')
    fs.writeFileSync(filePath, text, { encoding: 'utf-8' })
    return filePath
  },
  // 图片写入到下载目录
  writeImageFile (base64Url) {
    const matchs = /^data:image\/([a-z]{1,20});base64,/i.exec(base64Url)
    if (!matchs) return 
    const filePath = path.join(window.utools.getPath('downloads'), Date.now().toString() + '.' + matchs[1])
    fs.writeFileSync(filePath, base64Url.substring(matchs[0].length), { encoding: 'base64' })
    return filePath
  },
  // 运行python脚本
  runPythonScript(scriptPath) {
    // 3. 使用 'cmd.exe' 或 'powershell.exe' 来执行组合命令
    const pythonProcess = spawn('python.exe', [scriptPath], { 

    });
    let dataOutput = '';
    let errorOutput = '';
    pythonProcess.stdout.on('data', (data) => {
      dataOutput += data.toString();
      console.log(data.toString())
    })
    // 3. 监听标准错误流 (stderr)
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.log(data.toString())
    });
    // 4. 监听进程退出
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python 脚本执行失败，退出码: ${code}`);
        console.error(`错误输出:\n${errorOutput}`);
        return;
      }
      console.log('--- Python 脚本执行成功 ---');
      console.log('结果:', dataOutput.trim());
    });
    // 5. 监听进程错误 (例如：找不到 python 命令)
    pythonProcess.on('error', (err) => {
      console.error('执行 Python 进程时发生错误:', err);
    });
  }
}
