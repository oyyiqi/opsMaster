const fs = require('node:fs')
const path = require('node:path')
const { spawn } = require('node:child_process')
const schedule = require('node-schedule')
const moment = require('moment')

const SAVED_TASK_KEY = 'taskList'
const SAVED_SCRIPTS_KEY = 'scriptList'



// 通过 window 对象向渲染进程注入 nodejs 能力
window.services = {
  // 创建计划任务
  createScheduleTask(options = {}) {
    const { executeSchedule, scriptName, taskName } = options
    if (executeSchedule instanceof String && executeSchedule.includes('T') && executeSchedule.includes('Z')) {
      const currentTime = new Date();
      const targetTime = new Date(executeSchedule);
      if (currentTime.getTime() > targetTime.getTime()) {
        console.log('单次任务执行时间已过，跳过重新注册，请检查任务是否成功执行')
      }
    }
    const scriptInfo = queryScriptInfo(scriptName);
    schedule.scheduleJob(taskName, executeSchedule, () => {
      this.runScript(taskName, scriptInfo);
    });
    console.log(`注册任务【${taskName}】成功！`)
  },

  reSignUpTask() {
    let savedTask = queryTaskList();
    if (!savedTask || savedTask.length === 0) {
      console.log('当前无任务')
      return;
    }
    console.log('注册过的任务：',savedTask);
    const scheduleJobs = this.queryScheduleJobs();
    savedTask.forEach(taskName => {
      let taskInfo = queryTaskInfo(taskName)
      console.log('当前任务:', taskName);
      if(scheduleJobs.hasOwnProperty(taskInfo.taskName)) {
        console.log('此任务已注册');
      } else {
        console.log('此任务需要重新注册')
        this.createScheduleTask(taskInfo);
      }
    })
  },

  queryScheduleJobs() {
    return schedule.scheduledJobs
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

  runScript(taskName, scriptInfo) {
    const {key, type, path} = scriptInfo;
    const executor = getExecutor(type);
    const process = spawn(executor, [path]);
    // 监听标准输出流
    process.stdout.on('data', (data) => {
      console.log(data.toString())
    })
    // 监听标准错误流 (stderr)
    process.stderr.on('data', (data) => {
      console.log(data.toString())
    });
    // 监听进程退出
    process.on('close', (code) => {
      if (code !== 0) {
        console.error(`脚本${scriptInfo.key}执行失败，退出码: ${code}`);
        addFailNum(taskName);
        return;
      }
      addSuccessNum(taskName);
      console.log(`--- 脚本[${key} ${type}]执行成功 ---`);
    });
    // 监听进程错误 (例如：找不到 python 命令)
    process.on('error', (err) => {
      console.error('执行进程时发生错误:', err);
    });
  }

}

function getExecutor(scriptType) {
  if (scriptType === 'python') {
    return 'python';
  }
  if (scriptType === 'javascript') {
    return 'node';
  }
  if (scriptType === 'shell') {
    return 'sh';
  }
}

function addFailNum(taskName) {
  let taskInfo = queryTaskInfo(taskName);
  taskInfo.failNum += 1;
  const now = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
  taskInfo.lastFailTime = now;
  updateTask(taskName, taskInfo);
}

function addSuccessNum(taskName) {
  let taskInfo = queryTaskInfo(taskName);
  taskInfo.successNum += 1;
  updateTask(taskName, taskInfo);
}


function queryScriptInfo(scriptName) {
  return window.utools.dbStorage.getItem('script-' + scriptName);
}

function queryScriptList() {
  const scriptList = window.utools.dbStorage.getItem(SAVED_SCRIPTS_KEY);
  return scriptList ? scriptList : [];
}

function saveScript(scriptName, scriptInfo) {
  window.utools.dbStorage.setItem('script-' + scriptName, scriptInfo);
  let scriptList = queryScriptList();
  scriptList.push(scriptName)
  saveScriptList(scriptList);
}

function removeScript(scriptName) {
  let scriptList = queryScript();
  scriptList = scriptList.filter((name) => name !== scriptName);
  saveScriptList(scriptList);
  window.utools.dbStorage.removeItem('script-' + scriptName);
}

function saveScriptList(scriptList) {
  window.utools.dbStorage.setItem(SAVED_SCRIPTS_KEY, scriptList);
}

function queryTaskInfo(taskName) {
  return window.utools.dbStorage.getItem('task-' + taskName);
}

function queryTaskList() {
  const taskList = window.utools.dbStorage.getItem(SAVED_TASK_KEY);
  return taskList ? taskList : [];
}

function saveTask(taskName, taskInfo) {
  window.utools.dbStorage.setItem('task-' + taskName, taskInfo);
  let taskList = queryTaskList();
  taskList.push(taskName)
  saveTaskList(taskList);
}

function updateTask(taskName, taskInfo) {
    window.utools.dbStorage.setItem('task-' + taskName, taskInfo);
}

function removeTask(taskName) {
  let taskList = queryTaskList();
  taskList = taskList.filter((name) => name !== taskName );
  saveTaskList(taskList);
  window.utools.dbStorage.removeItem('task-' + taskName);
}

function saveTaskList(taskList) {
  window.utools.dbStorage.setItem(SAVED_TASK_KEY, taskList);
}
