// 暂时支持的脚本类型
export const SCRIPT_TYPE = [
  {type: 'python', abbreviation: 'py'},
  {type: 'javascript', abbreviation: 'js'},
  {type: 'shell', abbreviation: 'sh'},
]

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


/**
 * 解析执行计划（ISO时间字符串 / 6位Cron表达式）
 * @param {string} scheduleStr - 待解析的执行计划字符串
 * @returns {string} 解析结果：
 * - ISO时间：单次：YYYY-MM-DD HH:mm:ss（UTC时间，无时区偏移）
 * - Cron表达式：每天 / 每周X / 每月X（X为具体星期/日期）
 * @throws {Error} 格式不合法时抛出异常
 */
export function parseSchedule(scheduleStr) {
  // 工具函数：补零（如 5 → '05'）
  const padStart = (num) => String(num).padStart(2, '0');

  // -------------- 第一步：解析ISO时间字符串 --------------
  try {
    const date = new Date(scheduleStr);
    // 验证是否为有效ISO时间（排除Invalid Date）
    if (!isNaN(date.getTime()) && scheduleStr.includes('T') && scheduleStr.includes('Z')) {
      return `单次`;
    }
  } catch (e) {
    // 不是有效ISO时间，继续解析Cron
  }

  // -------------- 第二步：验证并解析Cron表达式 --------------
  // 验证Cron格式：6个字段，仅包含数字、*、/、,、-
  const cronParts = scheduleStr.trim().split(/\s+/);
  const validCronReg = /^[\d\*\/,\-]+$/;
  if (cronParts.length !== 6 || !cronParts.every(part => validCronReg.test(part))) {
    throw new Error(`执行计划格式不合法：${scheduleStr}（仅支持ISO时间字符串或6位Cron表达式）`);
  }

  // 解构Cron字段：秒 分 时 日 月 周（6位）
  const [second, minute, hour, day, month, week] = cronParts;
  const weekAlias = ['日', '一', '二', '三', '四', '五', '六', '日']; // 0和7都对应周日

  // 工具函数：验证字段是否为固定值（非*、非范围、非间隔）
  const isFixedValue = (field) => {
    return /^\d+$/.test(field) && !field.includes('/') && !field.includes('-') && !field.includes(',');
  };

  // 核心逻辑：仅识别「每天/每周X/每月X」三种场景，其他Cron视为非法
  if (
    // 每天：日、月、周都是*，时/分/秒为固定值（如 47 34 15 * * *）
    day === '*' && month === '*' && week === '*' &&
    isFixedValue(hour) && isFixedValue(minute) && isFixedValue(second)
  ) {
    return '每天';
  } else if (
    // 每周X：周为固定值，日、月为*，时/分/秒为固定值（如 0 0 8 * * 1）
    day === '*' && month === '*' && isFixedValue(week) &&
    isFixedValue(hour) && isFixedValue(minute) && isFixedValue(second)
  ) {
    const weekNum = Number(week);
    if (weekNum < 0 || weekNum > 7) throw new Error(`非法星期值：${week}（支持0-7，0/7为周日）`);
    return `每周${weekAlias[weekNum]}`;
  } else if (
    // 每月X：日为固定值，月、周为*，时/分/秒为固定值（如 0 30 10 1 * *）
    month === '*' && week === '*' && isFixedValue(day) &&
    isFixedValue(hour) && isFixedValue(minute) && isFixedValue(second)
  ) {
    const dayNum = Number(day);
    if (dayNum < 1 || dayNum > 31) throw new Error(`非法日期值：${day}（支持1-31）`);
    return `每月${dayNum}号`;
  } else {
    throw new Error(`不支持的Cron表达式：${scheduleStr}（仅支持「每天/每周X/每月X」格式，时/分/秒需为固定值）`);
  }
}