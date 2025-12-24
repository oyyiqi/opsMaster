const fs = require('node:fs')
const path = require('node:path')
const { spawn } = require('node:child_process')
const schedule = require('node-schedule')
const moment = require('moment')

const SAVED_TASK_KEY = 'taskList'
const SAVED_SCRIPTS_KEY = 'scriptList'
const SUCCESS_NUM = 'successNum';
const FAIL_NUM = 'failNum';

const {getItem, setItem, removeItem} = window.utools.dbStorage;
const { showNotification } = window.utools;

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
    schedule.scheduleJob(taskName, executeSchedule, () => {
      this.runScript(taskName, scriptName);
    });
    console.log(`注册任务【${taskName}】成功！`)
  },

  // 插件退出后重新注册所有任务
  resignTask() {
    let savedTask = this.queryTaskList();
    console.log(savedTask);
    if (!savedTask || savedTask.length === 0) {
      console.log('当前无任务')
      return;
    }
    console.log('注册过的任务：',savedTask);
    const scheduleJobs = this.queryScheduleJobs();
    savedTask.forEach(taskName => {
      let taskInfo = this.queryTaskInfo(taskName)
      console.log('当前任务:', taskName);
      if(scheduleJobs.hasOwnProperty(taskInfo.taskName)) {
        console.log('此任务已注册');
      } else {
        console.log('此任务需要重新注册')
        this.createScheduleTask(taskInfo);
      }
    })
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

  // 执行脚本
  runScript(taskName, scriptName, executeType='auto') {
    showNotification(`开始执行任务:${taskName}`, '数据面板');
    let taskInfo = this.queryTaskInfo(taskName);
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
      console.log(data.toString())
    })
    // 监听标准错误流 (stderr)
    process.stderr.on('data', (data) => {
      console.log(data.toString())
    });
    // 监听进程退出
    process.on('close', (code) => {
      let taskInfo = this.queryTaskInfo(taskName);
      if (code !== 0) {
        console.error(`脚本${scriptInfo.key}执行失败，退出码: ${code}`);
        const now = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
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
      showNotification(`任务执行完成:${taskName}`, '数据面板');
    });
    // 监听进程错误 (例如：找不到 python 命令)
    process.on('error', (err) => {
      console.error('执行进程时发生错误:', err);
    });
  },

  // 更新任务
  updateTask(taskInfo) {
    setItem('task-' + taskInfo.taskName, taskInfo);
  },

  // 查询脚本信息
  queryScriptInfo(scriptName) {
    return getItem('script-' + scriptName);
  },

  totalSuccessPlus() {
    let successNum = getItem(SUCCESS_NUM);
    successNum = successNum ? successNum : 0;
    successNum += 1;
    setItem(SUCCESS_NUM, successNum);
    window.customEvents.fireEvent('totalSuccessUpdate', successNum);
    // window.dispatchEvent(new Event('totalSuccessUpdate', successNum));
  },

  totalFailPlus() {
    let failNum = getItem(FAIL_NUM);
    failNum = failNum ? failNum : 0;
    failNum += 1;
    setItem(FAIL_NUM, failNum);
  },

  saveScript(scriptName, scriptInfo) {
    setItem('script-' + scriptName, scriptInfo);
    let scriptList = this.queryScriptList();
    scriptList.push(scriptName)
    this.saveScriptList(scriptList);
  },

  queryScriptList() {
    const scriptList = getItem(SAVED_SCRIPTS_KEY);
    return scriptList ? scriptList : [];
  },

  removeScript(scriptName) {
    let scriptList = queryScript();
    scriptList = scriptList.filter((name) => name !== scriptName);
    this.saveScriptList(scriptList);
    removeItem('script-' + scriptName);
  },

  saveScriptList(scriptList) {
    setItem(SAVED_SCRIPTS_KEY, scriptList);
  },

  queryTaskInfo(taskName) {
    return getItem('task-' + taskName);
  },

  queryTaskList() {
    const taskList = getItem(SAVED_TASK_KEY);
    return taskList ? taskList : [];
  },

  saveTask(taskName, taskInfo) {
    setItem('task-' + taskName, taskInfo);
    let taskList = this.queryTaskList();
    taskList.push(taskName)
    this.saveTaskList(taskList);
  },

  removeTask(taskName) {
    let taskList = this.queryTaskList();
    taskList = taskList.filter((name) => name !== taskName );
    this.saveTaskList(taskList);
    removeItem('task-' + taskName);
  },

  saveTaskList(taskList) {
    setItem(SAVED_TASK_KEY, taskList);
  },

  // 获取总成功调用次数
  getTotalSuccessNum() {
    return getItem(SUCCESS_NUM);
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


