(() => {
  // js/app/guest/progress.js
  var progress = /* @__PURE__ */ (() => {
    let info = null;
    let bar = null;
    let total = 0;
    let loaded = 0;
    let valid = true;
    let cancelProgress = null;
    const add = () => {
      total += 1;
    };
    const showInformation = () => {
      return `(${loaded}/${total}) [${parseInt(loaded / total * 100).toFixed(0)}%]`;
    };
    const complete = (type, skip = false) => {
      if (!valid) {
        return;
      }
      loaded += 1;
      info.innerText = `Loading ${type} ${skip ? "skipped" : "complete"} ${showInformation()}`;
      bar.style.width = Math.min(loaded / total * 100, 100).toString() + "%";
      if (loaded === total) {
        valid = false;
        cancelProgress = null;
        document.dispatchEvent(new Event("undangan.progress.done"));
      }
    };
    const invalid = (type) => {
      if (valid) {
        valid = false;
        bar.style.backgroundColor = "red";
        info.innerText = `Error loading ${type} ${showInformation()}`;
        document.dispatchEvent(new Event("undangan.progress.invalid"));
      }
    };
    const getAbort = () => cancelProgress;
    const init = () => {
      info = document.getElementById("progress-info");
      bar = document.getElementById("progress-bar");
      info.classList.remove("d-none");
      cancelProgress = new Promise((res) => document.addEventListener("undangan.progress.invalid", res));
    };
    return {
      init,
      add,
      invalid,
      complete,
      getAbort
    };
  })();

  // js/common/util.js
  var util = /* @__PURE__ */ (() => {
    const loader2 = '<span class="spinner-border spinner-border-sm my-0 ms-0 me-1 p-0" style="height: 0.8rem; width: 0.8rem;"></span>';
    const listsMarkDown = [
      ["*", `<strong class="text-theme-auto">$1</strong>`],
      ["_", `<em class="text-theme-auto">$1</em>`],
      ["~", `<del class="text-theme-auto">$1</del>`],
      ["```", `<code class="font-monospace text-theme-auto">$1</code>`]
    ];
    const deviceTypes = [
      { type: "Mobile", regex: /Android.*Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i },
      { type: "Tablet", regex: /iPad|Android(?!.*Mobile)|Tablet/i },
      { type: "Desktop", regex: /Windows NT|Macintosh|Linux/i }
    ];
    const browsers = [
      { name: "Chrome", regex: /Chrome|CriOS/i },
      { name: "Safari", regex: /Safari/i },
      { name: "Edge", regex: /Edg|Edge/i },
      { name: "Firefox", regex: /Firefox|FxiOS/i },
      { name: "Opera", regex: /Opera|OPR/i },
      { name: "Internet Explorer", regex: /MSIE|Trident/i },
      { name: "Samsung Browser", regex: /SamsungBrowser/i }
    ];
    const operatingSystems = [
      { name: "Windows", regex: /Windows NT ([\d.]+)/i },
      { name: "MacOS", regex: /Mac OS X ([\d_.]+)/i },
      { name: "Android", regex: /Android ([\d.]+)/i },
      { name: "iOS", regex: /OS ([\d_]+) like Mac OS X/i },
      { name: "Linux", regex: /Linux/i },
      { name: "Ubuntu", regex: /Ubuntu/i },
      { name: "Chrome OS", regex: /CrOS/i }
    ];
    const escapeHtml = (unsafe) => {
      return String(unsafe).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    };
    const notify = (message) => {
      const exec = (emoji) => {
        window.alert(`${emoji} ${message}`);
      };
      return {
        success: () => exec("\u{1F7E9}"),
        error: () => exec("\u{1F7E5}"),
        warning: () => exec("\u{1F7E8}"),
        info: () => exec("\u{1F7E6}"),
        custom: (emoji) => exec(emoji)
      };
    };
    const ask = (message) => window.confirm(`\u{1F7E6} ${message}`);
    const safeInnerHTML = (el, html) => {
      el.replaceChildren(document.createRange().createContextualFragment(html));
      return el;
    };
    const changeOpacity = (el, isUp, step = 0.05) => new Promise((res) => {
      let op = parseFloat(el.style.opacity);
      const target = isUp ? 1 : 0;
      const animate = () => {
        op += isUp ? step : -step;
        op = Math.max(0, Math.min(1, op));
        el.style.opacity = op.toFixed(2);
        if (isUp && op >= target || !isUp && op <= target) {
          el.style.opacity = target.toString();
          res(el);
        } else {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    });
    const timeOut = (callback, delay = 0) => {
      let clear = null;
      const c = () => {
        callback();
        clearTimeout(clear);
        clear = null;
      };
      clear = setTimeout(c, delay);
    };
    const debounce = (callback, delay = 100) => {
      let timeout = null;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => callback(...args), delay);
      };
    };
    const disableButton = (button, message = "Loading", replace = false) => {
      button.disabled = true;
      const tmp = button.innerHTML;
      safeInnerHTML(button, replace ? message : loader2 + message);
      return {
        restore: (disabled = false) => {
          button.innerHTML = tmp;
          button.disabled = disabled;
        }
      };
    };
    const disableCheckbox = (checkbox) => {
      checkbox.disabled = true;
      const label = document.querySelector(`label[for="${checkbox.id}"]`);
      const tmp = label.innerHTML;
      safeInnerHTML(label, loader2 + tmp);
      return {
        restore: () => {
          label.innerHTML = tmp;
          checkbox.disabled = false;
        }
      };
    };
    const copy = async (button, message = null, timeout = 1500) => {
      const data = button.getAttribute("data-copy");
      if (!data || data.length === 0) {
        notify("Nothing to copy").warning();
        return;
      }
      button.disabled = true;
      try {
        await navigator.clipboard.writeText(data);
      } catch {
        button.disabled = false;
        notify("Failed to copy").error();
        return;
      }
      const tmp = button.innerHTML;
      safeInnerHTML(button, message ? message : '<i class="fa-solid fa-check"></i>');
      timeOut(() => {
        button.disabled = false;
        button.innerHTML = tmp;
      }, timeout);
    };
    const base64Encode = (str) => {
      const encoder = new TextEncoder();
      const encodedBytes = encoder.encode(str);
      return window.btoa(String.fromCharCode(...encodedBytes));
    };
    const base64Decode = (str) => {
      const decoder = new TextDecoder();
      const decodedBytes = Uint8Array.from(window.atob(str), (c) => c.charCodeAt(0));
      return decoder.decode(decodedBytes);
    };
    const parseUserAgent = (userAgent) => {
      if (!userAgent || typeof userAgent !== "string") {
        return "Unknown";
      }
      const deviceType = deviceTypes.find((i) => i.regex.test(userAgent))?.type ?? "Unknown";
      const browser = browsers.find((i) => i.regex.test(userAgent))?.name ?? "Unknown";
      const osMatch = operatingSystems.find((i) => i.regex.test(userAgent));
      const osName = osMatch ? osMatch.name : "Unknown";
      const osVersion = osMatch ? userAgent.match(osMatch.regex)?.[1]?.replace(/_/g, ".") ?? null : null;
      return `${browser} ${deviceType} ${osVersion ? `${osName} ${osVersion}` : osName}`;
    };
    const getGMTOffset = (tz) => {
      const now = /* @__PURE__ */ new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hourCycle: "h23",
        hour: "numeric"
      });
      let offset = (parseInt(formatter.format(now)) - now.getUTCHours() + 24) % 24;
      if (offset > 12) {
        offset -= 24;
      }
      return `GMT${offset >= 0 ? "+" : ""}${offset}`;
    };
    const convertMarkdownToHTML = (str) => {
      listsMarkDown.forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\${k}(\\S(?:[\\s\\S]*?\\S)?)\\${k}`, "g"), v);
      });
      return str;
    };
    return {
      loader: loader2,
      ask,
      copy,
      notify,
      timeOut,
      debounce,
      escapeHtml,
      base64Encode,
      base64Decode,
      disableButton,
      disableCheckbox,
      safeInnerHTML,
      parseUserAgent,
      changeOpacity,
      getGMTOffset,
      convertMarkdownToHTML
    };
  })();

  // js/connection/request.js
  var HTTP_GET = "GET";
  var HTTP_POST = "POST";
  var HTTP_PATCH = "PATCH";
  var HTTP_STATUS_OK = 200;
  var HTTP_STATUS_CREATED = 201;
  var HTTP_STATUS_PARTIAL_CONTENT = 206;
  var HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;
  var ERROR_ABORT = "AbortError";
  var ERROR_TYPE = "TypeError";
  var defaultJSON = {
    "Accept": "application/json",
    "Content-Type": "application/json"
  };
  var cacheRequest = "request";
  var pool = /* @__PURE__ */ (() => {
    let cachePool = null;
    return {
      /**
       * @param {string} name
       * @returns {Cache}
       */
      getInstance: (name) => {
        if (!cachePool || !cachePool.has(name)) {
          throw new Error(`please init cache first: ${name}`);
        }
        return cachePool.get(name);
      },
      /**
       * @param {string} name 
       * @returns {Promise<void>}
       */
      restart: async (name) => {
        cachePool.set(name, null);
        cachePool.delete(name);
        await window.caches.delete(name);
        await window.caches.open(name).then((c) => cachePool.set(name, c));
      },
      /**
       * @param {function} callback
       * @param {string[]} lists 
       * @returns {void}
       */
      init: (callback, lists = []) => {
        if (!window.isSecureContext) {
          throw new Error("this application required secure context");
        }
        cachePool = /* @__PURE__ */ new Map();
        Promise.all(lists.concat([cacheRequest]).map((v) => window.caches.open(v).then((c) => cachePool.set(v, c)))).then(() => callback());
      }
    };
  })();
  var cacheWrapper = (cacheName) => {
    const cacheObject = pool.getInstance(cacheName);
    const set = (input, res, forceCache, ttl) => res.clone().arrayBuffer().then((ab) => {
      if (!res.ok) {
        return res;
      }
      const now = /* @__PURE__ */ new Date();
      const headers = new Headers(res.headers);
      if (!headers.has("Date")) {
        headers.set("Date", now.toUTCString());
      }
      if (forceCache || !headers.has("Cache-Control")) {
        if (!forceCache && headers.has("Expires")) {
          const expTime = new Date(headers.get("Expires"));
          ttl = Math.max(0, expTime.getTime() - now.getTime());
        }
        if (ttl === 0) {
          throw new Error("Cache max age cannot be 0");
        }
        headers.set("Cache-Control", `public, max-age=${Math.floor(ttl / 1e3)}`);
      }
      if (!headers.has("Content-Length")) {
        headers.set("Content-Length", String(ab.byteLength));
      }
      return cacheObject.put(input, new Response(ab, { headers })).then(() => res);
    });
    const has = (input) => cacheObject.match(input).then((res) => {
      if (!res) {
        return null;
      }
      const maxAge = res.headers.get("Cache-Control").match(/max-age=(\d+)/)[1];
      const expTime = Date.parse(res.headers.get("Date")) + parseInt(maxAge) * 1e3;
      return Date.now() > expTime ? null : res;
    });
    const del = (input) => cacheObject.delete(input);
    return {
      set,
      has,
      del
    };
  };
  var request = (method, path) => {
    const ac = new AbortController();
    const req = {
      signal: ac.signal,
      credential: "include",
      headers: new Headers(defaultJSON),
      method: String(method).toUpperCase()
    };
    let reqTtl = 0;
    let reqRetry = 0;
    let reqDelay = 0;
    let reqAttempts = 0;
    let reqNoBody = false;
    let reqForceCache = false;
    let downExt = null;
    let downName = null;
    let callbackFunc = null;
    const baseFetch = (input) => {
      const abstractFetch = () => {
        const wrapperFetch = () => window.fetch(input, req).then(async (res) => {
          if (reqNoBody) {
            ac.abort();
            return new Response(null, {
              status: res.status,
              statusText: res.statusText,
              headers: new Headers(res.headers)
            });
          }
          if (!res.ok || !callbackFunc) {
            return res;
          }
          const contentLength = parseInt(res.headers.get("Content-Length") ?? 0);
          if (contentLength === 0) {
            return res;
          }
          const chunks = [];
          let receivedLength = 0;
          const reader = res.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }
            chunks.push(value);
            receivedLength += value.length;
            await callbackFunc(receivedLength, contentLength, window.structuredClone ? window.structuredClone(chunks) : chunks);
          }
          const contentType = res.headers.get("Content-Type") ?? "application/octet-stream";
          return new Response(new Blob(chunks, { type: contentType }), {
            status: res.status,
            statusText: res.statusText,
            headers: new Headers(res.headers)
          });
        });
        if (reqTtl === 0 || reqNoBody) {
          return wrapperFetch();
        }
        if (req.method !== HTTP_GET) {
          console.warn("Only method GET can be cached");
          return wrapperFetch();
        }
        const cw = cacheWrapper(cacheRequest);
        return cw.has(input).then((res) => {
          if (res) {
            return Promise.resolve(res);
          }
          return cw.del(input).then(wrapperFetch).then((r) => cw.set(input, r, reqForceCache, reqTtl));
        });
      };
      if (reqRetry === 0 || reqDelay === 0) {
        return abstractFetch();
      }
      const attempt = async () => {
        try {
          return await abstractFetch();
        } catch (error) {
          if (error.name === ERROR_ABORT) {
            throw error;
          }
          reqDelay *= 2;
          reqAttempts++;
          if (reqAttempts > reqRetry) {
            throw new Error(`Max retries reached: ${error}`);
          }
          console.warn(`Retrying fetch (${reqAttempts}/${reqRetry}): ${input.toString()}`);
          await new Promise((resolve) => window.setTimeout(resolve, reqDelay));
          return attempt();
        }
      };
      return attempt();
    };
    const baseDownload = (res) => {
      if (res.status !== HTTP_STATUS_OK) {
        return Promise.resolve(res);
      }
      const exist = document.querySelector("a[download]");
      if (exist) {
        document.body.removeChild(exist);
      }
      const filename = res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1];
      return res.clone().blob().then((b) => {
        const link = document.createElement("a");
        const href = window.URL.createObjectURL(b);
        link.href = href;
        link.download = filename ? filename : `${downName}.${downExt ? downExt : b.type.split("/")?.[1] ?? "bin"}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(href);
        return res;
      });
    };
    return {
      /**
       * @template T
       * @param {((data: any) => T)=} transform
       * @returns {Promise<{code: number, data: T, error: string[]|null}>}
       */
      send(transform = null) {
        if (downName) {
          Object.keys(defaultJSON).forEach((k) => req.headers.delete(k));
        }
        return baseFetch(new URL(path, document.body.getAttribute("data-url"))).then((res) => {
          if (downName && res.ok) {
            return baseDownload(res).then((r) => ({
              code: r.status,
              data: r,
              error: null
            }));
          }
          return res.json().then((json) => {
            if (json.error) {
              const msg = json.error.at(0);
              const isErrServer = res.status >= HTTP_STATUS_INTERNAL_SERVER_ERROR;
              throw new Error(isErrServer ? `ID: ${json.id}
\u{1F7E5} ${msg}` : `\u{1F7E8} ${msg}`);
            }
            if (transform) {
              json.data = transform(json.data);
            }
            return Object.assign(json, { code: res.status });
          });
        }).catch((err) => {
          if (err.name === ERROR_ABORT) {
            console.warn("Fetch aborted:", err);
            return err;
          }
          if (err.name === ERROR_TYPE) {
            err = new Error("\u{1F7E5} Network error or rate limit exceeded");
          }
          alert(err.message ?? String(err));
          throw err;
        });
      },
      /**
       * @param {number} [ttl=21600000]
       * @returns {ReturnType<typeof request>}
       */
      withCache(ttl = 1e3 * 60 * 60 * 6) {
        reqTtl = ttl;
        return this;
      },
      /**
       * @param {number} [ttl=21600000]
       * @returns {ReturnType<typeof request>}
       */
      withForceCache(ttl = 1e3 * 60 * 60 * 6) {
        reqForceCache = true;
        if (reqTtl === 0) {
          reqTtl = ttl;
        }
        return this;
      },
      /**
       * @returns {ReturnType<typeof request>}
       */
      withNoBody() {
        reqNoBody = true;
        return this;
      },
      /**
       * @param {number} [maxRetries=3]
       * @param {number} [delay=1000]
       * @returns {ReturnType<typeof request>}
       */
      withRetry(maxRetries = 3, delay = 1e3) {
        reqRetry = maxRetries;
        reqDelay = delay;
        return this;
      },
      /**
       * @param {Promise<void>|null} cancel
       * @returns {ReturnType<typeof request>}
       */
      withCancel(cancel) {
        if (cancel === null || cancel === void 0) {
          return this;
        }
        (async () => {
          await cancel;
          ac.abort();
        })();
        return this;
      },
      /**
       * @param {string} name 
       * @param {string|null} ext
       * @returns {ReturnType<typeof request>}
       */
      withDownload(name, ext = null) {
        downName = name;
        downExt = ext;
        return this;
      },
      /**
       * @param {function|null} [func=null]
       * @returns {ReturnType<typeof request>}
       */
      withProgressFunc(func = null) {
        callbackFunc = func;
        return this;
      },
      /**
       * @param {object|null} header 
       * @returns {Promise<Response>}
       */
      default(header = null) {
        req.headers = new Headers(header ?? {});
        return baseFetch(path).then((res) => downName ? baseDownload(res) : Promise.resolve(res));
      },
      /**
       * @param {string} token
       * @returns {ReturnType<typeof request>}
       */
      token(token) {
        if (token.split(".").length === 3) {
          req.headers.append("Authorization", "Bearer " + token);
          return this;
        }
        req.headers.append("x-access-key", token);
        return this;
      },
      /**
       * @param {object} body
       * @returns {ReturnType<typeof request>}
       */
      body(body) {
        if (req.method === HTTP_GET) {
          throw new Error("GET method does not support body");
        }
        req.body = JSON.stringify(body);
        return this;
      }
    };
  };

  // js/connection/cache.js
  var cache = (cacheName) => {
    const objectUrls = /* @__PURE__ */ new Map();
    const inFlightRequests = /* @__PURE__ */ new Map();
    const cw = cacheWrapper(cacheName);
    let ttl = 1e3 * 60 * 60 * 6;
    let forceCache = false;
    const set = (input, res) => {
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return cw.set(input, res, forceCache, ttl);
    };
    const has = (input) => cw.has(input);
    const del = (input) => cw.del(input);
    const get = (input, cancel = null) => {
      if (objectUrls.has(input)) {
        return Promise.resolve(objectUrls.get(input));
      }
      if (inFlightRequests.has(input)) {
        return inFlightRequests.get(input);
      }
      const fetchPut = () => request(HTTP_GET, input).withCancel(cancel).withRetry().default();
      const inflightPromise = has(input).then((res) => res ? Promise.resolve(res) : del(input).then(fetchPut).then((r) => set(input, r))).then((r) => r.blob()).then((b) => objectUrls.set(input, URL.createObjectURL(b))).then(() => objectUrls.get(input)).finally(() => inFlightRequests.delete(input));
      inFlightRequests.set(input, inflightPromise);
      return inflightPromise;
    };
    const run = (items, cancel = null) => {
      const uniq = /* @__PURE__ */ new Map();
      if (items.length === 0) {
        return Promise.resolve();
      }
      items.filter((val) => val !== null).forEach((val) => {
        const exist = uniq.get(val.url) ?? [];
        uniq.set(val.url, [...exist, [val.res, val?.rej]]);
      });
      return Promise.allSettled(Array.from(uniq).map(
        ([k, v]) => get(k, cancel).then((s) => {
          v.forEach((cb) => cb[0]?.(s));
          return s;
        }).catch((r) => {
          v.forEach((cb) => cb[1]?.(r));
          return r;
        })
      ));
    };
    const download = async (input, name) => {
      const reverse = new Map(Array.from(objectUrls.entries()).map(([k, v]) => [v, k]));
      if (!reverse.has(input)) {
        try {
          const checkUrl = new URL(input);
          if (!checkUrl.protocol.includes("blob")) {
            throw new Error("Is not blob");
          }
        } catch {
          input = await get(input);
        }
      }
      return request(HTTP_GET, input).withDownload(name).default();
    };
    return {
      run,
      del,
      has,
      set,
      get,
      open,
      download,
      /**
       * @param {number} v
       * @returns {ReturnType<typeof cache>} 
       */
      setTtl(v) {
        ttl = Number(v);
        return this;
      },
      /**
       * @returns {ReturnType<typeof cache>} 
       */
      withForceCache() {
        forceCache = true;
        return this;
      }
    };
  };

  // js/app/guest/video.js
  var video = /* @__PURE__ */ (() => {
    let c = null;
    const load = () => {
      const wrap = document.getElementById("video-love-stroy");
      if (!wrap || !wrap.hasAttribute("data-src")) {
        wrap?.remove();
        progress.complete("video", true);
        return Promise.resolve();
      }
      const src = wrap.getAttribute("data-src");
      if (!src) {
        progress.complete("video", true);
        return Promise.resolve();
      }
      const vid = document.createElement("video");
      vid.className = wrap.getAttribute("data-vid-class");
      vid.loop = true;
      vid.muted = true;
      vid.controls = false;
      vid.autoplay = false;
      vid.playsInline = true;
      vid.preload = "metadata";
      const observer = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting ? vid.play() : vid.pause()));
      const prepareVideo = (b) => {
        vid.preload = "auto";
        vid.controls = true;
        vid.disableRemotePlayback = true;
        vid.disablePictureInPicture = true;
        vid.controlsList = "noremoteplayback nodownload noplaybackrate";
        vid.src = URL.createObjectURL(b);
      };
      const fetchBasic = () => {
        const bar = document.getElementById("progress-bar-video-love-stroy");
        const inf = document.getElementById("progress-info-video-love-stroy");
        return request(HTTP_GET, src).withNoBody().default({ "Range": "bytes=0-1" }).then((res) => {
          if (res.status === HTTP_STATUS_OK) {
            vid.preload = "none";
            vid.src = util.escapeHtml(src);
            wrap.appendChild(vid);
            return Promise.resolve();
          }
          if (res.status !== HTTP_STATUS_PARTIAL_CONTENT) {
            throw new Error("failed to fetch video");
          }
          vid.addEventListener("error", () => progress.invalid("video"));
          const loaded = new Promise((r) => vid.addEventListener("loadedmetadata", r, { once: true }));
          vid.src = util.escapeHtml(src);
          wrap.appendChild(vid);
          return loaded;
        }).then(() => {
          vid.pause();
          vid.currentTime = 0;
          progress.complete("video");
          const height = vid.getBoundingClientRect().width * (vid.videoHeight / vid.videoWidth);
          vid.style.height = `${height}px`;
          wrap.style.height = `${height}px`;
          return request(HTTP_GET, src).withRetry().withProgressFunc((a, b) => {
            const result = Number(a / b * 100).toFixed(0) + "%";
            bar.style.width = result;
            inf.innerText = result;
          }).default();
        }).then((res) => res.clone().blob().then((b) => {
          const loaded = new Promise((r) => vid.addEventListener("loadedmetadata", r, { once: true }));
          prepareVideo(b);
          vid.load();
          return loaded.then(() => res);
        })).catch((err) => {
          bar.style.backgroundColor = "red";
          inf.innerText = `Error loading video`;
          console.error(err);
        });
      };
      return c.has(src).then((res) => {
        if (!res) {
          return c.del(src).then(fetchBasic).then((r) => c.set(src, r));
        }
        return res.blob().then((b) => {
          const loaded = new Promise((r) => vid.addEventListener("loadedmetadata", r, { once: true }));
          prepareVideo(b);
          wrap.appendChild(vid);
          return loaded.then(() => progress.complete("video"));
        });
      }).then(() => {
        observer.observe(vid);
        vid.style.removeProperty("height");
        wrap.style.removeProperty("height");
        document.getElementById("video-love-stroy-loading")?.remove();
      });
    };
    const init = () => {
      progress.add();
      c = cache("video").withForceCache();
      return {
        load
      };
    };
    return {
      init
    };
  })();

  // js/app/guest/image.js
  var image = /* @__PURE__ */ (() => {
    let images = null;
    let c = null;
    const urlCache = [];
    const loadedImage = (src) => new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = src;
    });
    const appendImage = (el, src) => loadedImage(src).then((img) => {
      el.width = img.naturalWidth;
      el.height = img.naturalHeight;
      el.classList.remove("opacity-0");
      el.src = img.src;
      img.remove();
      progress.complete("image");
    });
    const getByFetch = (el) => {
      urlCache.push({
        url: el.getAttribute("data-src"),
        res: (url) => appendImage(el, url),
        rej: (err) => {
          console.error(err);
          progress.invalid("image");
        }
      });
    };
    const getByDefault = (el) => {
      el.onerror = () => progress.invalid("image");
      el.onload = () => {
        el.width = el.naturalWidth;
        el.height = el.naturalHeight;
        progress.complete("image");
      };
      if (el.complete && el.naturalWidth !== 0 && el.naturalHeight !== 0) {
        progress.complete("image");
      } else if (el.complete) {
        progress.invalid("image");
      }
    };
    const hasDataSrc = () => Array.from(images).some((i) => i.hasAttribute("data-src"));
    const load = async () => {
      const imgs = Array.from(images);
      const runGroup = async (filter) => {
        urlCache.length = 0;
        imgs.filter(filter).forEach((el) => el.hasAttribute("data-src") ? getByFetch(el) : getByDefault(el));
        await c.run(urlCache, progress.getAbort());
      };
      await runGroup((el) => el.hasAttribute("fetchpriority"));
      await runGroup((el) => !el.hasAttribute("fetchpriority"));
    };
    const download = (blobUrl) => {
      c.download(blobUrl, `${window.location.hostname}_image_${Date.now()}`);
    };
    const init = () => {
      c = cache("image").withForceCache();
      images = document.querySelectorAll("img");
      images.forEach(progress.add);
      return {
        load,
        download,
        hasDataSrc
      };
    };
    return {
      init
    };
  })();

  // js/app/guest/audio.js
  var audio = /* @__PURE__ */ (() => {
    const statePlay = '<i class="fa-solid fa-circle-pause spin-button"></i>';
    const statePause = '<i class="fa-solid fa-circle-play"></i>';
    const load = async (playOnOpen = true) => {
      const url = document.body.getAttribute("data-audio");
      if (!url) {
        progress.complete("audio", true);
        return;
      }
      let audioEl = null;
      try {
        audioEl = new Audio(await cache("audio").withForceCache().get(url, progress.getAbort()));
        audioEl.loop = true;
        audioEl.muted = false;
        audioEl.autoplay = false;
        audioEl.controls = false;
        progress.complete("audio");
      } catch {
        progress.invalid("audio");
        return;
      }
      let isPlay = false;
      const music = document.getElementById("button-music");
      const play = async () => {
        if (!navigator.onLine || !music) {
          return;
        }
        music.disabled = true;
        try {
          await audioEl.play();
          isPlay = true;
          music.disabled = false;
          music.innerHTML = statePlay;
        } catch (err) {
          isPlay = false;
          util.notify(err).error();
        }
      };
      const pause = () => {
        isPlay = false;
        audioEl.pause();
        music.innerHTML = statePause;
      };
      document.addEventListener("undangan.open", () => {
        music.classList.remove("d-none");
        if (playOnOpen) {
          play();
        }
      });
      music.addEventListener("offline", pause);
      music.addEventListener("click", () => isPlay ? pause() : play());
    };
    const init = () => {
      progress.add();
      return {
        load
      };
    };
    return {
      init
    };
  })();

  // js/libs/bootstrap.js
  var bs = /* @__PURE__ */ (() => {
    const modal = (id) => {
      return window.bootstrap.Modal.getOrCreateInstance(document.getElementById(id));
    };
    const tab = (id) => {
      return window.bootstrap.Tab.getOrCreateInstance(document.getElementById(id));
    };
    return {
      tab,
      modal
    };
  })();

  // js/libs/loader.js
  var loadAOS = (c) => {
    const urlCss = "https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.css";
    const urlJs = "https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.js";
    const loadCss = () => c.get(urlCss).then((uri) => new Promise((res, rej) => {
      const link = document.createElement("link");
      link.onload = res;
      link.onerror = rej;
      link.rel = "stylesheet";
      link.href = uri;
      document.head.appendChild(link);
    }));
    const loadJs = () => c.get(urlJs).then((uri) => new Promise((res, rej) => {
      const sc = document.createElement("script");
      sc.onload = res;
      sc.onerror = rej;
      sc.src = uri;
      document.head.appendChild(sc);
    }));
    return Promise.all([loadCss(), loadJs()]).then(() => {
      if (typeof window.AOS === "undefined") {
        throw new Error("AOS library failed to load");
      }
      window.AOS.init();
    });
  };
  var loadConfetti = (c) => {
    const url = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.js";
    return c.get(url).then((uri) => new Promise((res, rej) => {
      const sc = document.createElement("script");
      sc.onerror = rej;
      sc.onload = () => {
        typeof window.confetti === "undefined" ? rej(new Error("Confetti library failed to load")) : res();
      };
      sc.src = uri;
      document.head.appendChild(sc);
    }));
  };
  var loadAdditionalFont = (c) => {
    const fonts = [
      { css: "https://fonts.googleapis.com/css2?family=Sacramento&display=swap", family: "Sacramento" },
      { css: "https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic&display=swap", family: "Noto Naskh Arabic" }
    ];
    const loadFont = ({ css, family }) => c.get(css).then((uri) => new Promise((res, rej) => {
      const link = document.createElement("link");
      link.onload = res;
      link.onerror = rej;
      link.rel = "stylesheet";
      link.href = uri;
      document.head.appendChild(link);
    })).then(() => document.fonts.load(`1em "${family}"`));
    return Promise.all(fonts.map(loadFont));
  };
  var loader = (opt = {}) => {
    const promises = [];
    const c = cache("libs").withForceCache();
    if (opt?.aos ?? true) {
      promises.push(loadAOS(c));
    }
    if (opt?.confetti ?? true) {
      promises.push(loadConfetti(c));
    }
    if (opt?.additionalFont ?? true) {
      promises.push(loadAdditionalFont(c));
    }
    return Promise.all(promises);
  };

  // js/common/storage.js
  var storage = (table) => {
    const get = (key = null) => {
      const data = JSON.parse(localStorage.getItem(table));
      return key ? data[String(key)] : data;
    };
    const set = (key, value) => {
      const data = get();
      data[String(key)] = value;
      localStorage.setItem(table, JSON.stringify(data));
    };
    const has = (key) => Object.keys(get()).includes(String(key));
    const unset = (key) => {
      if (!has(key)) {
        return;
      }
      const data = get();
      delete data[String(key)];
      localStorage.setItem(table, JSON.stringify(data));
    };
    const clear = () => localStorage.setItem(table, "{}");
    if (!localStorage.getItem(table)) {
      clear();
    }
    return {
      set,
      get,
      has,
      clear,
      unset
    };
  };

  // js/common/theme.js
  var theme = /* @__PURE__ */ (() => {
    const themeColors = {
      "#000000": "#ffffff",
      "#ffffff": "#000000",
      "#212529": "#f8f9fa",
      "#f8f9fa": "#212529"
    };
    const themeLight = ["#ffffff", "#f8f9fa"];
    const themeDark = ["#000000", "#212529"];
    let isAuto = false;
    let themes = null;
    let metaTheme = null;
    const setLight = () => themes.set("active", "light");
    const setDark = () => themes.set("active", "dark");
    const setMetaTheme = (listTheme) => {
      const now = metaTheme.getAttribute("content");
      metaTheme.setAttribute("content", listTheme.some((i) => i === now) ? themeColors[now] : now);
    };
    const onLight = () => {
      setLight();
      document.documentElement.setAttribute("data-bs-theme", "light");
      setMetaTheme(themeDark);
    };
    const onDark = () => {
      setDark();
      document.documentElement.setAttribute("data-bs-theme", "dark");
      setMetaTheme(themeLight);
    };
    const isDarkMode = (dark = null, light = null) => {
      const status = themes.get("active") === "dark";
      if (dark && light) {
        return status ? dark : light;
      }
      return status;
    };
    const change = () => isDarkMode() ? onLight() : onDark();
    const isAutoMode = () => isAuto;
    const spyTop = () => {
      const callback = (es) => es.filter((e) => e.isIntersecting).forEach((e) => {
        const themeColor = e.target.classList.contains("bg-white-black") ? isDarkMode(themeDark[0], themeLight[0]) : isDarkMode(themeDark[1], themeLight[1]);
        metaTheme.setAttribute("content", themeColor);
      });
      const observerTop = new IntersectionObserver(callback, { rootMargin: "0% 0% -95% 0%" });
      document.querySelectorAll("section").forEach((e) => observerTop.observe(e));
    };
    const init = () => {
      themes = storage("theme");
      metaTheme = document.querySelector('meta[name="theme-color"]');
      if (!themes.has("active")) {
        window.matchMedia("(prefers-color-scheme: dark)").matches ? setDark() : setLight();
      }
      switch (document.documentElement.getAttribute("data-bs-theme")) {
        case "dark":
          setDark();
          break;
        case "light":
          setLight();
          break;
        default:
          isAuto = true;
      }
      if (isDarkMode()) {
        onDark();
      } else {
        onLight();
      }
    };
    return {
      init,
      spyTop,
      change,
      isDarkMode,
      isAutoMode
    };
  })();

  // js/common/language.js
  var lang = /* @__PURE__ */ (() => {
    const countryMapping = {
      "id": "ID",
      "en": "US",
      "fr": "FR",
      "de": "DE",
      "es": "ES",
      "zh": "CN",
      "ja": "JP",
      "ko": "KR",
      "ar": "SA",
      "ru": "RU",
      "it": "IT",
      "nl": "NL",
      "pt": "PT",
      "tr": "TR",
      "th": "TH",
      "vi": "VN",
      "ms": "MY",
      "hi": "IN"
    };
    let country = null;
    let locale = null;
    let language = null;
    let mapping = null;
    return {
      /**
       * @param {string} l 
       * @param {string} val 
       * @returns {this}
       */
      on(l, val) {
        mapping.set(l, val);
        return this;
      },
      /**
       * @returns {string|undefined}
       */
      get() {
        const tmp = mapping.get(language);
        mapping.clear();
        return tmp;
      },
      /**
       * @returns {string|null}
       */
      getCountry() {
        return country;
      },
      /**
       * @returns {string|null}
       */
      getLocale() {
        return locale;
      },
      /**
       * @returns {string|null}
       */
      getLanguage() {
        return language;
      },
      /**
       * @param {string} l 
       * @returns {void}
       */
      setDefault(l) {
        let isFound = true;
        if (!countryMapping[l]) {
          isFound = false;
          console.warn("Language not found, please add manually in countryMapping");
        }
        country = isFound ? countryMapping[l] : "US";
        language = isFound ? l : "en";
        locale = `${language}_${country}`;
      },
      /**
       * @returns {void}
       */
      init() {
        mapping = /* @__PURE__ */ new Map();
        this.setDefault(navigator.language.split("-").shift());
      }
    };
  })();

  // js/connection/dto.js
  var dto = /* @__PURE__ */ (() => {
    const getCommentResponse = ({ uuid, own, name, presence, comment: comment2, created_at, is_admin, is_parent, gif_url, ip, user_agent, comments, like_count }) => {
      return {
        uuid,
        own,
        name,
        presence,
        comment: comment2,
        created_at,
        is_admin: is_admin ?? false,
        is_parent,
        gif_url,
        ip,
        user_agent,
        comments: comments?.map(getCommentResponse) ?? [],
        like_count: like_count ?? 0
      };
    };
    const getCommentsResponse = (data) => data.map(getCommentResponse);
    const getCommentsResponseV2 = (data) => {
      return {
        count: data.count,
        lists: getCommentsResponse(data.lists)
      };
    };
    const statusResponse = ({ status }) => {
      return {
        status
      };
    };
    const tokenResponse = ({ token }) => {
      return {
        token
      };
    };
    const uuidResponse = ({ uuid }) => {
      return {
        uuid
      };
    };
    const commentShowMore = (uuid, show = false) => {
      return {
        uuid,
        show
      };
    };
    const postCommentRequest = (id, name, presence, comment2, gif_id) => {
      return {
        id,
        name,
        presence,
        comment: comment2,
        gif_id
      };
    };
    const postSessionRequest = (email, password) => {
      return {
        email,
        password
      };
    };
    const updateCommentRequest = (presence, comment2, gif_id) => {
      return {
        presence,
        comment: comment2,
        gif_id
      };
    };
    return {
      uuidResponse,
      tokenResponse,
      statusResponse,
      getCommentResponse,
      getCommentsResponse,
      getCommentsResponseV2,
      commentShowMore,
      postCommentRequest,
      postSessionRequest,
      updateCommentRequest
    };
  })();

  // js/common/session.js
  var session = /* @__PURE__ */ (() => {
    let ses = null;
    const getToken = () => ses.get("token");
    const setToken = (token) => ses.set("token", token);
    const login = (body) => {
      return request(HTTP_POST, "/api/session").body(body).send(dto.tokenResponse).then((res) => {
        if (res.code === HTTP_STATUS_OK) {
          setToken(res.data.token);
        }
        return res.code === HTTP_STATUS_OK;
      });
    };
    const logout = () => ses.unset("token");
    const isAdmin = () => String(getToken() ?? ".").split(".").length === 3;
    const guest2 = (token) => {
      return request(HTTP_GET, "/api/v2/config").withCache(1e3 * 60 * 30).withForceCache().token(token).send().then((res) => {
        if (res.code !== HTTP_STATUS_OK) {
          throw new Error("failed to get config.");
        }
        const config = storage("config");
        for (const [k, v] of Object.entries(res.data)) {
          config.set(k, v);
        }
        setToken(token);
        return res;
      });
    };
    const decode = () => {
      if (!isAdmin()) {
        return null;
      }
      try {
        return JSON.parse(util.base64Decode(getToken().split(".")[1]));
      } catch {
        return null;
      }
    };
    const isValid = () => {
      if (!isAdmin()) {
        return false;
      }
      return (decode()?.exp ?? 0) > Date.now() / 1e3;
    };
    const init = () => {
      ses = storage("session");
    };
    return {
      init,
      guest: guest2,
      isValid,
      login,
      logout,
      decode,
      isAdmin,
      setToken,
      getToken
    };
  })();

  // js/common/offline.js
  var offline = /* @__PURE__ */ (() => {
    let alert2 = null;
    let online = true;
    const classes = [
      "input[data-offline-disabled]",
      "button[data-offline-disabled]",
      "select[data-offline-disabled]",
      "textarea[data-offline-disabled]"
    ];
    const isOnline = () => online;
    const setOffline = () => {
      const el = alert2.firstElementChild.firstElementChild;
      el.classList.remove("bg-success");
      el.classList.add("bg-danger");
      el.firstElementChild.innerHTML = '<i class="fa-solid fa-ban me-2"></i>Koneksi tidak tersedia';
    };
    const setOnline = () => {
      const el = alert2.firstElementChild.firstElementChild;
      el.classList.remove("bg-danger");
      el.classList.add("bg-success");
      el.firstElementChild.innerHTML = '<i class="fa-solid fa-cloud me-2"></i>Koneksi tersedia kembali';
    };
    const setDefaultState = async () => {
      if (!online) {
        return;
      }
      await util.changeOpacity(alert2, false);
      setOffline();
    };
    const changeState = () => {
      document.querySelectorAll(classes.join(", ")).forEach((e) => {
        e.dispatchEvent(new Event(isOnline() ? "online" : "offline"));
        e.setAttribute("data-offline-disabled", isOnline() ? "false" : "true");
        if (e.tagName === "BUTTON") {
          isOnline() ? e.classList.remove("disabled") : e.classList.add("disabled");
        } else {
          isOnline() ? e.removeAttribute("disabled") : e.setAttribute("disabled", "true");
        }
      });
    };
    const onOffline = () => {
      online = false;
      setOffline();
      util.changeOpacity(alert2, true);
      changeState();
    };
    const onOnline = () => {
      online = true;
      setOnline();
      util.timeOut(setDefaultState, 3e3);
      changeState();
    };
    const init = () => {
      window.addEventListener("online", onOnline);
      window.addEventListener("offline", onOffline);
      alert2 = document.createElement("div");
      alert2.classList.add("fixed-top", "pe-none");
      alert2.style.cssText = "opacity: 0; z-index: 1057;";
      alert2.innerHTML = `
        <div class="d-flex justify-content-center mx-auto">
            <div class="d-flex justify-content-center align-items-center rounded-pill my-2 bg-danger shadow">
                <small class="text-center py-1 px-2 mx-1 mt-1 mb-0 text-white" style="font-size: 0.8rem;"></small>
            </div>
        </div>`;
      document.body.insertBefore(alert2, document.body.lastChild);
    };
    return {
      init,
      isOnline
    };
  })();

  // js/app/components/gif.js
  var gif = /* @__PURE__ */ (() => {
    const gifDefault = "default";
    const breakPoint = {
      128: 2,
      256: 3,
      512: 4,
      768: 5
    };
    let c = null;
    let objectPool = null;
    let eventListeners = null;
    let config = null;
    const show = (uuid, lists, load = null) => {
      const ctx = objectPool.get(uuid);
      return lists.map((data) => {
        const { id, media_formats: { tinygif: { url } }, content_description: description } = data;
        if (ctx.pointer === -1) {
          ctx.pointer = 0;
        } else if (ctx.pointer === ctx.col - 1) {
          ctx.pointer = 0;
        } else {
          ctx.pointer++;
        }
        const el = ctx.lists.childNodes[ctx.pointer] ?? null;
        if (!el) {
          return null;
        }
        const res = (uri) => {
          el.insertAdjacentHTML("beforeend", `
                <figure class="hover-wrapper m-0 position-relative">
                    <button onclick="undangan.comment.gif.click(this, '${ctx.uuid}', '${id}', '${util.base64Encode(url)}')" class="btn hover-area position-absolute justify-content-center align-items-center top-0 end-0 bg-overlay-auto p-1 m-1 rounded-circle border shadow-sm z-1">
                        <i class="fa-solid fa-circle-check"></i>
                    </button>
                    <img src="${uri}" class="img-fluid" alt="${util.escapeHtml(description)}" style="width: 100%;">
                </figure>`);
          load?.step();
        };
        return {
          url,
          res
        };
      });
    };
    const get = (url) => c.get(url);
    const loading = (uuid) => {
      const ctx = objectPool.get(uuid);
      const list = ctx.lists;
      const load = document.getElementById(`gif-loading-${ctx.uuid}`);
      const prog = document.getElementById(`progress-bar-${ctx.uuid}`);
      const info = document.getElementById(`progress-info-${ctx.uuid}`);
      let total = 0;
      let loaded = 0;
      list.setAttribute("data-continue", "false");
      list.classList.replace("overflow-y-scroll", "overflow-y-hidden");
      const timeoutMs = 150;
      let isReleased = false;
      const timeoutId = setTimeout(() => {
        if (isReleased) {
          return;
        }
        info.innerText = `${loaded}/${total}`;
        if (!list.classList.contains("d-none")) {
          load.classList.replace("d-none", "d-flex");
        }
      }, timeoutMs);
      const release = () => {
        isReleased = true;
        clearTimeout(timeoutId);
        if (!list.classList.contains("d-none")) {
          load.classList.replace("d-flex", "d-none");
        }
        prog.style.width = "0%";
        info.innerText = `${loaded}/${total}`;
        list.setAttribute("data-continue", "true");
        list.classList.replace("overflow-y-hidden", "overflow-y-scroll");
      };
      const until = (num) => {
        total = num;
        info.innerText = `${loaded}/${total}`;
      };
      const step = () => {
        loaded += 1;
        info.innerText = `${loaded}/${total}`;
        prog.style.width = Math.min(loaded / total * 100, 100).toString() + "%";
      };
      return {
        release,
        until,
        step
      };
    };
    const render = (uuid, path, params) => {
      params = {
        media_filter: "tinygif",
        client_key: "undangan_app",
        key: config.get("tenor_key"),
        country: lang.getCountry(),
        locale: lang.getLocale(),
        ...params ?? {}
      };
      const param = Object.keys(params).filter((k) => params[k] !== null && params[k] !== void 0).map((k) => `${k}=${encodeURIComponent(params[k])}`).join("&");
      const load = loading(uuid);
      const ctx = objectPool.get(uuid);
      const reqCancel = new Promise((r) => {
        ctx.reqs.push(r);
      });
      ctx.last = request(HTTP_GET, `https://tenor.googleapis.com/v2${path}?${param}`).withCache().withRetry().withCancel(reqCancel).default(defaultJSON).then((r) => r.json()).then((j) => {
        if (j.error) {
          throw new Error(j.error.message);
        }
        if (j.results.length === 0) {
          return j;
        }
        ctx.next = j?.next;
        load.until(j.results.length);
        ctx.gifs.push(...j.results);
        return c.run(show(uuid, j.results, load), reqCancel);
      }).catch((err) => {
        if (err.name === ERROR_ABORT) {
          console.warn("Fetch abort:", err);
        } else {
          util.notify(err).error();
        }
      }).finally(() => load.release());
    };
    const template = (uuid) => {
      uuid = util.escapeHtml(uuid);
      return `
        <label for="gif-search-${uuid}" class="form-label my-1"><i class="fa-solid fa-photo-film me-2"></i>Gif</label>

        <div class="d-flex mb-3" id="gif-search-nav-${uuid}">
            <button class="btn btn-secondary btn-sm rounded-4 shadow-sm me-1 my-1" onclick="undangan.comment.gif.back(this, '${uuid}')" data-offline-disabled="false"><i class="fa-solid fa-arrow-left"></i></button>
            <input dir="auto" type="text" name="gif-search" id="gif-search-${uuid}" autocomplete="on" class="form-control shadow-sm rounded-4" placeholder="Search for a GIF on Tenor" data-offline-disabled="false">
        </div>

        <div class="position-relative">
            <div class="position-absolute d-flex flex-column justify-content-center align-items-center top-50 start-50 translate-middle w-100 h-100 bg-overlay-auto rounded-4 z-3" id="gif-loading-${uuid}">
                <div class="progress w-25" role="progressbar" style="height: 0.5rem;" aria-label="progress bar">
                    <div class="progress-bar" id="progress-bar-${uuid}" style="width: 0%"></div>
                </div>
                <small class="mt-1 text-theme-auto bg-theme-auto py-0 px-2 rounded-4" id="progress-info-${uuid}" style="font-size: 0.7rem;"></small>
            </div>
            <div id="gif-lists-${uuid}" class="d-flex rounded-4 p-0 overflow-y-scroll border" data-continue="true" style="height: 15rem;"></div>
        </div>

        <figure class="d-flex m-0 position-relative" id="gif-result-${uuid}">
            <button onclick="undangan.comment.gif.cancel('${uuid}')" id="gif-cancel-${uuid}" class="btn d-none position-absolute justify-content-center align-items-center top-0 end-0 bg-overlay-auto p-2 m-0 rounded-circle border shadow-sm z-1">
                <i class="fa-solid fa-circle-xmark"></i>
            </button>
        </figure>`;
    };
    const waitLastRequest = async (uuid) => {
      const ctx = objectPool.get(uuid);
      ctx.reqs.forEach((f) => f());
      ctx.reqs.length = 0;
      if (ctx.last) {
        await ctx.last;
        ctx.last = null;
      }
    };
    const bootUp = async (uuid) => {
      await waitLastRequest(uuid);
      const ctx = objectPool.get(uuid);
      const prevCol = ctx.col ?? 0;
      let last = 0;
      for (const [k, v] of Object.entries(breakPoint)) {
        last = v;
        if (ctx.lists.clientWidth >= parseInt(k)) {
          ctx.col = last;
        }
      }
      if (ctx.col === null) {
        ctx.col = last;
      }
      if (prevCol === ctx.col) {
        return;
      }
      ctx.pointer = -1;
      ctx.limit = ctx.col * 5;
      ctx.lists.innerHTML = '<div class="d-flex flex-column"></div>'.repeat(ctx.col);
      if (ctx.gifs.length === 0) {
        return;
      }
      try {
        await c.run(show(uuid, ctx.gifs));
      } catch {
        ctx.gifs.length = 0;
      }
      if (prevCol !== ctx.col) {
        ctx.lists.scroll({
          top: ctx.lists.scrollHeight,
          behavior: "instant"
        });
      }
      if (ctx.gifs.length === 0) {
        await bootUp(uuid);
      }
    };
    const scroll = async (uuid) => {
      const ctx = objectPool.get(uuid);
      if (ctx.lists.getAttribute("data-continue") !== "true") {
        return;
      }
      if (!ctx.next || ctx.next.length === 0) {
        return;
      }
      const isQuery = ctx.query && ctx.query.trim().length > 0;
      const params = { pos: ctx.next, limit: ctx.limit };
      if (isQuery) {
        params.q = ctx.query;
      }
      if (ctx.lists.scrollTop > (ctx.lists.scrollHeight - ctx.lists.clientHeight) * 0.8) {
        await bootUp(uuid);
        render(uuid, isQuery ? "/search" : "/featured", params);
      }
    };
    const search = async (uuid, q = null) => {
      const ctx = objectPool.get(uuid);
      ctx.query = q !== null ? q : ctx.query;
      if (!ctx.query || ctx.query.trim().length === 0) {
        ctx.query = null;
      }
      ctx.col = null;
      ctx.next = null;
      ctx.pointer = -1;
      ctx.gifs.length = 0;
      await bootUp(uuid);
      render(uuid, ctx.query === null ? "/featured" : "/search", { q: ctx.query, limit: ctx.limit });
    };
    const click = async (button, uuid, id, urlBase64) => {
      const btn = util.disableButton(button, util.loader.replace("me-1", "me-0"), true);
      const res = document.getElementById(`gif-result-${uuid}`);
      res.setAttribute("data-id", id);
      res.querySelector(`#gif-cancel-${uuid}`).classList.replace("d-none", "d-flex");
      res.insertAdjacentHTML("beforeend", `<img src="${await get(util.base64Decode(urlBase64))}" class="img-fluid mx-auto gif-image rounded-4" alt="selected-gif">`);
      btn.restore();
      objectPool.get(uuid).lists.classList.replace("d-flex", "d-none");
      document.getElementById(`gif-search-nav-${uuid}`).classList.replace("d-flex", "d-none");
    };
    const cancel = (uuid) => {
      const res = document.getElementById(`gif-result-${uuid}`);
      res.removeAttribute("data-id");
      res.querySelector(`#gif-cancel-${uuid}`).classList.replace("d-flex", "d-none");
      res.querySelector("img").remove();
      objectPool.get(uuid).lists.classList.replace("d-none", "d-flex");
      document.getElementById(`gif-search-nav-${uuid}`).classList.replace("d-none", "d-flex");
    };
    const remove = async (uuid = null) => {
      if (uuid) {
        if (objectPool.has(uuid)) {
          await waitLastRequest(uuid);
          eventListeners.delete(uuid);
          objectPool.delete(uuid);
        }
      } else {
        await Promise.allSettled(Array.from(objectPool.keys()).map((k) => waitLastRequest(k)));
        eventListeners.clear();
        objectPool.clear();
      }
    };
    const back = async (button, uuid) => {
      const btn = util.disableButton(button, util.loader.replace("me-1", "me-0"), true);
      await waitLastRequest(uuid);
      btn.restore();
      document.getElementById(`gif-form-${uuid}`).classList.toggle("d-none", true);
      document.getElementById(`comment-form-${uuid}`)?.classList.toggle("d-none", false);
    };
    const open2 = (uuid) => {
      if (!objectPool.has(uuid)) {
        util.safeInnerHTML(document.getElementById(`gif-form-${uuid}`), template(uuid));
        const lists = document.getElementById(`gif-lists-${uuid}`);
        objectPool.set(uuid, {
          uuid,
          lists,
          last: null,
          limit: null,
          query: null,
          next: null,
          col: null,
          pointer: -1,
          gifs: [],
          reqs: []
        });
        const deScroll = util.debounce(scroll, 150);
        lists.addEventListener("scroll", () => deScroll(uuid));
        const deSearch = util.debounce(search, 850);
        document.getElementById(`gif-search-${uuid}`).addEventListener("input", (e) => deSearch(uuid, e.target.value));
      }
      document.getElementById(`gif-form-${uuid}`).classList.toggle("d-none", false);
      document.getElementById(`comment-form-${uuid}`)?.classList.toggle("d-none", true);
      if (eventListeners.has(uuid)) {
        eventListeners.get(uuid)();
      }
      return search(uuid);
    };
    const isOpen = (uuid) => {
      const el = document.getElementById(`gif-form-${uuid}`);
      return el && !el.classList.contains("d-none");
    };
    const getResultId = (uuid) => document.getElementById(`gif-result-${uuid}`)?.getAttribute("data-id");
    const removeGifSearch = (uuid) => document.querySelector(`[for="gif-search-${uuid}"]`)?.remove();
    const removeButtonBack = (uuid) => document.querySelector(`[onclick="undangan.comment.gif.back(this, '${uuid}')"]`)?.remove();
    const onOpen = (uuid, callback) => eventListeners.set(uuid, callback);
    const buttonCancel = (uuid = null) => {
      const btnCancel = document.getElementById(`gif-cancel-${uuid ? uuid : gifDefault}`);
      return {
        show: () => btnCancel.classList.replace("d-none", "d-flex"),
        hide: () => btnCancel.classList.replace("d-flex", "d-none"),
        click: () => btnCancel.dispatchEvent(new Event("click"))
      };
    };
    const isActive = () => !!config.get("tenor_key");
    const showButton = () => {
      document.querySelector('[onclick="undangan.comment.gif.open(undangan.comment.gif.default)"]')?.classList.toggle("d-none", !config.get("tenor_key"));
    };
    const init = () => {
      c = cache("gif");
      objectPool = /* @__PURE__ */ new Map();
      eventListeners = /* @__PURE__ */ new Map();
      config = storage("config");
      document.addEventListener("undangan.session", showButton);
    };
    return {
      default: gifDefault,
      init,
      get,
      back,
      open: open2,
      cancel,
      click,
      remove,
      isOpen,
      onOpen,
      isActive,
      getResultId,
      buttonCancel,
      removeGifSearch,
      removeButtonBack
    };
  })();

  // js/app/components/card.js
  var card = /* @__PURE__ */ (() => {
    let owns = null;
    let likes = null;
    let config = null;
    let showHide = null;
    const maxCommentLength = 300;
    const renderLoading = () => {
      return `
        <div class="bg-theme-auto shadow p-3 mx-0 mt-0 mb-3 rounded-4">
            <div class="d-flex justify-content-between align-items-center placeholder-wave">
                <span class="placeholder bg-secondary col-5 rounded-3 my-1"></span>
                <span class="placeholder bg-secondary col-3 rounded-3 my-1"></span>
            </div>
            <hr class="my-1">
            <p class="placeholder-wave m-0">
                <span class="placeholder bg-secondary col-6 rounded-3"></span>
                <span class="placeholder bg-secondary col-5 rounded-3"></span>
                <span class="placeholder bg-secondary col-12 rounded-3 my-1"></span>
            </p>
        </div>`;
    };
    const renderLike = (c) => {
      return `
        <button style="font-size: 0.8rem;" onclick="undangan.comment.like.love(this)" data-uuid="${c.uuid}" class="btn btn-sm btn-outline-auto ms-auto rounded-3 p-0 shadow-sm d-flex justify-content-start align-items-center" data-offline-disabled="false">
            <span class="my-0 mx-1" data-count-like="${c.like_count}">${c.like_count}</span>
            <i class="me-1 ${likes.has(c.uuid) ? "fa-solid fa-heart text-danger" : "fa-regular fa-heart"}"></i>
        </button>`;
    };
    const renderAction = (c) => {
      let action = `<div class="d-flex justify-content-start align-items-center" data-button-action="${c.uuid}">`;
      if (config.get("can_reply") !== false) {
        action += `<button style="font-size: 0.8rem;" onclick="undangan.comment.reply('${c.uuid}')" class="btn btn-sm btn-outline-auto rounded-4 py-0 me-1 shadow-sm" data-offline-disabled="false">Reply</button>`;
      }
      if (session.isAdmin() && c.is_admin && (!c.gif_url || gif.isActive())) {
        action += `<button style="font-size: 0.8rem;" onclick="undangan.comment.edit(this, ${c.is_parent ? "true" : "false"})" data-uuid="${c.uuid}" class="btn btn-sm btn-outline-auto rounded-4 py-0 me-1 shadow-sm" data-own="${c.own}" data-offline-disabled="false">Edit</button>`;
      } else if (owns.has(c.uuid) && config.get("can_edit") !== false && (!c.gif_url || gif.isActive())) {
        action += `<button style="font-size: 0.8rem;" onclick="undangan.comment.edit(this, ${c.is_parent ? "true" : "false"})" data-uuid="${c.uuid}" class="btn btn-sm btn-outline-auto rounded-4 py-0 me-1 shadow-sm" data-offline-disabled="false">Edit</button>`;
      }
      if (session.isAdmin()) {
        action += `<button style="font-size: 0.8rem;" onclick="undangan.comment.remove(this)" data-uuid="${c.uuid}" class="btn btn-sm btn-outline-auto rounded-4 py-0 me-1 shadow-sm" data-own="${c.own}" data-offline-disabled="false">Delete</button>`;
      } else if (owns.has(c.uuid) && config.get("can_delete") !== false) {
        action += `<button style="font-size: 0.8rem;" onclick="undangan.comment.remove(this)" data-uuid="${c.uuid}" class="btn btn-sm btn-outline-auto rounded-4 py-0 me-1 shadow-sm" data-offline-disabled="false">Delete</button>`;
      }
      action += "</div>";
      return action;
    };
    const renderReadMore = (uuid, uuids) => {
      uuid = util.escapeHtml(uuid);
      const hasId = showHide.get("show").includes(uuid);
      return `<a class="text-theme-auto" style="font-size: 0.8rem;" onclick="undangan.comment.showOrHide(this)" data-uuid="${uuid}" data-uuids="${util.escapeHtml(uuids.join(","))}" data-show="${hasId ? "true" : "false"}" role="button" class="me-auto ms-1 py-0">${hasId ? "Hide replies" : `Show replies (${uuids.length})`}</a>`;
    };
    const renderButton = (c) => {
      return `
        <div class="d-flex justify-content-between align-items-center" id="button-${c.uuid}">
            ${renderAction(c)}
            ${c.comments.length > 0 ? renderReadMore(c.uuid, c.comments.map((i) => i.uuid)) : ""}
            ${renderLike(c)}
        </div>`;
    };
    const renderTracker = (c) => {
      if (!c.ip || !c.user_agent || c.is_admin) {
        return "";
      }
      return `
        <div class="mb-1 mt-3">
            <p class="text-theme-auto mb-1 mx-0 mt-0 p-0" style="font-size: 0.7rem;" id="ip-${c.uuid}"><i class="fa-solid fa-location-dot me-1"></i>${util.escapeHtml(c.ip)} <span class="mb-1 placeholder col-2 rounded-3"></span></p>
            <p class="text-theme-auto m-0 p-0" style="font-size: 0.7rem;"><i class="fa-solid fa-mobile-screen-button me-1"></i>${util.parseUserAgent(util.escapeHtml(c.user_agent))}</p>
        </div>`;
    };
    const renderHeader = (c) => {
      if (c.is_parent) {
        return `class="bg-theme-auto shadow p-3 mx-0 mt-0 mb-3 rounded-4"`;
      }
      return `class="${!showHide.get("hidden").find((i) => i.uuid === c.uuid)["show"] ? "d-none" : ""} overflow-x-auto mw-100 border-start bg-theme-auto py-2 ps-2 pe-0 my-2 ms-2 me-0"`;
    };
    const renderTitle = (c) => {
      if (c.is_admin) {
        return `<strong class="me-1">${util.escapeHtml(c.name)}</strong><i class="fa-solid fa-certificate text-primary"></i>`;
      }
      if (c.is_parent) {
        return `<strong class="me-1">${util.escapeHtml(c.name)}</strong><i id="badge-${c.uuid}" data-is-presence="${c.presence ? "true" : "false"}" class="fa-solid ${c.presence ? "fa-circle-check text-success" : "fa-circle-xmark text-danger"}"></i>`;
      }
      return `<strong>${util.escapeHtml(c.name)}</strong>`;
    };
    const renderBody = async (c) => {
      const head = `
        <div class="d-flex justify-content-between align-items-center">
            <p class="text-theme-auto text-truncate m-0 p-0" style="font-size: 0.95rem;">${renderTitle(c)}</p>
            <small class="text-theme-auto m-0 p-0" style="font-size: 0.75rem;">${c.created_at}</small>
        </div>
        <hr class="my-1">`;
      if (c.gif_url) {
        return head + `
            <div class="d-flex justify-content-center align-items-center my-2">
                <img src="${await gif.get(c.gif_url)}" id="img-gif-${c.uuid}" class="img-fluid mx-auto gif-image rounded-4" alt="selected-gif">
            </div>`;
      }
      const moreMaxLength = c.comment.length > maxCommentLength;
      const data = util.convertMarkdownToHTML(util.escapeHtml(moreMaxLength ? c.comment.slice(0, maxCommentLength) + "..." : c.comment));
      return head + `
        <p dir="auto" class="text-theme-auto my-1 mx-0 p-0" style="white-space: pre-wrap !important; font-size: 0.95rem;" data-comment="${util.base64Encode(c.comment)}" id="content-${c.uuid}">${data}</p>
        ${moreMaxLength ? `<p class="d-block mb-2 mt-0 mx-0 p-0"><a class="text-theme-auto" role="button" style="font-size: 0.85rem;" data-show="false" onclick="undangan.comment.showMore(this, '${c.uuid}')">Selengkapnya</a></p>` : ""}`;
    };
    const renderContent = async (c) => {
      const body = await renderBody(c);
      const resData = await Promise.all(c.comments.map((cmt) => renderContent(cmt)));
      return `
        <div ${renderHeader(c)} id="${c.uuid}" style="overflow-wrap: break-word !important;">
            <div id="body-content-${c.uuid}" data-tapTime="0" data-liked="false" tabindex="0">${body}</div>
            ${renderTracker(c)}
            ${renderButton(c)}
            <div id="reply-content-${c.uuid}">${resData.join("")}</div>
        </div>`;
    };
    const renderContentMany = (cs) => Promise.all(cs.map((i) => renderContent(i))).then((r) => r.join(""));
    const renderContentSingle = (cs) => renderContent(cs);
    const renderReply = (id) => {
      id = util.escapeHtml(id);
      const inner = document.createElement("div");
      inner.classList.add("my-2");
      inner.id = `inner-${id}`;
      const template = `
        <p class="my-1 mx-0 p-0" style="font-size: 0.95rem;"><i class="fa-solid fa-reply me-2"></i>Reply</p>
        <div class="d-block mb-2" id="comment-form-${id}">
            <div class="position-relative">
                ${!gif.isActive() ? "" : `<button class="btn btn-secondary btn-sm rounded-4 shadow-sm me-1 my-1 position-absolute bottom-0 end-0" onclick="undangan.comment.gif.open('${id}')" aria-label="button gif" data-offline-disabled="false"><i class="fa-solid fa-photo-film"></i></button>`}
                <textarea dir="auto" class="form-control shadow-sm rounded-4 mb-2" id="form-inner-${id}" minlength="1" maxlength="1000" placeholder="Type reply comment" rows="3" data-offline-disabled="false"></textarea>
            </div>
        </div>
        <div class="d-none mb-2" id="gif-form-${id}"></div>
        <div class="d-flex justify-content-end align-items-center mb-0">
            <button style="font-size: 0.8rem;" onclick="undangan.comment.cancel(this, '${id}')" class="btn btn-sm btn-outline-auto rounded-4 py-0 me-1" data-offline-disabled="false">Cancel</button>
            <button style="font-size: 0.8rem;" onclick="undangan.comment.send(this)" data-uuid="${id}" class="btn btn-sm btn-outline-auto rounded-4 py-0" data-offline-disabled="false">Send</button>
        </div>`;
      return util.safeInnerHTML(inner, template);
    };
    const renderEdit = (id, presence, is_parent, is_gif) => {
      id = util.escapeHtml(id);
      const inner = document.createElement("div");
      inner.classList.add("my-2");
      inner.id = `inner-${id}`;
      const template = `
        <p class="my-1 mx-0 p-0" style="font-size: 0.95rem;"><i class="fa-solid fa-pen me-2"></i>Edit</p>
        ${!is_parent ? "" : `
        <select class="form-select shadow-sm mb-2 rounded-4" id="form-inner-presence-${id}" data-offline-disabled="false">
            <option value="1" ${presence ? "selected" : ""}>&#9989; Datang</option>
            <option value="2" ${presence ? "" : "selected"}>&#10060; Berhalangan</option>
        </select>`}
        ${!is_gif ? `<textarea dir="auto" class="form-control shadow-sm rounded-4 mb-2" id="form-inner-${id}" minlength="1" maxlength="1000" placeholder="Type update comment" rows="3" data-offline-disabled="false"></textarea>    
        ` : `${!gif.isActive() ? "" : `<div class="d-none mb-2" id="gif-form-${id}"></div>`}`}
        <div class="d-flex justify-content-end align-items-center mb-0">
            <button style="font-size: 0.8rem;" onclick="undangan.comment.cancel(this, '${id}')" class="btn btn-sm btn-outline-auto rounded-4 py-0 me-1" data-offline-disabled="false">Cancel</button>
            <button style="font-size: 0.8rem;" onclick="undangan.comment.update(this)" data-uuid="${id}" class="btn btn-sm btn-outline-auto rounded-4 py-0" data-offline-disabled="false">Update</button>
        </div>`;
      return util.safeInnerHTML(inner, template);
    };
    const init = () => {
      owns = storage("owns");
      likes = storage("likes");
      config = storage("config");
      showHide = storage("comment");
    };
    return {
      init,
      renderEdit,
      renderReply,
      renderLoading,
      renderReadMore,
      renderContentMany,
      renderContentSingle,
      maxCommentLength
    };
  })();

  // js/libs/confetti.js
  var zIndex = 1057;
  var heartShape = () => {
    return window.confetti.shapeFromPath({
      path: "M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z",
      matrix: [0.03333333333333333, 0, 0, 0.03333333333333333, -5.566666666666666, -5.533333333333333]
    });
  };
  var basicAnimation = () => {
    if (window.confetti) {
      window.confetti({
        origin: { y: 1 },
        zIndex
      });
    }
  };
  var openAnimation = (until = 15) => {
    if (!window.confetti) {
      return;
    }
    const duration = until * 1e3;
    const animationEnd = Date.now() + duration;
    const heart = heartShape();
    const colors = ["#FFC0CB", "#FF1493", "#C71585"];
    const randomInRange = (min, max) => {
      return Math.random() * (max - min) + min;
    };
    const frame = () => {
      const timeLeft = animationEnd - Date.now();
      colors.forEach((color) => {
        window.confetti({
          particleCount: 1,
          startVelocity: 0,
          ticks: Math.max(50, 75 * (timeLeft / duration)),
          origin: {
            x: Math.random(),
            y: Math.abs(Math.random() - timeLeft / duration)
          },
          zIndex,
          colors: [color],
          shapes: [heart],
          drift: randomInRange(-0.5, 0.5),
          gravity: randomInRange(0.5, 1),
          scalar: randomInRange(0.5, 1)
        });
      });
      if (timeLeft > 0) {
        requestAnimationFrame(frame);
      }
    };
    requestAnimationFrame(frame);
  };
  var tapTapAnimation = (div, duration = 50) => {
    if (!window.confetti) {
      return;
    }
    const end = Date.now() + duration;
    const domRec = div.getBoundingClientRect();
    const yPosition = Math.max(0.3, Math.min(1, domRec.top / window.innerHeight + 0.2));
    const heart = heartShape();
    const colors = ["#FF69B4", "#FF1493"];
    const frame = () => {
      colors.forEach((color) => {
        window.confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          shapes: [heart],
          origin: { x: domRec.left / window.innerWidth, y: yPosition },
          zIndex,
          colors: [color]
        });
        window.confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          shapes: [heart],
          origin: { x: domRec.right / window.innerWidth, y: yPosition },
          zIndex,
          colors: [color]
        });
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    requestAnimationFrame(frame);
  };

  // js/app/components/like.js
  var like = /* @__PURE__ */ (() => {
    let likes = null;
    let listeners = null;
    const love = async (button) => {
      const info = button.firstElementChild;
      const heart = button.lastElementChild;
      const id = button.getAttribute("data-uuid");
      const count = parseInt(info.getAttribute("data-count-like"));
      button.disabled = true;
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
      if (likes.has(id)) {
        await request(HTTP_PATCH, "/api/comment/" + likes.get(id)).token(session.getToken()).send(dto.statusResponse).then((res) => {
          if (res.data.status) {
            likes.unset(id);
            heart.classList.remove("fa-solid", "text-danger");
            heart.classList.add("fa-regular");
            info.setAttribute("data-count-like", String(count - 1));
          }
        }).finally(() => {
          info.innerText = info.getAttribute("data-count-like");
          button.disabled = false;
        });
      } else {
        await request(HTTP_POST, "/api/comment/" + id).token(session.getToken()).send(dto.uuidResponse).then((res) => {
          if (res.code === HTTP_STATUS_CREATED) {
            likes.set(id, res.data.uuid);
            heart.classList.remove("fa-regular");
            heart.classList.add("fa-solid", "text-danger");
            info.setAttribute("data-count-like", String(count + 1));
          }
        }).finally(() => {
          info.innerText = info.getAttribute("data-count-like");
          button.disabled = false;
        });
      }
    };
    const getButtonLike = (uuid) => {
      return document.querySelector(`button[onclick="undangan.comment.like.love(this)"][data-uuid="${uuid}"]`);
    };
    const tapTap = async (div) => {
      if (!navigator.onLine) {
        return;
      }
      const currentTime = Date.now();
      const tapLength = currentTime - parseInt(div.getAttribute("data-tapTime"));
      const uuid = div.id.replace("body-content-", "");
      const isTapTap = tapLength < 300 && tapLength > 0;
      const notLiked = !likes.has(uuid) && div.getAttribute("data-liked") !== "true";
      if (isTapTap && notLiked) {
        tapTapAnimation(div);
        div.setAttribute("data-liked", "true");
        await love(getButtonLike(uuid));
        div.setAttribute("data-liked", "false");
      }
      div.setAttribute("data-tapTime", String(currentTime));
    };
    const addListener = (uuid) => {
      const ac = new AbortController();
      const bodyLike = document.getElementById(`body-content-${uuid}`);
      bodyLike.addEventListener("touchend", () => tapTap(bodyLike), { signal: ac.signal });
      listeners.set(uuid, ac);
    };
    const removeListener = (uuid) => {
      const ac = listeners.get(uuid);
      if (ac) {
        ac.abort();
        listeners.delete(uuid);
      }
    };
    const init = () => {
      listeners = /* @__PURE__ */ new Map();
      likes = storage("likes");
    };
    return {
      init,
      love,
      getButtonLike,
      addListener,
      removeListener
    };
  })();

  // js/app/components/pagination.js
  var pagination = /* @__PURE__ */ (() => {
    let perPage = 10;
    let pageNow = 0;
    let totalData = 0;
    let page = null;
    let liPrev = null;
    let liNext = null;
    let paginate = null;
    let comment2 = null;
    const setPer = (num) => {
      perPage = Number(num);
    };
    const getPer = () => perPage;
    const getNext = () => pageNow;
    const geTotal = () => totalData;
    const disablePrevious = () => !liPrev.classList.contains("disabled") ? liPrev.classList.add("disabled") : null;
    const enablePrevious = () => liPrev.classList.contains("disabled") ? liPrev.classList.remove("disabled") : null;
    const disableNext = () => !liNext.classList.contains("disabled") ? liNext.classList.add("disabled") : null;
    const enableNext = () => liNext.classList.contains("disabled") ? liNext.classList.remove("disabled") : null;
    const buttonAction = (button) => {
      disableNext();
      disablePrevious();
      const btn = util.disableButton(button, util.loader.replace("ms-0 me-1", "mx-1"), true);
      const process = () => {
        comment2.addEventListener("undangan.comment.done", () => btn.restore(), { once: true });
        comment2.addEventListener("undangan.comment.result", () => comment2.scrollIntoView(), { once: true });
        comment2.dispatchEvent(new Event("undangan.comment.show"));
      };
      const next = () => {
        pageNow += perPage;
        button.innerHTML = "Next" + button.innerHTML;
        process();
      };
      const prev = () => {
        pageNow -= perPage;
        button.innerHTML = button.innerHTML + "Prev";
        process();
      };
      return {
        next,
        prev
      };
    };
    const reset = () => {
      if (pageNow === 0) {
        return false;
      }
      pageNow = 0;
      disableNext();
      disablePrevious();
      return true;
    };
    const setTotal = (len) => {
      totalData = Number(len);
      if (totalData <= perPage && pageNow === 0) {
        paginate.classList.add("d-none");
        return;
      }
      const current = pageNow / perPage + 1;
      const total = Math.ceil(totalData / perPage);
      page.innerText = `${current} / ${total}`;
      if (pageNow > 0) {
        enablePrevious();
      }
      if (current >= total) {
        disableNext();
        return;
      }
      enableNext();
      if (paginate.classList.contains("d-none")) {
        paginate.classList.remove("d-none");
      }
    };
    const init = () => {
      paginate = document.getElementById("pagination");
      paginate.innerHTML = `
        <ul class="pagination mb-2 shadow-sm rounded-4">
            <li class="page-item disabled" id="previous">
                <button class="page-link rounded-start-4" onclick="undangan.comment.pagination.previous(this)" data-offline-disabled="false">
                    <i class="fa-solid fa-circle-left me-1"></i>Prev
                </button>
            </li>
            <li class="page-item disabled">
                <span class="page-link text-theme-auto" id="page"></span>
            </li>
            <li class="page-item" id="next">
                <button class="page-link rounded-end-4" onclick="undangan.comment.pagination.next(this)" data-offline-disabled="false">
                    Next<i class="fa-solid fa-circle-right ms-1"></i>
                </button>
            </li>
        </ul>`;
      comment2 = document.getElementById("comments");
      page = document.getElementById("page");
      liPrev = document.getElementById("previous");
      liNext = document.getElementById("next");
    };
    return {
      init,
      setPer,
      getPer,
      getNext,
      reset,
      setTotal,
      geTotal,
      previous: (btn) => buttonAction(btn).prev(),
      next: (btn) => buttonAction(btn).next()
    };
  })();

  // js/app/components/comment.js
  var LS_KEY = "wedding_comments_local";
  var IS_ADMIN = false;
  var getLocalComments = () => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY)) || [];
    } catch {
      return [];
    }
  };
  var saveLocalComments = (data) => {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  };
  var comment = /* @__PURE__ */ (() => {
    let commentsEl = null;
    const onNullComment = () => {
      const desc = lang.on("id", "Belum ada komentar. Jadilah yang pertama \u2728").on("en", "No comments yet. Be the first \u2728").get();
      return `
            <div class="text-center p-4 mb-3 bg-theme-auto rounded-4 shadow">
                <p class="fw-bold m-0">${desc}</p>
            </div>
        `;
    };
    const render = (data) => {
      if (!data.length) {
        commentsEl.innerHTML = onNullComment();
        return;
      }
      commentsEl.innerHTML = "";
      [...data].reverse().forEach((item) => {
        commentsEl.insertAdjacentHTML("beforeend", `
                <div class="bg-theme-auto p-3 mb-3 rounded-4 shadow-sm" data-id="${item.id}">
                    <strong>${util.escapeHtml(item.name)}</strong>
                    <p class="mt-2 mb-1">${util.escapeHtml(item.comment)}</p>
                    <small class="text-muted">${item.time}</small>

                    <div class="mt-2 d-flex gap-2">
                        <button class="btn btn-sm btn-outline-secondary"
                            onclick="undangan.comment.edit('${item.id}')">
                            Edit
                        </button>

                        ${IS_ADMIN ? `
                        <button class="btn btn-sm btn-outline-primary"
                            onclick="undangan.comment.reply('${item.id}')">
                            Reply
                        </button>` : ""}
                    </div>

                    ${item.reply ? `
                        <div class="mt-3 ms-3 p-2 rounded-3 bg-light border">
                            <strong>Admin</strong>
                            <p class="mb-1">${util.escapeHtml(item.reply.text)}</p>
                            <small class="text-muted">${item.reply.time}</small>
                        </div>
                    ` : ""}
                </div>
            `);
      });
    };
    const show = async () => {
      commentsEl.setAttribute("data-loading", "false");
      render(getLocalComments());
      return Promise.resolve();
    };
    const send = async () => {
      const nameInput = document.getElementById("form-name");
      const commentInput = document.getElementById("form-comment");
      if (!nameInput?.value.trim()) {
        util.notify("Name cannot be empty").warning();
        return;
      }
      if (!commentInput?.value.trim()) {
        util.notify("Comment cannot be empty").warning();
        return;
      }
      const data = getLocalComments();
      data.push({
        id: crypto.randomUUID(),
        name: util.escapeHtml(nameInput.value.trim()),
        comment: util.escapeHtml(commentInput.value.trim()),
        time: (/* @__PURE__ */ new Date()).toLocaleString("id-ID"),
        reply: null
      });
      saveLocalComments(data);
      storage("information").unset("name");
      commentInput.value = "";
      nameInput.value = "";
      render(data);
    };
    const edit = (id) => {
      const data = getLocalComments();
      const item = data.find((i) => i.id === id);
      if (!item) return;
      const updated = prompt("Edit komentar:", item.comment);
      if (!updated || !updated.trim()) return;
      item.comment = util.escapeHtml(updated.trim());
      saveLocalComments(data);
      render(data);
    };
    const reply = (id) => {
      if (!IS_ADMIN) return;
      const data = getLocalComments();
      const item = data.find((i) => i.id === id);
      if (!item) return;
      const text = prompt("Balasan admin:");
      if (!text || !text.trim()) return;
      item.reply = {
        text: util.escapeHtml(text.trim()),
        time: (/* @__PURE__ */ new Date()).toLocaleString("id-ID")
      };
      saveLocalComments(data);
      render(data);
    };
    const init = () => {
      gif?.init?.();
      like?.init?.();
      card?.init?.();
      pagination?.init?.();
      commentsEl = document.getElementById("comments");
      if (!commentsEl) return;
      commentsEl.addEventListener("undangan.comment.show", show);
    };
    return {
      init,
      show,
      send,
      edit,
      reply
    };
  })();

  // js/app/guest/guest.js
  var guest = /* @__PURE__ */ (() => {
    let information = null;
    let config = null;
    const countDownDate = () => {
      const count = new Date(document.body.getAttribute("data-time").replace(" ", "T")).getTime();
      const pad = (num) => num < 10 ? `0${num}` : `${num}`;
      const day = document.getElementById("day");
      const hour = document.getElementById("hour");
      const minute = document.getElementById("minute");
      const second = document.getElementById("second");
      const updateCountdown = () => {
        const distance = Math.abs(count - Date.now());
        day.textContent = pad(Math.floor(distance / (1e3 * 60 * 60 * 24)));
        hour.textContent = pad(Math.floor(distance % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60)));
        minute.textContent = pad(Math.floor(distance % (1e3 * 60 * 60) / (1e3 * 60)));
        second.textContent = pad(Math.floor(distance % (1e3 * 60) / 1e3));
        util.timeOut(updateCountdown, 1e3 - Date.now() % 1e3);
      };
      util.timeOut(updateCountdown);
    };
    const showGuestName = () => {
      const raw = window.location.search.split("to=");
      let name = null;
      if (raw.length > 1 && raw[1].length >= 1) {
        name = window.decodeURIComponent(raw[1]);
      }
      if (name) {
        const guestName = document.getElementById("guest-name");
        const div = document.createElement("div");
        div.classList.add("m-2");
        const template = `<small class="mt-0 mb-1 mx-0 p-0">${util.escapeHtml(guestName?.getAttribute("data-message"))}</small><p class="m-0 p-0" style="font-size: 1.25rem">${util.escapeHtml(name)}</p>`;
        util.safeInnerHTML(div, template);
        guestName?.appendChild(div);
      }
      const form = document.getElementById("form-name");
      if (form) {
        form.value = information.get("name") ?? name;
      }
    };
    const slide = async () => {
      const interval = 6e3;
      const slides = document.querySelectorAll(".slide-desktop");
      if (!slides || slides.length === 0) {
        return;
      }
      const desktopEl = document.getElementById("root")?.querySelector(".d-sm-block");
      if (!desktopEl) {
        return;
      }
      desktopEl.dispatchEvent(new Event("undangan.slide.stop"));
      if (window.getComputedStyle(desktopEl).display === "none") {
        return;
      }
      if (slides.length === 1) {
        await util.changeOpacity(slides[0], true);
        return;
      }
      let index = 0;
      for (const [i, s] of slides.entries()) {
        if (i === index) {
          s.classList.add("slide-desktop-active");
          await util.changeOpacity(s, true);
          break;
        }
      }
      let run = true;
      const nextSlide = async () => {
        await util.changeOpacity(slides[index], false);
        slides[index].classList.remove("slide-desktop-active");
        index = (index + 1) % slides.length;
        if (run) {
          slides[index].classList.add("slide-desktop-active");
          await util.changeOpacity(slides[index], true);
        }
        return run;
      };
      desktopEl.addEventListener("undangan.slide.stop", () => {
        run = false;
      });
      const loop = async () => {
        if (await nextSlide()) {
          util.timeOut(loop, interval);
        }
      };
      util.timeOut(loop, interval);
    };
    const open2 = (button) => {
      button.disabled = true;
      document.body.scrollIntoView({ behavior: "instant" });
      document.getElementById("root").classList.remove("opacity-0");
      if (theme.isAutoMode()) {
        document.getElementById("button-theme").classList.remove("d-none");
      }
      slide();
      theme.spyTop();
      basicAnimation();
      util.timeOut(openAnimation, 1500);
      document.dispatchEvent(new Event("undangan.open"));
      util.changeOpacity(document.getElementById("welcome"), false).then((el) => el.remove());
    };
    const modal = (img) => {
      document.getElementById("button-modal-click").setAttribute("href", img.src);
      document.getElementById("button-modal-download").setAttribute("data-src", img.src);
      const i = document.getElementById("show-modal-image");
      i.src = img.src;
      i.width = img.width;
      i.height = img.height;
      bs.modal("modal-image").show();
    };
    const modalImageClick = () => {
      document.getElementById("show-modal-image").addEventListener("click", (e) => {
        const abs = e.currentTarget.parentNode.querySelector(".position-absolute");
        abs.classList.contains("d-none") ? abs.classList.replace("d-none", "d-flex") : abs.classList.replace("d-flex", "d-none");
      });
    };
    const showStory = (div) => {
      if (navigator.vibrate) {
        navigator.vibrate(500);
      }
      tapTapAnimation(div, 100);
      util.changeOpacity(div, false).then((e) => e.remove());
    };
    const closeInformation = () => information.set("info", true);
    const normalizeArabicFont = () => {
      document.querySelectorAll(".font-arabic").forEach((el) => {
        el.innerHTML = String(el.innerHTML).normalize("NFC");
      });
    };
    const animateSvg = () => {
      document.querySelectorAll("svg").forEach((el) => {
        if (el.hasAttribute("data-class")) {
          util.timeOut(() => el.classList.add(el.getAttribute("data-class")), parseInt(el.getAttribute("data-time")));
        }
      });
    };
    const buildGoogleCalendar = () => {
      const formatDate = (d) => (/* @__PURE__ */ new Date(d.replace(" ", "T") + ":00Z")).toISOString().replace(/[-:]/g, "").split(".").shift();
      const url = new URL("https://calendar.google.com/calendar/render");
      const data = new URLSearchParams({
        action: "TEMPLATE",
        text: "The Wedding of Ardi and putri",
        dates: `${formatDate("2023-03-15 10:00")}/${formatDate("2023-03-15 11:00")}`,
        details: "Tanpa mengurangi rasa hormat, kami mengundang Anda untuk berkenan menghadiri acara pernikahan kami. Terima kasih atas perhatian dan doa restu Anda, yang menjadi kebahagiaan serta kehormatan besar bagi kami.",
        location: "RT 01 RW 01, Desa Slambur, Kec. Geger, Kab. Madiun, Jawa Timur.",
        ctz: config.get("tz")
      });
      url.search = data.toString();
      document.querySelector("#home button")?.addEventListener("click", () => window.open(url, "_blank"));
    };
    const loaderLibs = () => {
      progress.add();
      const load = (opt) => {
        loader(opt).then(() => progress.complete("libs")).catch(() => progress.invalid("libs"));
      };
      return {
        load
      };
    };
    const booting = async () => {
      animateSvg();
      countDownDate();
      showGuestName();
      modalImageClick();
      normalizeArabicFont();
      buildGoogleCalendar();
      if (information.has("presence")) {
        document.getElementById("form-presence").value = information.get("presence") ? "1" : "2";
      }
      if (information.get("info")) {
        document.getElementById("information")?.remove();
      }
      await util.changeOpacity(document.getElementById("welcome"), true);
      await util.changeOpacity(document.getElementById("loading"), false).then((el) => el.remove());
    };
    const pageLoaded = () => {
      lang.init();
      offline.init();
      comment.init();
      progress.init();
      config = storage("config");
      information = storage("information");
      const vid = video.init();
      const img = image.init();
      const aud = audio.init();
      const lib = loaderLibs();
      const token = document.body.getAttribute("data-key");
      const params = new URLSearchParams(window.location.search);
      window.addEventListener("resize", util.debounce(slide));
      document.addEventListener("undangan.progress.done", () => booting());
      document.addEventListener("hide.bs.modal", () => document.activeElement?.blur());
      document.getElementById("button-modal-download").addEventListener("click", (e) => {
        img.download(e.currentTarget.getAttribute("data-src"));
      });
      if (!token || token.length <= 0) {
        document.getElementById("comment")?.remove();
        document.querySelector('a.nav-link[href="#comment"]')?.closest("li.nav-item")?.remove();
        vid.load();
        img.load();
        aud.load();
        lib.load({ confetti: document.body.getAttribute("data-confetti") === "true" });
      }
      if (token && token.length > 0) {
        progress.add();
        progress.add();
        if (!img.hasDataSrc()) {
          img.load();
        }
        session.guest(params.get("k") ?? token).then(({ data }) => {
          document.dispatchEvent(new Event("undangan.session"));
          progress.complete("config");
          if (img.hasDataSrc()) {
            img.load();
          }
          vid.load();
          aud.load();
          lib.load({ confetti: data.is_confetti_animation });
          comment.show().then(() => progress.complete("comment")).catch(() => progress.invalid("comment"));
        }).catch(() => progress.invalid("config"));
      }
    };
    const init = () => {
      theme.init();
      session.init();
      if (session.isAdmin()) {
        storage("user").clear();
        storage("owns").clear();
        storage("likes").clear();
        storage("session").clear();
        storage("comment").clear();
      }
      window.addEventListener("load", () => {
        pool.init(pageLoaded, [
          "image",
          "video",
          "audio",
          "libs",
          "gif"
        ]);
      });
      return {
        util,
        theme,
        comment,
        guest: {
          open: open2,
          modal,
          showStory,
          closeInformation
        }
      };
    };
    return {
      init
    };
  })();

  // js/guest.js
  ((w) => {
    w.undangan = guest.init();
  })(window);
})();
