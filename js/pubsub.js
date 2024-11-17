const Events = (function() {
  let events = {};
  const subscribe = (eventName, fn) => {
    events[eventName] = (eventName in events) ? events[eventName] : [];
    events[eventName].push(fn);
  };
  const unsubscribe = (eventName, fn) => {
    events[eventName].splice(events[eventName].indexOf(fn), 1);
  };
  const trigger = (eventName) => {
    events[eventName]?.forEach(fn => {
      fn(...arguments);
    })
  };
  return { subscribe, unsubscribe, trigger };
})();
