const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const schedule = require('node-schedule');
const moment = require('moment');
const iconv = require('iconv-lite');
const KEY_TASK_LIST = 'taskList'
const KEY_SCRIPT_LIST = 'scriptList'
const KEY_LOG_DATES = 'logDates';
const SUCCESS_NUM = 'successNum';
const FAIL_NUM = 'failNum';
const SCRIPT_TASK = '脚本任务';
const KEY_REAL_TIME_LOG = 'realTimeLog';
const { getItem, setItem, removeItem } = window.utools.dbStorage;
const { showNotification } = window.utools;
const { createCustomWindow } = require('./utils/customWindow');

const windowList = [];
// 通过 window 对象向渲染进程注入 nodejs 能力
window.services = {
  // 创建计划任务
  createScheduleJob(taskInfo) {
    const { executeSchedule, taskName } = taskInfo
    if (taskInfo.status !== 0) {
      console.log('非就绪状态无法注册任务', taskName);
      return;
    }
    if (typeof(executeSchedule) === 'string' && executeSchedule.includes('T') && executeSchedule.includes('Z')) {
      const currentTime = new Date();
      const targetTime = new Date(executeSchedule);
      if (currentTime.getTime() > targetTime.getTime()) {
        console.log(`单次任务[${taskName}]执行时间已过，不再重新注册，请检查任务是否成功执行`)
        taskInfo.status = 2;
        this.updateTask(taskInfo);
        return;
      }
    }
    schedule.scheduleJob(taskName, executeSchedule, () => this.executeTask(taskName));
    console.log(`注册任务【${taskName}】成功！`)
  },

  executeTask(taskName) {
    const taskInfo = this.queryTaskInfo(taskName);
    if (taskInfo.taskType === SCRIPT_TASK) {
      this.executeScriptTask(taskInfo);
    } else {
      this.executeRemindTask(taskInfo)
    }
  },

  // 执行提醒任务
  executeRemindTask(taskInfo) {
    const job = this.queryScheduleJob(taskInfo.taskName);
    (job && job.nextInvocation()) ? taskInfo.status = 0 : taskInfo.status = 2;
    taskInfo.lastExecuteTime =  moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    taskInfo.successNum += 1;
    this.updateTask(taskInfo);
    this.totalSuccessPlus();
    if (windowList.length >= 10) {
      let dropWindow = windowList.shift();
      dropWindow.close();
    }
    const win = createCustomWindow(`simple-gradient-reminder.html?taskName=${taskInfo.taskName}`);
    windowList.push(win);
  },

  // 执行脚本任务
  executeScriptTask(taskInfo) {
    const {taskName, scriptName} = taskInfo;
    showNotification(`开始执行任务:${taskName}`, '日志管理');
    if (taskInfo.status === 1) {
      console.log('任务正在执行，跳过此次执行');
      return;
    }
    taskInfo.status = 1;
    this.updateTask(taskInfo);
    const scriptInfo = this.queryScriptInfo(scriptName);
    const {key, type, path} = scriptInfo;
    const executor = getExecutor(type);
    const process = spawn(executor, [path]);
    // 监听标准输出流
    process.stdout.on('data', (data) => {
      const logStr = iconv.decode(data, 'utf-8');
      this.appendLog(taskName, logStr);
    })
    // 监听标准错误流 (stderr)
    process.stderr.on('data', (data) => {
      const logStr = iconv.decode(data, 'utf-8');
      this.appendLog(taskName, logStr);
    });
    // 监听进程退出
    process.on('close', (code) => {
      let taskInfo = this.queryTaskInfo(taskName);
      const now = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      taskInfo.lastExecuteTime = now;
      if (code !== 0) {
        console.error(`脚本${scriptInfo.key}执行失败，退出码: ${code}`);
        taskInfo.failNum += 1;
        taskInfo.lastFailTime = now;
        this.totalFailPlus();
      } else {
        this.totalSuccessPlus();
        taskInfo.successNum += 1;
        console.log(`--- 脚本[${key} ${type}]执行成功 ---`);
      }
      const job = this.queryScheduleJob(taskName);
      if (job === undefined) {
        taskInfo.status = 2;
      } else {
        taskInfo.status = 0;
      }
      this.updateTask(taskInfo);
      showNotification(`任务执行完成:${taskName}`, '日志管理');
    });
    // 监听进程错误 (例如：找不到 python 命令)
    process.on('error', (err) => {
      this.appendLog(taskName, err.toString());
    });
  },

  // 单独执行脚本
  executeScript(scriptInfo) {
    const {key, type, path} = scriptInfo;
    this.updateRealTimeLog('system', `开始执行脚本[${key}]\n`);
    const executor = getExecutor(type);
    const process = spawn(executor, [path]);
    // 监听标准输出流
    process.stdout.on('data', (data) => {
      const logStr = iconv.decode(data, 'utf-8');
      this.updateRealTimeLog(key, logStr);
    })
    // 监听标准错误流 (stderr)
    process.stderr.on('data', (data) => {
      const logStr = iconv.decode(data, 'utf-8');
      this.updateRealTimeLog(key, logStr);
    });
    // 监听进程错误 (例如：找不到 python 命令)
    process.on('error', (err) => {
      this.updateRealTimeLog(key, err.toString());
    });
    // 监听进程退出
    process.on('close', (code) => {
      if (code !== 0) {
        this.updateRealTimeLog('system', `脚本[${key}]执行失败\n`);
      } else {
        this.updateRealTimeLog('system', `脚本[${key}]执行成功\n`);
      }
    });
  },

  // 插件退出后重新注册所有任务
  resignTask() {
    let savedTask = this.queryTaskList();
    console.log('注册过的任务',savedTask);
    if (!savedTask || savedTask.length === 0) {
      console.log('当前无任务')
      return;
    }
    const scheduleJobs = this.queryScheduleJobs();
    savedTask.forEach(taskName => {
      let taskInfo = this.queryTaskInfo(taskName)
      if(scheduleJobs.hasOwnProperty(taskInfo.taskName)) {
        console.log('此任务已注册');
      } else {
        this.createScheduleJob(taskInfo);
      }
    })
  },

  clearRealTimeLog() {
    setItem(KEY_REAL_TIME_LOG, '');
  },

  queryRealTimeLog() {
    let realTileLog = getItem(KEY_REAL_TIME_LOG);
    return realTileLog ? realTileLog : '';
  },

  // 查询日志列表
  queryLogDateList() {
    let dates = getItem(KEY_LOG_DATES);
    return dates ? dates : [];
  },

  queryTargetDateTaskList(date) {
    const logs = getItem('logs-date-' + date);
    return logs ? logs : [];
  },

  queryTargetTaskDateList(taskName) {
    const logs = getItem('logs-task-' + taskName);
    return logs ? logs : [];
  },

  queryTargetTaskAndDateLog(taskName, date) {
    const log = getItem('log-' + taskName + '-' + date);
    return log ? log : '';
  },

  appendLog(taskName, content) {
    const date = moment(new Date()).format('YYYYMMDD');
    const dateTime = moment(new Date()).format('YYYYMMDD HH:mm:ss');
    const logDates = this.queryLogDateList();
    if (!logDates.includes(date)) {
      logDates.push(date);
      setItem(KEY_LOG_DATES, logDates);
    }
    const targetDateLogs = this.queryTargetDateTaskList(date);
    if (!targetDateLogs.includes(taskName)) {
      targetDateLogs.push(taskName);
      setItem('logs-date-' + date, targetDateLogs)
    }
    const targetTaskLogs = this.queryTargetTaskDateList(taskName);
    if (!targetTaskLogs.includes(date)) {
      targetTaskLogs.push(date);
      setItem('logs-task-' + taskName, targetTaskLogs)
    }
    let currentLog = this.queryTargetTaskAndDateLog(taskName, date);
    currentLog += content;
    setItem('log-' + taskName + '-' + date, currentLog);
    this.updateRealTimeLog(taskName, content);
  },

  updateRealTimeLog(title, content) {
    let realTimeLog = this.queryRealTimeLog();
    realTimeLog += '[' + title + ']:' + content;
    setItem(KEY_REAL_TIME_LOG, realTimeLog);
    window.customEvents.fireEvent('realTimeLogUpdate', realTimeLog);
  },

  // 查询所有任务
  queryScheduleJobs() {
    return schedule.scheduledJobs
  },

  // 根据任务名删除任务
  delelteScheduleJob(name) {
    let job = this.queryScheduleJob(name);
    if (job !== undefined) {
      job.cancel()
    }
  },

  // 根据任务名查询任务
  queryScheduleJob(name) {
    return schedule.scheduledJobs[name];
  },

  // 读文件
  readFile(file) {
    return fs.readFileSync(file, { encoding: 'utf-8' })
  },
  // 写文件
  writeFile(filePath, content) {
    return fs.writeFileSync(filePath, content, {
      encoding: 'utf-8',
      flag: 'w',
    });
  },
  // 更新任务
  updateTask(taskInfo) {
    setItem('task-' + taskInfo.taskName, taskInfo);
  },

  // 更新脚本
  updateScript(scriptInfo) {
    setItem('script-' + scriptInfo.key, scriptInfo);
  },

  // 查询脚本信息
  queryScriptInfo(scriptName) {
    return getItem('script-' + scriptName);
  },

  totalSuccessPlus() {
    let successNum = this.getTotalSuccessNum();
    successNum += 1;
    setItem(SUCCESS_NUM, successNum);
    window.customEvents.fireEvent('totalSuccessUpdate', successNum);
  },

  totalFailPlus() {
    let failNum = this.getTotalFailNum();
    failNum += 1;
    setItem(FAIL_NUM, failNum);
    window.customEvents.fireEvent('totalFailUpdate', failNum);
  },

    // 获取总成功调用次数
  getTotalSuccessNum() {
    let successNum = getItem(SUCCESS_NUM);
    return successNum ? successNum : 0;
  },

  getTotalFailNum() {
    let failNum = getItem(FAIL_NUM);
    return failNum ? failNum : 0;
  },

  // 保存脚本
  saveScript(scriptName, scriptInfo) {
    setItem('script-' + scriptName, scriptInfo);
    let scriptList = this.queryScriptList();
    scriptList.push(scriptName)
    this.saveScriptList(scriptList);
  },

  // 查询脚本列表
  queryScriptList() {
    const scriptList = getItem(KEY_SCRIPT_LIST);
    return scriptList ? scriptList : [];
  },

  // 删除脚本
  removeScript(scriptName) {
    let scriptList = this.queryScriptList();
    scriptList = scriptList.filter((name) => name !== scriptName);
    this.saveScriptList(scriptList);
    removeItem('script-' + scriptName);
  },

  // 保存脚本列表
  saveScriptList(scriptList) {
    setItem(KEY_SCRIPT_LIST, scriptList);
  },

  // 查询任务信息
  queryTaskInfo(taskName) {
    return getItem('task-' + taskName);
  },

  // 查询任务列表
  queryTaskList() {
    const taskList = getItem(KEY_TASK_LIST);
    return taskList ? taskList : [];
  },

  // 保存任务
  saveTask(taskInfo) {
    setItem('task-' + taskInfo.taskName, taskInfo);
    let taskList = this.queryTaskList();
    taskList.push(taskInfo.taskName)
    this.saveTaskList(taskList);
    this.createScheduleJob(taskInfo);
  },

  // 删除任务
  removeTask(taskName) {
    this.delelteScheduleJob(taskName);
    let taskList = this.queryTaskList();
    taskList = taskList.filter((name) => name !== taskName );
    this.saveTaskList(taskList);
    removeItem('task-' + taskName);
    // 删除相关日志
    const dateList = this.queryTargetTaskDateList(taskName);
    dateList.forEach((date) => {
      let taskList = this.queryTargetDateTaskList(date);
      taskList = taskList.filter((task) => task !== taskName);
      setItem('logs-date-' + date, taskList);
      removeItem('log-' + taskName + '-' + date);
    });
    removeItem('logs-task' + taskName);
  },

  saveTaskList(taskList) {
    setItem(KEY_TASK_LIST, taskList);
  },

}


function getExecutor(scriptType) {
  if (scriptType === 'python') {
    return 'python';
  }
  if (scriptType === 'javascript') {
    return 'node';
  }
  if (scriptType === 'shell') {
    return 'C:\\ProGram Files\\Git\\usr\\bin\\bash.exe';
  }
}


