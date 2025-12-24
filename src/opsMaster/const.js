// 暂时支持的脚本类型
export const SCRIPT_TYPE = [
  {type: 'python', abbreviation: 'py'},
  {type: 'javascript', abbreviation: 'js'},
  {type: 'shell', abbreviation: 'sh'},
]

// export const APP_FUNCS = [
//   {funcId: 'dataPanel', funcName: '数据面板'},
//   {funcId: 'scriptManage', funcName: '脚本管理'},
//   {funcId: 'taskManage', funcName: '任务管理'},
//   {funcId: 'logManage', funcName: '日志管理'},
// ]

export const TASK_TYPE = {
  SCRIPT_TASK: '脚本任务',
  REMIND_TASK: '提醒任务',
}

export const APP_FUNCS = {
  DATA_PANEL: '数据面板',
  SCRIPT_MANAGE: '脚本管理',
  TASK_MANAGE: '任务管理',
  LOG_MANAGE: '日志管理',
}


export const TASK_STATUS = {
  0: '就绪',
  1: '运行中',
  2: '已完成'
}

export const SAVED_SCRIPTS_KEY = 'scriptList';
export const SAVED_TASK_KEY = 'taskList';

export const SCHEDULE_TYPE = {
  ONE_TIME: '单次',
  DAYLY: '每天',
  WEEKLY: '每周',
  MONTHLY: '每月',
  CUSTOM: '自定义'
}
export const DAY_OF_WEEK = [
  { value: '周一', key: 1 },
  { value: '周二', key: 2 },
  { value: '周三', key: 3 },
  { value: '周四', key: 4 },
  { value: '周五', key: 5 },
  { value: '周六', key: 6 },
  { value: '周日', key: 7 },
]
export const DAY_OF_MONTH = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
  31
]