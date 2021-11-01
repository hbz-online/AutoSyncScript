/* 
打开活动页面自动注入console，需要手动执行脚本

[rewrite_local]

https?://plogin.m.jd.com/cgi-bin/mm/domlogin url script-response-header https://raw.githubusercontent.com/id77/QuantumultX/master/Script/unHttpOnly.js
https://jdqd.jd.com/poststring url reject

# web切换jd cookie

^https?:\/\/.{0,27}\.?jd\.com\/?((?!\.(js|json|jpg|gif|png|webp|dpg|flv|mp3|mp4)).)*$ url script-response-body https://raw.githubusercontent.com/id77/QuantumultX/master/Script/jd_hd.js
^https?:\/\/.*\.jingxi\.com\/?((?!\.(js|json|jpg|gif|png|flv|mp3|mp4)).)*$ url script-response-body https://raw.githubusercontent.com/id77/QuantumultX/master/Script/jd_hd.js

# 京东活动
https?://.*\.isvjcloud\.com url script-response-body https://raw.githubusercontent.com/id77/QuantumultX/master/Script/jd_hd.js
https?://.*\.moxigame\.cn url script-response-body https://raw.githubusercontent.com/id77/QuantumultX/master/Script/jd_hd.js

[mitm]
hostname = *.jd.com, *.*.jd.com, *.moxigame.cn
*/
const $ = new Env('京东助手');

let html = $response.body;

if (!html.includes('<head>')) {
  $.done();
}

try {
  let cookies = [];
  $.getData('CookieJD') && cookies.push($.getData('CookieJD'));
  $.getData('CookieJD2') && cookies.push($.getData('CookieJD2'));

  const extraCookies = JSON.parse($.getData('CookiesJD') || '[]').map(
    (item) => item.cookie
  );
  cookies = Array.from(new Set([...cookies, ...extraCookies]));

  let url = $request.url.replace(/&un_area=[\d_]+/g, '');
  let sku;
  let arr = [];

  if (url.includes('sku=')) {
    arr = url.match(/sku=(\d+)/);
  }
  if (url.includes('/product/')) {
    arr = url.match(/\/.*\/(\d+)\.html/);
  }

  sku = arr.length != 0 ? arr[1] : '';

  let cookieListDom = `<ul class="cks">`;

  const isJD = url.includes('jd.com') || url.includes('jingxi.com');
  if (isJD) {
    for (let index = 0; index < cookies.length; index++) {
      const cookie = cookies[index];
      const pin = decodeURI(cookie.match(/pt_pin=(.+?);/)[1]);
      cookieListDom += `<li data-cookie-index="${
        index + 1
      }" id="_${pin}" class="_cookieDom" onclick="_changeCookie('${cookie}')">${pin}</li>`;
    }
  }
  cookieListDom += `</ul>`;

  let tools =
    `
    <div id="_btns">
      <div id="cks" class="_btn hide"></div>
      <div id="nextCookie" class="_btn hide"></div>
      <div id="Foxok" class="_btn hide" onclick="window.location.href='Foxok://url?${url}'">
        <img src="https://is1-ssl.mzstatic.com/image/thumb/Purple124/v4/78/2f/51/782f518e-1db9-e819-f6fe-72d6ac851f13/source/60x60bb.jpg" />
      </div>` +
    (!sku ? `` : `<button id="smzdm" class="_btn hide"></button>`) +
    `</div>`;

  html =
    html.replace(/(<\/html>)/, '') +
    `
  <style>
    html, body {
      -webkit-user-select: auto !important;
      user-select: auto !important;
    }
    #alook {
      bottom: 17.8571em;
    }
    #Foxok {
      bottom: 17.5em;
    }
    #smzdm {
      bottom: 20.2143em;
      font-size: inherit;
      background: url(https://avatarimg.smzdm.com/default/8282685611/5d146cda8a63a-small.jpg) #FFF no-repeat 0.3571em/1.64em;
    }
    #cks {
      top: 12.7571em;
      background: url(https://iconfont.alicdn.com/t/1520995303822.jpg@200h_200w.jpg) #FFF no-repeat 0.3571em/1.64em;
    }
    #nextCookie {
      top: 15.7571em;
      background: url(data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48cGF0aCBmaWxsPSIjMjQ4NmZmIiBkPSJNMTQ1LjY1OSw2OC45NDljLTUuMTAxLTUuMjA4LTEzLjM3Mi01LjIwOC0xOC40NzMsMEw5OS40NzksOTcuMjMzIEw3MS43NzIsNjguOTQ5Yy01LjEtNS4yMDgtMTMuMzcxLTUuMjA4LTE4LjQ3MywwYy01LjA5OSw1LjIwOC01LjA5OSwxMy42NDgsMCwxOC44NTdsNDYuMTgsNDcuMTRsNDYuMTgxLTQ3LjE0IEMxNTAuNzU5LDgyLjU5OCwxNTAuNzU5LDc0LjE1NywxNDUuNjU5LDY4Ljk0OXoiLz48L3N2Zz4NCg==) #FFF no-repeat 0.291em/1.74em;
    }
    ._btn {
      position: fixed;
      right: 0;
      z-index: 99999;
      box-sizing: content-box;
      width: 1.14em;
      height: 2.1429em;
      padding: 0 1.4286em 0 0;
      border: 1px solid rgba(255,255,255,0.8);
      background: #FFF;
      border-radius: 50px 0 0 50px;
      background-size: 80%;
    }
    ._btn img {
      box-sizing: content-box;
      width: 2.1429em;
      height: 2.1429em;
      border: 1px solid rgba(255,255,255,0.8);
      background: #FFF;
      border-radius: 50px 0 0 50px;
    }
    .cks {
      padding: 1.1429em;
    }
    .cks li {
      margin-bottom: 0.7143em;
      border: 0.0714em solid #ccc;
      padding: 0.3571em;
    }
    #_btns { 
      font-size: 14px;
    }
    ._btn.hide {
      display: none !important;
    }
  </style>
  ${tools}
  <script src="https://cdnjs.cloudflare.com/ajax/libs/js-cookie/2.2.1/js.cookie.min.js"></script>
  <script>

    const _currentPin = Cookies.get('pt_pin');
    const needHideSwitch = localStorage.getItem('vConsole_switch_hide') === 'Y';

    const cookies = ${JSON.stringify(cookies)};

    // ck同步最新
    if(_currentPin) {
      for (const ck of cookies) {
        if(ck.includes(encodeURI(_currentPin))) {
          _setCookie(ck);
          console.log('已同步 cookie');
        }
      }
    }

    const _host = window.location.host;

    function _clearData() {
      sessionStorage.clear();
      localStorage.clear();
      let _key;
      const _cookieKeys = Object.keys(Cookies.get());
      for (let n = 0; n < _cookieKeys.length; n++) {
        _key = _cookieKeys[n];
      }
      
      const _hostBlocks = _host.split('.');
      let _block = _hostBlocks[0];
      for (let b = 1; b < _hostBlocks.length; b++) {
        _block = _hostBlocks[b] + "." + _block;
        Cookies.remove(_key, { path: '/', domain: "." + _block });
      }

      // Cookies.remove(_key, { path: '/', domain: '.jd.com' });
    }
    
    function _setCookie(cookie) {

      const other = { 
        path: '/',
        expires: 30,
        SameSite: 'Strict',
        // secure: true
      };

      const domains = [
        ".jd.com",
        ".jingxi.com"
      ];

      for (let l = 0; l < domains.length; l++) {

        other.domain = domains[l];
        
        Cookies.set('pt_key', cookie.match(/pt_key=(.+?);/)[1], other);
        Cookies.set('pt_pin', decodeURI(cookie.match(/pt_pin=(.+?);/)[1]), other);

      }

    }

    function _changeCookie(cookie){
      _clearData();
      _setCookie(cookie);
      window.location.reload();
    }

    function _nextCookie() {
      const cookieDomList = document.querySelectorAll("._cookieDom"); 
      const cookieDom = document.querySelector("#_" + _currentPin);

      const index = [].indexOf.call(cookieDomList, cookieDom);

      _changeCookie(cookies[index + 1]);
    }

    const _btn = document.querySelector('#smzdm');
    if (_btn) {
      _btn.addEventListener('click',() => {
        const input = document.createElement('input');
        input.setAttribute('readonly', 'readonly');
        input.setAttribute('value', 'https://item.jd.com/${sku}.html');
        document.body.appendChild(input);
        input.setSelectionRange(0, input.value.length);
        if (document.execCommand('copy')) {
          document.execCommand('copy');
          console.log('复制成功');
        }
        document.body.removeChild(input);
        window.location.href='smzdm://';
      })
    }

    const _script = document.createElement('script');
    _script.src = "https://cdnjs.cloudflare.com/ajax/libs/vConsole/3.8.1/vconsole.min.js";
    // _script.doneState = { loaded: true, complete: true};
    _script.onload = function() {
        __init();
        console.log("初始化成功");
    };
    
    
    document.getElementsByTagName('head')[0].appendChild(_script);

    function _changeBtns() {
      const $btns = vConsole.$.all('._btn');

      if (vConsole.$.hasClass($btns[0], 'hide')) {
        // do something
        vConsole.$.removeClass($btns, 'hide');
      } else {
        vConsole.$.addClass($btns, 'hide'); 
      }
    }

    function _changeMitmUI() {
      const vcSwitch = document.querySelector('.vc-switch');
      if (vcSwitch.style.display == 'none') {
        vConsole.showSwitch();
        localStorage.setItem('vConsole_switch_hide', 'N')
      } else {
        vConsole.hideSwitch();
        localStorage.setItem('vConsole_switch_hide', 'Y')
      }

      _changeBtns();
    }
    
    function __init () {
      
      window.vConsole = new VConsole();
      if (needHideSwitch) {
        vConsole.hideSwitch(); 
      }

      vConsole.setSwitchPosition(10, 50);
      const JDCKPlugin = new VConsole.VConsolePlugin("jd_cookie", "京东CK");

      JDCKPlugin.on("renderTab", function (callback) {
        const html = \`
                      ${cookieListDom}
                    \`;
                    
        callback(html);
      });
      
      JDCKPlugin.on("addTool", function (callback) {
       
        const toolList = [];
        toolList.push({
          name: "领券页面",
          global: false,
          onClick: function (event) {
            vConsole.showTab("default");
             
             // 脚本2
             eval(function(){function c(){let d=document.getElementById(\"loadJs\"),e=document.createElement(\"script\");d&&document.getElementsByTagName(\"head\")[0].removeChild(d),e.id=\"loadJs\",e.type=\"text/javascript\",e.src=\"https://krapnik.cn/tools/JDCouponAssistant/bundle.js\",document.getElementsByTagName(\"head\")[0].appendChild(e)}c()}())

          },
        },{
          name: "显隐图标",
          global: false,
          onClick: function (event) {
            vConsole.hide();
            _changeBtns();
          },
        });

        document.addEventListener('dblclick', function (e) {
          _changeMitmUI();
        });

        const cksDom = document.querySelector('#cks');
        cksDom.addEventListener('click', (e) => {
          vConsole.show();
          vConsole.showTab("jd_cookie");
          e.stopPropagation();
        })
        cksDom.addEventListener('dblclick', function (e) {
          _changeCookie(cookies[0]);
          e.stopPropagation();
        });

        const nextCookieDom = document.querySelector('#nextCookie');
        nextCookieDom.addEventListener('click', (e) => {
          _nextCookie();
          e.stopPropagation();
        })
        
        callback(toolList);
      });
      
      JDCKPlugin.on('ready', function() {

        if (!needHideSwitch) {
          const $btns = vConsole.$.all('._btn');
          vConsole.$.removeClass($btns, 'hide');
        }

        if (_currentPin && document.querySelector("#_" + _currentPin)) {
          setTimeout(() => {
            document.querySelector("#_" + _currentPin).style.background = '#238636';
          });
        }	 
        
        const fontSize = document.querySelector('#__vconsole').style.fontSize;

        if(fontSize) {
          document.querySelector('#_btns').style.fontSize = fontSize;
        }
        
      });
      
      if (${isJD}) {
        vConsole.addPlugin(JDCKPlugin);
      }

      setTimeout(() => {
        console.log(window.location.href);
      },3000);
      
    }
  </script>
</html>
`;
} catch (error) {
  console.log(error);
}

$.done({ body: html });

// https://github.com/chavyleung/scripts/blob/master/Env.js
// prettier-ignore
function Env(name, opts) {
  class Http {
    constructor(env) {
      this.env = env;
    }

    send(opts, method = 'GET') {
      opts = typeof opts === 'string' ? { url: opts } : opts;
      let sender = this.get;
      if (method === 'POST') {
        sender = this.post;
      }
      return new Promise((resolve, reject) => {
        sender.call(this, opts, (err, resp, body) => {
          if (err) reject(err);
          else resolve(resp);
        });
      });
    }

    get(opts) {
      return this.send.call(this.env, opts);
    }

    post(opts) {
      return this.send.call(this.env, opts, 'POST');
    }
  }

  return new (class {
    constructor(name, opts) {
      this.name = name;
      this.http = new Http(this);
      this.data = null;
      this.dataFile = 'box.dat';
      this.logs = [];
      this.isMute = false;
      this.isNeedRewrite = false;
      this.logSeparator = '\n';
      this.startTime = new Date().getTime();
      Object.assign(this, opts);
      this.log('', `🔔${this.name}, 开始!`);
    }

    isNode() {
      return 'undefined' !== typeof module && !!module.exports;
    }

    isQuanX() {
      return 'undefined' !== typeof $task;
    }

    isSurge() {
      return 'undefined' !== typeof $httpClient && 'undefined' === typeof $loon;
    }

    isLoon() {
      return 'undefined' !== typeof $loon;
    }

    isShadowrocket() {
      return 'undefined' !== typeof $rocket;
    }

    toObj(str, defaultValue = null) {
      try {
        return JSON.parse(str);
      } catch {
        return defaultValue;
      }
    }

    toStr(obj, defaultValue = null) {
      try {
        return JSON.stringify(obj);
      } catch {
        return defaultValue;
      }
    }

    getJson(key, defaultValue) {
      let json = defaultValue;
      const val = this.getData(key);
      if (val) {
        try {
          json = JSON.parse(this.getData(key));
        } catch {}
      }
      return json;
    }

    setJson(val, key) {
      try {
        return this.setData(JSON.stringify(val), key);
      } catch {
        return false;
      }
    }

    getScript(url) {
      return new Promise((resolve) => {
        this.get({ url }, (err, resp, body) => resolve(body));
      });
    }

    runScript(script, runOpts) {
      return new Promise((resolve) => {
        let httpApi = this.getData('@chavy_boxjs_userCfgs.httpApi');
        httpApi = httpApi ? httpApi.replace(/\n/g, '').trim() : httpApi;
        let httpApi_timeout = this.getData(
          '@chavy_boxjs_userCfgs.httpApi_timeout'
        );
        httpApi_timeout = httpApi_timeout ? httpApi_timeout * 1 : 20;
        httpApi_timeout =
          runOpts && runOpts.timeout ? runOpts.timeout : httpApi_timeout;
        const [key, addr] = httpApi.split('@');
        const opts = {
          url: `http://${addr}/v1/scripting/evaluate`,
          body: {
            script_text: script,
            mock_type: 'cron',
            timeout: httpApi_timeout,
          },
          headers: { 'X-Key': key, Accept: '*/*' },
        };
        this.post(opts, (err, resp, body) => resolve(body));
      }).catch((e) => this.logErr(e));
    }

    loadData() {
      if (this.isNode()) {
        this.fs = this.fs ? this.fs : require('fs');
        this.path = this.path ? this.path : require('path');
        const curDirDataFilePath = this.path.resolve(this.dataFile);
        const rootDirDataFilePath = this.path.resolve(
          process.cwd(),
          this.dataFile
        );
        const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath);
        const isRootDirDataFile =
          !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath);
        if (isCurDirDataFile || isRootDirDataFile) {
          const datPath = isCurDirDataFile
            ? curDirDataFilePath
            : rootDirDataFilePath;
          try {
            return JSON.parse(this.fs.readFileSync(datPath));
          } catch (e) {
            return {};
          }
        } else return {};
      } else return {};
    }

    writeData() {
      if (this.isNode()) {
        this.fs = this.fs ? this.fs : require('fs');
        this.path = this.path ? this.path : require('path');
        const curDirDataFilePath = this.path.resolve(this.dataFile);
        const rootDirDataFilePath = this.path.resolve(
          process.cwd(),
          this.dataFile
        );
        const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath);
        const isRootDirDataFile =
          !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath);
        const jsonData = JSON.stringify(this.data);
        if (isCurDirDataFile) {
          this.fs.writeFileSync(curDirDataFilePath, jsonData);
        } else if (isRootDirDataFile) {
          this.fs.writeFileSync(rootDirDataFilePath, jsonData);
        } else {
          this.fs.writeFileSync(curDirDataFilePath, jsonData);
        }
      }
    }

    lodash_get(source, path, defaultValue = undefined) {
      const paths = path.replace(/\[(\d+)\]/g, '.$1').split('.');
      let result = source;
      for (const p of paths) {
        result = Object(result)[p];
        if (result === undefined) {
          return defaultValue;
        }
      }
      return result;
    }

    lodash_set(obj, path, value) {
      if (Object(obj) !== obj) return obj;
      if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || [];
      path
        .slice(0, -1)
        .reduce(
          (a, c, i) =>
            Object(a[c]) === a[c]
              ? a[c]
              : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {}),
          obj
        )[path[path.length - 1]] = value;
      return obj;
    }

    getData(key) {
      let val = this.getVal(key);
      // 如果以 @
      if (/^@/.test(key)) {
        const [, objKey, paths] = /^@(.*?)\.(.*?)$/.exec(key);
        const objVal = objKey ? this.getVal(objKey) : '';
        if (objVal) {
          try {
            const objedVal = JSON.parse(objVal);
            val = objedVal ? this.lodash_get(objedVal, paths, '') : val;
          } catch (e) {
            val = '';
          }
        }
      }
      return val;
    }

    setData(val, key) {
      let isSuc = false;
      if (/^@/.test(key)) {
        const [, objKey, paths] = /^@(.*?)\.(.*?)$/.exec(key);
        const objdat = this.getVal(objKey);
        const objVal = objKey
          ? objdat === 'null'
            ? null
            : objdat || '{}'
          : '{}';
        try {
          const objedVal = JSON.parse(objVal);
          this.lodash_set(objedVal, paths, val);
          isSuc = this.setVal(JSON.stringify(objedVal), objKey);
        } catch (e) {
          const objedVal = {};
          this.lodash_set(objedVal, paths, val);
          isSuc = this.setVal(JSON.stringify(objedVal), objKey);
        }
      } else {
        isSuc = this.setVal(val, key);
      }
      return isSuc;
    }

    getVal(key) {
      if (this.isSurge() || this.isLoon()) {
        return $persistentStore.read(key);
      } else if (this.isQuanX()) {
        return $prefs.valueForKey(key);
      } else if (this.isNode()) {
        this.data = this.loadData();
        return this.data[key];
      } else {
        return (this.data && this.data[key]) || null;
      }
    }

    setVal(val, key) {
      if (this.isSurge() || this.isLoon()) {
        return $persistentStore.write(val, key);
      } else if (this.isQuanX()) {
        return $prefs.setValueForKey(val, key);
      } else if (this.isNode()) {
        this.data = this.loadData();
        this.data[key] = val;
        this.writeData();
        return true;
      } else {
        return (this.data && this.data[key]) || null;
      }
    }

    initGotEnv(opts) {
      this.got = this.got ? this.got : require('got');
      this.ckTough = this.ckTough ? this.ckTough : require('tough-cookie');
      this.ckJar = this.ckJar ? this.ckJar : new this.ckTough.CookieJar();
      if (opts) {
        opts.headers = opts.headers ? opts.headers : {};
        if (undefined === opts.headers.Cookie && undefined === opts.cookieJar) {
          opts.cookieJar = this.ckJar;
        }
      }
    }

    get(opts, callback = () => {}) {
      if (opts.headers) {
        delete opts.headers['Content-Type'];
        delete opts.headers['Content-Length'];
      }
      if (this.isSurge() || this.isLoon()) {
        if (this.isSurge() && this.isNeedRewrite) {
          opts.headers = opts.headers || {};
          Object.assign(opts.headers, { 'X-Surge-Skip-Scripting': false });
        }
        $httpClient.get(opts, (err, resp, body) => {
          if (!err && resp) {
            resp.body = body;
            resp.statusCode = resp.status;
          }
          callback(err, resp, body);
        });
      } else if (this.isQuanX()) {
        if (this.isNeedRewrite) {
          opts.opts = opts.opts || {};
          Object.assign(opts.opts, { hints: false });
        }
        $task.fetch(opts).then(
          (resp) => {
            const { statusCode: status, statusCode, headers, body } = resp;
            callback(null, { status, statusCode, headers, body }, body);
          },
          (err) => callback(err)
        );
      } else if (this.isNode()) {
        this.initGotEnv(opts);
        this.got(opts)
          .on('redirect', (resp, nextOpts) => {
            try {
              if (resp.headers['set-cookie']) {
                const ck = resp.headers['set-cookie']
                  .map(this.ckTough.Cookie.parse)
                  .toString();
                if (ck) {
                  this.ckJar.setCookieSync(ck, null);
                }
                nextOpts.cookieJar = this.ckJar;
              }
            } catch (e) {
              this.logErr(e);
            }
            // this.ckJar.setCookieSync(resp.headers['set-cookie'].map(Cookie.parse).toString())
          })
          .then(
            (resp) => {
              const { statusCode: status, statusCode, headers, body } = resp;
              callback(null, { status, statusCode, headers, body }, body);
            },
            (err) => {
              const { message: error, response: resp } = err;
              callback(error, resp, resp && resp.body);
            }
          );
      }
    }

    post(opts, callback = () => {}) {
      const method = opts.method ? opts.method.toLocaleLowerCase() : 'post';
      // 如果指定了请求体, 但没指定`Content-Type`, 则自动生成
      if (opts.body && opts.headers && !opts.headers['Content-Type']) {
        opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
      if (opts.headers) delete opts.headers['Content-Length'];
      if (this.isSurge() || this.isLoon()) {
        if (this.isSurge() && this.isNeedRewrite) {
          opts.headers = opts.headers || {};
          Object.assign(opts.headers, { 'X-Surge-Skip-Scripting': false });
        }
        $httpClient[method](opts, (err, resp, body) => {
          if (!err && resp) {
            resp.body = body;
            resp.statusCode = resp.status;
          }
          callback(err, resp, body);
        });
      } else if (this.isQuanX()) {
        opts.method = method;
        if (this.isNeedRewrite) {
          opts.opts = opts.opts || {};
          Object.assign(opts.opts, { hints: false });
        }
        $task.fetch(opts).then(
          (resp) => {
            const { statusCode: status, statusCode, headers, body } = resp;
            callback(null, { status, statusCode, headers, body }, body);
          },
          (err) => callback(err)
        );
      } else if (this.isNode()) {
        this.initGotEnv(opts);
        const { url, ..._opts } = opts;
        this.got[method](url, _opts).then(
          (resp) => {
            const { statusCode: status, statusCode, headers, body } = resp;
            callback(null, { status, statusCode, headers, body }, body);
          },
          (err) => {
            const { message: error, response: resp } = err;
            callback(error, resp, resp && resp.body);
          }
        );
      }
    }
    /**
     *
     * 示例:$.time('yyyy-MM-dd qq HH:mm:ss.S')
     *    :$.time('yyyyMMddHHmmssS')
     *    y:年 M:月 d:日 q:季 H:时 m:分 s:秒 S:毫秒
     *    其中y可选0-4位占位符、S可选0-1位占位符，其余可选0-2位占位符
     * @param {string} fmt 格式化参数
     * @param {number} 可选: 根据指定时间戳返回格式化日期
     *
     */
    time(fmt, ts = null) {
      const date = ts ? new Date(ts) : new Date();
      let o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'H+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        'q+': Math.floor((date.getMonth() + 3) / 3),
        S: date.getMilliseconds(),
      };
      if (/(y+)/.test(fmt))
        fmt = fmt.replace(
          RegExp.$1,
          (date.getFullYear() + '').substr(4 - RegExp.$1.length)
        );
      for (let k in o)
        if (new RegExp('(' + k + ')').test(fmt))
          fmt = fmt.replace(
            RegExp.$1,
            RegExp.$1.length == 1
              ? o[k]
              : ('00' + o[k]).substr(('' + o[k]).length)
          );
      return fmt;
    }

    /**
     * 系统通知
     *
     * > 通知参数: 同时支持 QuanX 和 Loon 两种格式, EnvJs根据运行环境自动转换, Surge 环境不支持多媒体通知
     *
     * 示例:
     * $.msg(title, subt, desc, 'twitter://')
     * $.msg(title, subt, desc, { 'open-url': 'twitter://', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
     * $.msg(title, subt, desc, { 'open-url': 'https://bing.com', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
     *
     * @param {*} title 标题
     * @param {*} subt 副标题
     * @param {*} desc 通知详情
     * @param {*} opts 通知参数
     *
     */
    msg(title = name, subt = '', desc = '', opts) {
      const toEnvOpts = (rawOpts) => {
        if (!rawOpts) return rawOpts;
        if (typeof rawOpts === 'string') {
          if (this.isLoon()) return rawOpts;
          else if (this.isQuanX()) return { 'open-url': rawOpts };
          else if (this.isSurge()) return { url: rawOpts };
          else return undefined;
        } else if (typeof rawOpts === 'object') {
          if (this.isLoon()) {
            let openUrl = rawOpts.openUrl || rawOpts.url || rawOpts['open-url'];
            let mediaUrl = rawOpts.mediaUrl || rawOpts['media-url'];
            return { openUrl, mediaUrl };
          } else if (this.isQuanX()) {
            let openUrl = rawOpts['open-url'] || rawOpts.url || rawOpts.openUrl;
            let mediaUrl = rawOpts['media-url'] || rawOpts.mediaUrl;
            let updatePasteboard =
              rawOpts['update-pasteboard'] || rawOpts.updatePasteboard;
            return {
              'open-url': openUrl,
              'media-url': mediaUrl,
              'update-pasteboard': updatePasteboard,
            };
          } else if (this.isSurge()) {
            let openUrl = rawOpts.url || rawOpts.openUrl || rawOpts['open-url'];
            return { url: openUrl };
          }
        } else {
          return undefined;
        }
      };
      if (!this.isMute) {
        if (this.isSurge() || this.isLoon()) {
          $notification.post(title, subt, desc, toEnvOpts(opts));
        } else if (this.isQuanX()) {
          $notify(title, subt, desc, toEnvOpts(opts));
        }
      }
      if (!this.isMuteLog) {
        let logs = ['', '==============📣系统通知📣=============='];
        logs.push(title);
        subt ? logs.push(subt) : '';
        desc ? logs.push(desc) : '';
        console.log(logs.join('\n'));
        this.logs = this.logs.concat(logs);
      }
    }

    log(...logs) {
      if (logs.length > 0) {
        this.logs = [...this.logs, ...logs];
      }
      console.log(logs.join(this.logSeparator));
    }

    logErr(err, msg) {
      const isPrintSack = !this.isSurge() && !this.isQuanX() && !this.isLoon();
      if (!isPrintSack) {
        this.log('', `❗️${this.name}, 错误!`, err);
      } else {
        this.log('', `❗️${this.name}, 错误!`, err.stack);
      }
    }

    wait(time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }

    done(val = {}) {
      const endTime = new Date().getTime();
      const costTime = (endTime - this.startTime) / 1000;
      this.log('', `🔔${this.name}, 结束! 🕛 ${costTime} 秒`);
      this.log();
      if (this.isSurge() || this.isQuanX() || this.isLoon()) {
        $done(val);
      }
    }
  })(name, opts);
}
