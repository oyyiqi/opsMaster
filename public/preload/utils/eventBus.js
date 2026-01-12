// eventBus.js
class EventBus {
  constructor() {
    this.events = {}; // 存储事件订阅回调：{ 事件名: [回调1, 回调2] }
  }

  // 订阅事件
  addEvent(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  // 发布事件（携带数据）
  fireEvent(eventName, data) {
    if (this.events[eventName]) {
      // 触发所有订阅该事件的回调，并传递数据
      this.events[eventName].forEach(callback => callback(data));
    }
  }

  // 取消订阅（避免内存泄漏）
  removeEvent(eventName, callback) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
    }
  }
}

var customEvents =  new EventBus();
console.log('加载事件总线');