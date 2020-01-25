(function () {
  if (typeof window.CustomEvent === "function") return false;

  function customEventCretor<T>(typeArg: string, eventInitDict?: CustomEventInit<T>) {
    eventInitDict = eventInitDict || { bubbles: false, cancelable: false, detail: null };

    const event = document.createEvent('CustomEvent');

    event.initCustomEvent(typeArg, eventInitDict.bubbles, eventInitDict.cancelable, eventInitDict.detail);

    return event;
  }

  customEventCretor.prototype = window.Event.prototype;

  (<any>window).CustomEvent = customEventCretor;
})();
