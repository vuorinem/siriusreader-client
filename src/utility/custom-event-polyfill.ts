(function () {
  if (typeof window.CustomEvent === "function") return false;

  function customEventCretor<T>(typeArg: string, eventInitDict?: CustomEventInit<T>) {
    const eventInit = eventInitDict || { bubbles: false, cancelable: false, detail: null };

    const event = document.createEvent('CustomEvent');

    event.initCustomEvent(typeArg, eventInit.bubbles ?? false, eventInit.cancelable ?? false, eventInit.detail);

    return event;
  }

  customEventCretor.prototype = window.Event.prototype;

  (<any>window).CustomEvent = customEventCretor;
})();
