const fs = require('node:fs')
const path = require('node:path')
const { spawn } = require('node:child_process')
const schedule = require('node-schedule')

const SAVED_TASK_KEY = 'savedTask'
const SAVED_SCRIPT_KEY = 'savedScripts'
const {getItem, setItem, removeItem } = window.utools.dbStorage;


// 通过 window 对象向渲染进程注入 nodejs 能力
window.services = {
  // 创建计划任务
  createScheduleTask(options = {}) {
    const { executeSchedule, scriptName, taskName } = options
    if (executeSchedule.includes('T') && executeSchedule.includes('Z')) {
      const currentTime = new Date();
      const targetTime = new Date(executeSchedule);
      if (currentTime.getTime() > targetTime.getTime()) {
        console.log('单次任务执行时间已过，跳过重新注册，请检查任务是否成功执行')
        return true;
      }
    }
    const script = getItem(scriptName);
    schedule.scheduleJob(taskName, executeSchedule, () => {
      if (script.type === 'python') {
        this.runPythonScript(script.path);
      }
    });
    console.log(`注册任务【${taskName}】成功！`)
    return true;
  },

  reSignUpTask() {
    // setItem(SAVED_TASK_KEY, ['单次任务', '周本', '测试2', '测试任务']);
    // setItem(SAVED_SCRIPT_KEY, ['hello', 'test']);
    let savedTask = getItem(SAVED_TASK_KEY);
    if (!savedTask || savedTask.length === 0) {
      console.log('当前无任务')
      return;
    }
    console.log('注册过的任务：',savedTask);
    const scheduleJobs = this.queryScheduleJobs();
    savedTask.forEach(element => {
      let taskInfo = getItem('task-' + element);
      console.log('当前任务:',taskInfo.taskName);
      if(scheduleJobs.hasOwnProperty(taskInfo.taskName)) {
        console.log('此任务已注册');
      } else {
        console.log('此任务需要重新注册')
        this.createScheduleTask(taskInfo);
      }
    })
  },

  queryScheduleJobs() {
    const scheduledJobs = schedule.scheduledJobs
    console.log(scheduledJobs)
    return scheduledJobs;
  },

  delelteScheduleJob(name) {
    let job = this.queryScheduleJob(name);
    if (job !== undefined) {
      job.cancel()
    }
  },

  queryScheduleJob(name) {
    return schedule.scheduledJobs[name];
  },

  // 读文件
  readFile(file) {
    return fs.readFileSync(file, { encoding: 'utf-8' })
  },
  // 文本写入到下载目录
  writeTextFile(text) {
    const filePath = path.join(window.utools.getPath('downloads'), Date.now().toString() + '.txt')
    fs.writeFileSync(filePath, text, { encoding: 'utf-8' })
    return filePath
  },
  // 图片写入到下载目录
  writeImageFile(base64Url) {
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
