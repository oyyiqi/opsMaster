export const SCRIPT_TYPE = [
  {type: 'python', abbreviation: 'py'},
  {type: 'nodejs', abbreviation: 'js'},
  {type: 'shell', abbreviation: 'sh'},
]

export const SAVED_SCRIPTS_KEY = 'savedScripts';
export const SAVED_TASK_KEY = 'savedTask';

export const FREQUENCY = ['单次', '每天', '每周', '每月']
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
 * 将 node-schedule 的调度规则（Cron 表达式、Date 对象）翻译成中文。
 * @param {string | Date} rule - 调度规则
 * @returns {string} 对应的中文描述
 */
export function translateScheduleRule(rule) {
    // --- 情况一：处理 Date 对象 (单次执行) ---
    if (rule instanceof Date) {
        // 使用 toLocaleString 或 Intl.DateTimeFormat 进行格式化
        const options = {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false // 使用 24 小时制
        };
        const dateString = rule.toLocaleDateString('zh-CN', options);
        const timeString = rule.toLocaleTimeString('zh-CN', options);
        
        return `在 ${dateString} ${timeString.split(' ')[1]} 精确执行一次`;
    }

    // --- 情况二：处理 Cron 表达式 (string) ---
    if (typeof rule === 'string') {
        return translateCronToChinese(rule);
    }
    
    // --- 情况三：处理 RecurrenceRule 对象 (node-schedule特有) ---
    // 注意：要完美翻译 RecurrenceRule 对象需要复杂的递归逻辑，
    // 这里我们只做提示，实际应用中建议先将 RecurrenceRule 转换为 Cron 表达式再翻译。
    if (typeof rule === 'object' && rule !== null) {
         // 检查是否存在 RecurrenceRule 特有的属性
         if (Object.keys(rule).some(key => ['second', 'minute', 'hour', 'date', 'day', 'month'].includes(key))) {
             return "复杂规则对象，需进一步解析或转换为 Cron 表达式";
         }
    }

    return "无法识别的调度规则类型";
}

/**
 * 将六字段 Cron 表达式（秒 分 时 日 月 星期）翻译成中文描述。
 * * @param {string} cronExpression - 六字段 Cron 表达式 (例如: "0 30 9 * * 1-5")
 * @returns {string} 对应的中文描述
 */
function translateCronToChinese(cronExpression) {
    if (!cronExpression || typeof cronExpression !== 'string') {
        return "表达式无效";
    }

    const fields = cronExpression.trim().split(/\s+/);

    if (fields.length !== 6) {
        return "Cron 表达式格式错误 (需要 6 个字段)";
    }

    // 字段顺序：[秒, 分, 时, 日, 月, 星期]
    const [second, minute, hour, dayOfMonth, month, dayOfWeek] = fields;

    const descriptions = [];

    // --- 星期几翻译 ---
    const dayOfWeekMap = ['日', '一', '二', '三', '四', '五', '六'];
    
    // 翻译辅助函数
    const translateField = (fieldValue, unitName, unitMap = null) => {
        if (fieldValue === '*') {
            // 如果同时设置了日和星期，则 * 表示“不关心”或“每天/每星期”
            // 但在单独字段中，* 通常表示“每”
            return `每${unitName}`;
        }
        
        let translated = fieldValue;

        // 处理步长 /
        if (fieldValue.includes('/')) {
            const [start, step] = fieldValue.split('/');
            const unit = unitMap ? unitMap[parseInt(start)] : start;
            if (step) {
                return `从${unit === '*' ? unitName + '开始' : unit}${unitName}，每隔${step}个${unitName}执行`;
            }
        }
        
        // 处理范围 -
        if (fieldValue.includes('-')) {
            translated = fieldValue.replace('-', '到');
        }

        // 处理列表 ,
        if (fieldValue.includes(',')) {
             translated = fieldValue.split(',').map(v => unitMap ? unitMap[parseInt(v)] : v).join('、');
        }

        // 处理具体的日期/时间（如果有单位映射）
        if (unitMap) {
            if (fieldValue.includes(',') || fieldValue.includes('-')) {
                 // 范围或列表已处理，但需要替换数字
            } else if (!isNaN(parseInt(fieldValue))) {
                 translated = unitMap[parseInt(fieldValue)] || fieldValue;
            }
        }
        
        return translated + unitName;
    };

    // --- 翻译并加入描述数组 ---

    // 1. 星期（特殊处理：通常是与日互斥的）
    if (dayOfWeek !== '*') {
        descriptions.push(`在${translateField(dayOfWeek, '周', dayOfWeekMap)}`);
    } 
    
    // 2. 月份
    if (month !== '*') {
        descriptions.push(`在${translateField(month, '月')}份`);
    }

    // 3. 日期
    if (dayOfMonth !== '*') {
        // 如果星期和日期都设置了，通常是“满足任一条件”
        const dayPrefix = descriptions.some(desc => desc.includes('周')) ? '以及' : '';
        descriptions.push(`${dayPrefix}在${translateField(dayOfMonth, '日')}`);
    } else if (dayOfWeek === '*') {
        // 如果星期和日期都是 *，则每天
        descriptions.push('每天');
    }

    // 4. 小时
    if (hour !== '*') {
        descriptions.push(`的${translateField(hour, '点')}`);
    } else if (dayOfMonth === '*' && dayOfWeek === '*') {
        // 如果是小时级别重复，但日期/星期是 *，则 "每小时"
        descriptions.push('每小时');
    }


    // 5. 分钟
    if (minute !== '*') {
        descriptions.push(`的${translateField(minute, '分')}`);
    } else if (hour === '*' && dayOfMonth === '*' && dayOfWeek === '*') {
        // 如果是分钟级别重复，则 "每分钟"
        descriptions.push('每分钟');
    }
    
    // 6. 秒
    if (second !== '*') {
        descriptions.push(`的${translateField(second, '秒')}`);
    } else if (minute === '*' && hour === '*' && dayOfMonth === '*' && dayOfWeek === '*') {
        // 如果是秒级别重复，则 "每秒"
        descriptions.push('每秒');
    }
    
    // 基础语句：从后往前组装，更符合中文习惯
    let result = descriptions.join('');

    // 最终润色：处理全 * 情况
    if (result === '每秒每分钟每小时每天' || result === '每秒每分钟每小时') {
        return "每秒执行";
    }
    
    // 最终润色：处理重复前缀
    result = result.replace('每周', '每周');
    
    return result || "未定义周期";
}


/**
 * 解析执行计划（ISO时间字符串 / 6位Cron表达式）
 * @param {string} scheduleStr - 待解析的执行计划字符串
 * @returns {string} 解析后的易读描述（单次：YYYY-MM-DD HH:mm:ss / 频率：xxx）
 * @throws {Error} 格式不合法时抛出异常
 */
// export function parseSchedule(scheduleStr) {
//     // 工具函数：补零（如 5 → '05'）
//     const padStart = (num) => String(num).padStart(2, '0');

//     // 工具函数：验证6位Cron表达式格式
//     const isValidCron = (str) => {
//         const cronParts = str.trim().split(/\s+/);
//         if (cronParts.length !== 6) return false;
//         // 允许的字符：数字、*、/、,、-
//         const validCharReg = /^[\d\*\/,\-]+$/;
//         return cronParts.every(part => validCharReg.test(part));
//     };

//     // 工具函数：解析Cron单个字段为标准值（处理*、*/n、n-m、n1,n2等）
//     const resolveCronField = (field, type) => {
//         const fieldMap = {
//             second: { range: [0, 59] },
//             minute: { range: [0, 59] },
//             hour: { range: [0, 23] },
//             day: { range: [1, 31] },
//             month: { range: [1, 12] },
//             week: { range: [0, 7], alias: ['周日', '周一', '周二', '周三', '周四', '周五', '周六', '周日'] }
//         };
//         const { range, alias } = fieldMap[type];
//         const [min, max] = range;

//         // 通配符 * → 返回通配符标识
//         if (field === '*') return { type: 'all', value: '*' };

//         // 间隔符 */n → 返回间隔类型
//         const intervalMatch = field.match(/^\*\/(\d+)$/);
//         if (intervalMatch) {
//             const interval = Number(intervalMatch[1]);
//             if (interval < 1 || interval > max) throw new Error(`非法${type}间隔：${interval}`);
//             return { type: 'interval', value: interval };
//         }

//         // 范围符 n-m → 返回范围类型
//         const rangeMatch = field.match(/^(\d+)-(\d+)$/);
//         if (rangeMatch) {
//             const start = Number(rangeMatch[1]);
//             const end = Number(rangeMatch[2]);
//             if (start < min || end > max || start > end) throw new Error(`非法${type}范围：${start}-${end}`);
//             return { type: 'range', value: [start, end], alias: alias ? [alias[start], alias[end]] : [start, end] };
//         }

//         // 枚举符 n1,n2,n3 → 返回枚举类型
//         const enumMatch = field.match(/^(\d+,)+\d+$/);
//         if (enumMatch) {
//             const nums = field.split(',').map(Number);
//             if (nums.some(num => num < min || num > max)) throw new Error(`非法${type}枚举：${nums.join(',')}`);
//             return { type: 'enum', value: nums, alias: alias ? nums.map(num => alias[num]) : nums };
//         }

//         // 单个数字 → 返回固定值
//         const num = Number(field);
//         if (!isNaN(num) && num >= min && num <= max) {
//             return { type: 'fixed', value: num, alias: alias ? alias[num] : num };
//         }

//         throw new Error(`非法${type}格式：${field}`);
//     };

//     // 工具函数：解析6位Cron表达式（秒 分 时 日 月 周）
//     const parseCron = (cronStr) => {
//         const [second, minute, hour, day, month, week] = cronStr.trim().split(/\s+/);
        
//         // 解析每个字段的类型和值
//         const secondInfo = resolveCronField(second, 'second');
//         const minuteInfo = resolveCronField(minute, 'minute');
//         const hourInfo = resolveCronField(hour, 'hour');
//         const dayInfo = resolveCronField(day, 'day');
//         const monthInfo = resolveCronField(month, 'month');
//         const weekInfo = resolveCronField(week, 'week');

//         // 构建时间部分描述（优先固定值 → 范围 → 枚举 → 间隔 → 通配符）
//         const buildTimeDesc = () => {
//             const parts = [];
//             // 小时
//             if (hourInfo.type === 'fixed') parts.push(padStart(hourInfo.value));
//             else if (hourInfo.type === 'range') parts.push(`${hourInfo.alias[0]}-${hourInfo.alias[1]}`);
//             else if (hourInfo.type === 'enum') parts.push(hourInfo.alias.join(','));
//             else if (hourInfo.type === 'interval') parts.push(`每隔${hourInfo.value}小时`);
//             else parts.push('任意小时');

//             // 分钟
//             if (minuteInfo.type === 'fixed') parts.push(padStart(minuteInfo.value));
//             else if (minuteInfo.type === 'range') parts.push(`${minuteInfo.alias[0]}-${minuteInfo.alias[1]}`);
//             else if (minuteInfo.type === 'enum') parts.push(minuteInfo.alias.join(','));
//             else if (minuteInfo.type === 'interval') parts.push(`每隔${minuteInfo.value}分钟`);
//             else parts.push('任意分钟');

//             // 秒
//             if (secondInfo.type === 'fixed') parts.push(padStart(secondInfo.value));
//             else if (secondInfo.type === 'range') parts.push(`${secondInfo.alias[0]}-${secondInfo.alias[1]}`);
//             else if (secondInfo.type === 'enum') parts.push(secondInfo.alias.join(','));
//             else if (secondInfo.type === 'interval') parts.push(`每隔${secondInfo.value}秒`);
//             else parts.push('任意秒');

//             return parts.join(':');
//         };

//         const timeDesc = buildTimeDesc();

//         // 核心逻辑：判断执行频率（优先级：周 > 月 > 日 > 时 > 分 > 秒）
//         if (weekInfo.type !== 'all') {
//             // 周级（如 0 0 0 * * 1 → 每周：周一 00:00:00）
//             let weekDesc = '';
//             if (weekInfo.type === 'fixed') weekDesc = weekInfo.alias;
//             else if (weekInfo.type === 'range') weekDesc = `${weekInfo.alias[0]}-${weekInfo.alias[1]}`;
//             else if (weekInfo.type === 'enum') weekDesc = weekInfo.alias.join('、');
//             else if (weekInfo.type === 'interval') weekDesc = `每隔${weekInfo.value}周`;
//             return `每周：${weekDesc} ${timeDesc}`;
//         } else if (dayInfo.type !== 'all') {
//             // 月级（如 0 0 0 1 * * → 每月：1日 00:00:00）
//             let dayDesc = '';
//             if (dayInfo.type === 'fixed') dayDesc = `${dayInfo.value}日`;
//             else if (dayInfo.type === 'range') dayDesc = `${dayInfo.alias[0]}-${dayInfo.alias[1]}日`;
//             else if (dayInfo.type === 'enum') dayDesc = `${dayInfo.alias.join('、')}日`;
//             else if (dayInfo.type === 'interval') dayDesc = `每隔${dayInfo.value}日`;
//             return `每月：${dayDesc} ${timeDesc}`;
//         } else if (monthInfo.type !== 'all') {
//             // 年级（如 0 0 0 * 1 * → 每年：1月 00:00:00）
//             let monthDesc = '';
//             if (monthInfo.type === 'fixed') monthDesc = `${monthInfo.value}月`;
//             else if (monthInfo.type === 'range') monthDesc = `${monthInfo.alias[0]}-${monthInfo.alias[1]}月`;
//             else if (monthInfo.type === 'enum') monthDesc = `${monthInfo.alias.join('、')}月`;
//             else if (monthInfo.type === 'interval') monthDesc = `每隔${monthInfo.value}月`;
//             return `每年：${monthDesc} ${timeDesc}`;
//         } else if (hourInfo.type !== 'all' || minuteInfo.type !== 'all' || secondInfo.type !== 'all') {
//             // 日级（如 47 34 15 * * * → 每天：15:34:47）
//             return `每天：${timeDesc}`;
//         } else if (secondInfo.type === 'interval') {
//             // 秒级（如 */10 * * * * * → 每隔：10秒）
//             return `每隔：${secondInfo.value}秒`;
//         } else if (minuteInfo.type === 'interval') {
//             // 分钟级（如 0 */5 * * * * → 每隔：5分钟）
//             return `每隔：${minuteInfo.value}分钟`;
//         } else if (hourInfo.type === 'interval') {
//             // 小时级（如 0 0 */2 * * * → 每隔：2小时）
//             return `每隔：${hourInfo.value}小时`;
//         } else {
//             // 每秒执行（* * * * * *）
//             return `每隔：1秒`;
//         }
//     };

//     // 第一步：尝试解析ISO时间字符串（如 2025-12-30T16:00:00.000Z）
//     try {
//         const date = new Date(scheduleStr);
//         // 验证是否为有效时间（Invalid Date 会返回 NaN）
//         if (!isNaN(date.getTime())) {
//             // 转换为 UTC 时间（避免时区偏移，如需本地时间可改用 getFullYear/getMonth 等）
//             const year = date.getUTCFullYear();
//             const month = padStart(date.getUTCMonth() + 1); // 月份从0开始
//             const day = padStart(date.getUTCDate());
//             const hours = padStart(date.getUTCHours());
//             const minutes = padStart(date.getUTCMinutes());
//             const seconds = padStart(date.getUTCSeconds());
//             return `单次：${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
//         }
//     } catch (e) {
//         // 不是ISO时间，继续解析Cron
//     }

//     // 第二步：尝试解析6位Cron表达式
//     if (isValidCron(scheduleStr)) {
//         try {
//             return parseCron(scheduleStr);
//         } catch (cronError) {
//             throw new Error(`Cron表达式解析失败：${cronError.message}（输入：${scheduleStr}）`);
//         }
//     }

//     // 格式不合法
//     throw new Error(`执行计划格式不合法：${scheduleStr}（仅支持ISO时间字符串或6位Cron表达式）`);
// }

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



/**
 * 将 Date 对象格式化为 YYYY-MM-DD HH:mm:ss 字符串。
 * @param {Date} date - 要格式化的 Date 对象
 * @returns {string} 格式化后的日期时间字符串 (例如: "2025-12-31 15:30:05")
 */
export function formatDateTimeToStandard(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return "无效日期";
    }

    // --- 日期部分 ---
    const year = date.getFullYear();

    // 月份 (0-11，需要 +1)
    const month = String(date.getMonth() + 1).padStart(2, '0');

    // 日期 (1-31)
    const day = String(date.getDate()).padStart(2, '0');

    // --- 时间部分 ---
    // 小时 (24小时制)
    const hours = String(date.getHours()).padStart(2, '0');

    // 分钟
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // 秒
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // 拼接成 YYYY-MM-DD HH:mm:ss 格式
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}