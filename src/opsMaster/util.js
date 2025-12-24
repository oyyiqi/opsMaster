// import { SAVED_SCRIPTS_KEY, SAVED_TASK_KEY } from "./const";

// export function queryScriptInfo(scriptName) {
//   return window.utools.dbStorage.getItem('script-' + scriptName);
// }

// export function queryScriptList() {
//   const scriptList = window.utools.dbStorage.getItem(SAVED_SCRIPTS_KEY);
//   return scriptList ? scriptList : [];
// }

// export function saveScript(scriptName, scriptInfo) {
//   window.utools.dbStorage.setItem('script-' + scriptName, scriptInfo);
//   let scriptList = queryScriptList();
//   scriptList.push(scriptName)
//   saveScriptList(scriptList);
// }

// export function removeScript(scriptName) {
//   let scriptList = queryScriptList();
//   scriptList = scriptList.filter((name) => name !== scriptName);
//   saveScriptList(scriptList);
//   window.utools.dbStorage.removeItem('script-' + scriptName);
// }

// function saveScriptList(scriptList) {
//   window.utools.dbStorage.setItem(SAVED_SCRIPTS_KEY, scriptList);
// }

// export function queryTaskInfo(taskName) {
//   return window.utools.dbStorage.getItem('task-' + taskName);
// }

// export function queryTaskList() {
//   const taskList = window.utools.dbStorage.getItem(SAVED_TASK_KEY);
//   return taskList ? taskList : [];
// }

// export function saveTask(taskName, taskInfo) {
//   window.utools.dbStorage.setItem('task-' + taskName, taskInfo);
//   let taskList = queryTaskList();
//   taskList.push(taskName)
//   saveTaskList(taskList);
// }

// export function removeTask(taskName) {
//   let taskList = queryTaskList();
//   taskList = taskList.filter((name) => name !== taskName );
//   saveTaskList(taskList);
//   window.utools.dbStorage.removeItem('task-' + taskName);
// }

// function saveTaskList(taskList) {
//   window.utools.dbStorage.setItem(SAVED_TASK_KEY, taskList);
// }


/**
 * 判断是否符合 6 位标准 Cron 表达式（秒 分 时 日 月 周）
 * @param {string} cron - 待校验的 Cron 表达式字符串
 * @returns {boolean} 符合返回 true，否则返回 false
 */
export function is6BitCronValid(cron) {
  // 1. 基础校验：非字符串、空字符串直接返回 false
  if (typeof cron !== 'string' || cron.trim() === '') {
    return false;
  }

  // 2. 分割字段：按空格分割，必须恰好 6 个字段（去重空字符）
  const fields = cron.trim().split(/\s+/).filter(field => field);
  if (fields.length !== 6) {
    return false;
  }

  // 3. 定义每个字段的校验规则：[最小值, 最大值, 允许的文本映射（如 Jan→1）]
  const fieldRules = [
    // 秒：0-59，无文本映射
    { min: 0, max: 59, textMap: null },
    // 分：0-59，无文本映射
    { min: 0, max: 59, textMap: null },
    // 时：0-23，无文本映射
    { min: 0, max: 23, textMap: null },
    // 日：1-31，支持 ?（与周互斥，此处仅校验格式，互斥逻辑单独处理）
    { min: 1, max: 31, textMap: null, allowQuestion: true },
    // 月：1-12 或 Jan-Dec（不区分大小写）
    { 
      min: 1, 
      max: 12, 
      textMap: { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 } 
    },
    // 周：0-6 或 Sun-Sat（0=周日，不区分大小写），支持 ?
    { 
      min: 0, 
      max: 6, 
      textMap: { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 },
      allowQuestion: true 
    }
  ];

  // 4. 校验每个字段的格式合法性
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i].trim().toLowerCase();
    const rule = fieldRules[i];

    // 4.1 处理通配符 *：直接通过
    if (field === '*') {
      continue;
    }

    // 4.2 处理 ?：仅日和周字段允许
    if (field === '?') {
      if (!rule.allowQuestion) {
        return false; // 非日/周字段使用 ?，非法
      }
      continue;
    }

    // 4.3 处理列表格式（, 分隔）：如 1,3,5 或 Mon,Wed,Fri
    if (field.includes(',')) {
      const listItems = field.split(',').filter(item => item.trim());
      if (listItems.length === 0) {
        return false; // 空列表（如 ",,12"）
      }
      // 递归校验每个列表项（必须都符合字段规则）
      const allValid = listItems.every(item => 
        validateSingleField(item, rule)
      );
      if (!allValid) {
        return false;
      }
      continue;
    }

    // 4.4 处理范围+步长格式（- 和 / 组合）：如 0-30/10 或 Mon-Fri/2
    if (field.includes('-') || field.includes('/')) {
      // 分割步长（格式：范围/步长 或 *?/步长）
      const [rangePart, stepPart] = field.split('/');
      
      // 校验步长：必须是正整数（可选，默认 1）
      if (stepPart) {
        const step = parseInt(stepPart, 10);
        if (isNaN(step) || step <= 0) {
          return false; // 步长非正整数（如 /0 或 /abc）
        }
      }

      // 校验范围部分（如 0-30 或 Mon-Fri 或 * 或 ?）
      if (rangePart === '*' || (rangePart === '?' && rule.allowQuestion)) {
        continue; // 范围为 * 或 ?（仅日/周），合法
      }

      // 处理范围（- 分隔）：如 0-30 或 Mon-Fri
      if (rangePart.includes('-')) {
        const [start, end] = rangePart.split('-').map(item => item.trim());
        if (!start || !end) {
          return false; // 不完整范围（如 0- 或 -30）
        }

        // 校验范围的起始和结束值
        const startVal = parseFieldValue(start, rule);
        const endVal = parseFieldValue(end, rule);
        if (startVal === null || endVal === null) {
          return false; // 起始/结束值非法（如 100-200 或 ABC-XYZ）
        }
        if (startVal > endVal) {
          return false; // 起始值大于结束值（如 30-0）
        }
      } else {
        // 无范围仅步长（如 5/10 → 等价于 5-最大值/10），校验基础值
        const baseVal = parseFieldValue(rangePart, rule);
        if (baseVal === null) {
          return false;
        }
      }
      continue;
    }

    // 4.5 处理单个值（如 5 或 Jan 或 Sun）
    const singleVal = parseFieldValue(field, rule);
    if (singleVal === null) {
      return false;
    }
  }

  // 5. 额外校验：日和周不能同时为 ?（互斥规则）
  const dayField = fields[3].trim().toLowerCase();
  const weekField = fields[5].trim().toLowerCase();
  if (dayField === '?' && weekField === '?') {
    return false; // 日和周同时使用 ?，非法
  }

  // 所有校验通过
  return true;
}

/**
 * 辅助函数：解析单个字段值（转换为数字并校验范围）
 * @param {string} value - 单个字段值（如 5、Jan、Sun）
 * @param {object} rule - 字段规则（min/max/textMap）
 * @returns {number|null} 合法返回数字，非法返回 null
 */
function parseFieldValue(value, rule) {
  // 文本映射（如 Jan→1、Sun→0）
  if (rule.textMap && rule.textMap.hasOwnProperty(value)) {
    return rule.textMap[value];
  }

  // 数字值校验
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    return null; // 非数字且无对应文本映射（如 ABC）
  }
  if (num < rule.min || num > rule.max) {
    return null; // 数字超出范围（如 60 秒、24 时）
  }
  return num;
}

/**
 * 辅助函数：校验单个字段项（用于列表项校验）
 * @param {string} item - 单个字段项（如 5、Jan、0-30/10）
 * @param {object} rule - 字段规则
 * @returns {boolean} 合法返回 true
 */
function validateSingleField(item, rule) {
  const lowerItem = item.trim().toLowerCase();

  // 通配符 * 或 ?（仅允许的字段）
  if (lowerItem === '*') return true;
  if (lowerItem === '?' && rule.allowQuestion) return true;

  // 范围+步长格式
  if (lowerItem.includes('-') || lowerItem.includes('/')) {
    const [rangePart, stepPart] = lowerItem.split('/');
    if (stepPart) {
      const step = parseInt(stepPart, 10);
      if (isNaN(step) || step <= 0) return false;
    }
    if (rangePart.includes('-')) {
      const [start, end] = rangePart.split('-').map(v => v.trim());
      if (!start || !end) return false;
      const startVal = parseFieldValue(start, rule);
      const endVal = parseFieldValue(end, rule);
      if (startVal === null || endVal === null || startVal > endVal) return false;
    } else {
      const baseVal = parseFieldValue(rangePart, rule);
      if (baseVal === null) return false;
    }
    return true;
  }

  // 单个值（数字或文本映射）
  return parseFieldValue(lowerItem, rule) !== null;
}


export function buildCronExpression(options = {}) {
  const {
    second,
    minute,
    hour,
    dayOfMonth,
    month,
    dayOfWeek
  } = options;

  // 使用数组定义字段的顺序和默认值。
  // 如果字段值是 undefined 或 null，则使用默认值 '*'
  const fields = [
    second,
    minute,
    hour,
    dayOfMonth,
    month,
    dayOfWeek
  ].map(field => {
    // 使用三元运算符判断字段是否传入
    return (field === undefined || field === null || field === '') ? '*' : String(field);
  });

  // 使用空格将所有字段连接起来
  return fields.join(' ');
}



/**
 * 解析ISO时间字符串或6位Cron表达式，仅返回核心执行周期（忽略具体时/分/秒固定值）
 * @param {string} scheduleStr - 待解析的执行计划（ISO时间字符串或6位Cron）
 * @returns {string} 极简中文周期描述（如「单次」「每周二」「每月2号」「每隔10秒」）
 * @throws {Error} 格式非法或不支持的场景抛出异常
 */
export function parseSchedule(scheduleStr) {
  if (typeof scheduleStr !== 'string' || scheduleStr.trim() === '') {
    throw new Error('执行计划不能为空字符串');
  }
  const trimmedStr = scheduleStr.trim();

  // -------------- 第一步：解析ISO时间字符串（仅返回「单次」）--------------
  try {
    const date = new Date(trimmedStr);
    if (!isNaN(date.getTime()) && (trimmedStr.includes('T') || trimmedStr.includes('Z'))) {
      return '单次';
    }
  } catch (e) {
    // 不是有效ISO时间，继续解析Cron
  }

  // -------------- 第二步：验证Cron表达式合法性 --------------
  const cronParts = trimmedStr.split(/\s+/).filter(part => part);
  if (cronParts.length !== 6) {
    throw new Error(`Cron表达式必须为6位（秒 分 时 日 月 周），当前为${cronParts.length}位`);
  }

  // 字段规则：为日/月字段补充周期前缀标识
  const fieldConfigs = [
    { name: '秒', min: 0, max: 59, textMap: null, allowQuestion: false, alias: '秒' },
    { name: '分', min: 0, max: 59, textMap: null, allowQuestion: false, alias: '分' },
    { name: '时', min: 0, max: 23, textMap: null, allowQuestion: false, alias: '时' },
    { 
      name: '日', 
      min: 1, 
      max: 31, 
      textMap: null, 
      allowQuestion: true, 
      alias: '号',
      periodKey: 'day',
      periodPrefix: '每月' // 日字段的周期前缀（月为*时显示）
    },
    { 
      name: '月', 
      min: 1, 
      max: 12, 
      textMap: { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 }, 
      allowQuestion: false, 
      alias: '月',
      periodKey: 'month',
      periodPrefix: '' // 月字段本身已包含「月」字，无需额外前缀
    },
    { 
      name: '周', 
      min: 0, 
      max: 6, 
      textMap: { sun:0,mon:1,tue:2,wed:3,thu:4,fri:5,sat:6 }, 
      allowQuestion: true, 
      alias: ['日','一','二','三','四','五','六'],
      periodKey: 'week',
      periodPrefix: '每周' // 周字段的周期前缀
    }
  ];

  // 校验并标准化每个字段
  const normalizedParts = cronParts.map((part, index) => {
    const lowerPart = part.toLowerCase();
    const config = fieldConfigs[index];

    if (!/^[\d\*\/,\-?a-z]+$/.test(lowerPart)) {
      throw new Error(`Cron包含非法字符：${part}（${config.name}字段）`);
    }
    if (lowerPart === '?' && !config.allowQuestion) {
      throw new Error(`「?」仅支持日和周字段，${config.name}字段不能使用`);
    }
    return lowerPart;
  });

  // 校验日和周不能同时为?
  const [, , , dayPart, monthPart, weekPart] = normalizedParts;
  if (dayPart === '?' && weekPart === '?') {
    throw new Error('日和周不能同时为「?」（互斥）');
  }

  // -------------- 第三步：解析核心周期（月/日/周）+ 频率（时/分/秒）--------------
  // 辅助函数：解析单个字段（补充周期前缀，确保语义完整）
  const parseField = (part, config, relatedParts = {}) => {
    if (part === '*') return '';
    if (part === '?') return '';

    // 列表（,分隔）：如1,3 → 每月1、3号 / 每周一、三
    if (part.includes(',')) {
      const items = part.split(',').map(item => parseSingleItem(item, config));
      const joined = items.filter(Boolean).join('、');
      return `${getPeriodPrefix(config, relatedParts)}${joined}`;
    }

    // 步长（/分隔）：如*/2 → 每月每隔2号 / 每周每隔2天
    if (part.includes('/')) {
      const [rangePart, stepPart] = part.split('/');
      const step = parseInt(stepPart, 10);
      if (isNaN(step) || step <= 0) {
        throw new Error(`非法步长：${stepPart}（${config.name}字段，步长需为正整数）`);
      }
      if (rangePart === '*') {
        return `${getPeriodPrefix(config, relatedParts)}每隔${step}${config.alias}`;
      }
      const rangeDesc = parseSingleItem(rangePart, config);
      return `${getPeriodPrefix(config, relatedParts)}${rangeDesc}每隔${step}${config.alias}`;
    }

    // 单个值/范围：如2 → 每月2号；1-3 → 每月1-3号 / 每周一-三
    if (config.periodKey) {
      const itemDesc = parseSingleItem(part, config);
      return `${getPeriodPrefix(config, relatedParts)}${itemDesc}`;
    }
    return '';
  };

  // 辅助函数：获取字段的周期前缀（处理日字段与月字段的关联）
  const getPeriodPrefix = (config, relatedParts) => {
    // 日字段特殊处理：如果月字段是具体值（非*），则日字段不加「每月」前缀（如「3月2号」而非「每月3月2号」）
    if (config.name === '日' && relatedParts.monthPart && relatedParts.monthPart !== '*') {
      return '';
    }
    return config.periodPrefix || '';
  };

  // 辅助函数：解析单个字段项
  const parseSingleItem = (item, config) => {
    // 文本映射（如Sun→0，Jan→1）
    if (config.textMap && config.textMap[item]) {
      item = config.textMap[item].toString();
    }

    // 范围（-分隔）：如1-3 → 1-3号 / 一-三
    if (item.includes('-')) {
      const [start, end] = item.split('-').map(val => parseValue(val, config));
      if (start === null || end === null || start > end) {
        throw new Error(`非法范围：${item}（${config.name}字段，需符合${config.min}-${config.max}且起始≤结束）`);
      }
      return config.name === '周' 
        ? `${config.alias[start]}-${config.alias[end]}` // 周范围：一-三
        : `${start}-${end}${config.alias}`; // 其他范围：1-3号、1-3月
    }

    // 单个值：如2 → 2号 / 二；Jan→1月
    const val = parseValue(item, config);
    if (val === null) {
      throw new Error(`非法${config.name}值：${item}（允许${config.min}-${config.max}）`);
    }
    return config.name === '周' 
      ? config.alias[val] // 周单个值：二
      : `${val}${config.alias}`; // 其他单个值：2号、3月
  };

  // 辅助函数：解析单个数值（验证范围）
  const parseValue = (val, config) => {
    const num = parseInt(val, 10);
    return isNaN(num) || num < config.min || num > config.max ? null : num;
  };

  // 1. 解析周期字段（月/日/周）：传递关联字段（月字段给日字段判断前缀）
  const periodFields = [];
  // 解析月字段
  const monthDesc = parseField(monthPart, fieldConfigs[4]);
  if (monthDesc) periodFields.push(monthDesc);
  // 解析日字段：传递月字段信息，判断是否加「每月」前缀
  const dayDesc = parseField(dayPart, fieldConfigs[3], { monthPart });
  if (dayDesc) periodFields.push(dayDesc);
  // 解析周字段
  const weekDesc = parseField(weekPart, fieldConfigs[5]);
  if (weekDesc) periodFields.push(weekDesc);

  // 2. 解析频率字段（时/分/秒）
  const freqFields = [0, 1, 2].map(index => {
    const part = normalizedParts[index];
    const config = fieldConfigs[index];
    return parseField(part, config);
  }).filter(Boolean);

  // -------------- 第四步：组合最终结果 --------------
  let finalDesc = '';

  if (periodFields.length > 0) {
    finalDesc = periodFields.join('');
  } else if (freqFields.length > 0) {
    finalDesc = freqFields.join(' ');
  } else {
    finalDesc = '每天';
  }

  if (freqFields.length > 0 && periodFields.length > 0) {
    finalDesc += ` ${freqFields.join(' ')}`;
  }

  return finalDesc.trim() || '每天';
}


