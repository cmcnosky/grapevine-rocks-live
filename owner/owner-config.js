(() => {
  "use strict";
  const origin = "https://grapevine-rocks-live-publishing.cmcnosky.chatgpt.site";
  window.GRL_OWNER_API = Object.freeze({
    request(path, options) {
      if (!["/login", "/logout", "/catalog"].includes(path)) {
        throw new Error("Unknown owner operation");
      }
      return fetch(origin + "/owner" + path, {
        ...options,
        credentials: "omit",
        cache: "no-store",
        referrerPolicy: "no-referrer",
        redirect: "error",
      });
    },
  });
})();
