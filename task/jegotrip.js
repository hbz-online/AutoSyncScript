/*
无忧行签到脚本

更新时间: 2020.12.01 15:00
脚本兼容: QuantumultX, Surge4, Loon

获取Cookie说明：「 分为五部分: AccountID | UserID | Mobile | Token | TaskID 」
1.打开无忧行App, 通知成功写入「 AccountID | UserID | Mobile | Token 」.
2.依次点击"我的" 👉 "任务中心". 通知成功写入「 TaskID 」.
3.如上述步骤全部完成, 则可以使用此签到脚本.
获取Cookie后, 请将Cookie脚本禁用并移除主机名，以免产生不必要的MITM.
脚本将在每天上午9:00执行, 您可以修改执行时间。

**********************
QuantumultX 脚本配置:
**********************
[task_local]
# 无忧行签到
0 9 * * * https://ooxx.be/js/jegotrip.js, tag=无忧行, img-url=https://ooxx.be/js/icon/jegotrip.png, enabled=true

[rewrite_local]
# 获取无忧行Cookie
https?:\/\/app.*\.jegotrip\.com\.cn\/.*getUser\? url script-response-body https://ooxx.be/js/jegotrip.js
https?:\/\/task\.jegotrip\.com\.cn\:8080\/app\/tasks\?userid url script-response-body https://ooxx.be/js/jegotrip.js

[mitm] 
hostname= app*.jegotrip.com.cn, task.jegotrip.com.cn

**********************
Surge 4.2.0+ 脚本配置:
**********************
[Script]
无忧行签到 = type=cron,cronexp=0 9 * * *,script-path=https://ooxx.be/js/jegotrip.js

获取无忧行Cookie1 = type=http-response,pattern=https?:\/\/app.*\.jegotrip\.com\.cn\/.*getUser\?,script-path=https://ooxx.be/js/jegotrip.js, requires-body=true
获取无忧行Cookie2 = type=http-response,pattern=https?:\/\/task\.jegotrip\.com\.cn\:8080\/app\/tasks\?userid,script-path=https://ooxx.be/js/jegotrip.js, requires-body=true

[MITM] 
hostname= app*.jegotrip.com.cn, task.jegotrip.com.cn

************************
Loon 2.1.0+ 脚本配置:
************************

[Script]
# 无忧行签到
cron "0 9 * * *" script-path=https://ooxx.be/js/jegotrip.js

# 获取无忧行Cookie
http-response https?:\/\/app.*\.jegotrip\.com\.cn\/.*getUser\? script-path=https://ooxx.be/js/jegotrip.js, requires-body=true
http-response https?:\/\/task\.jegotrip\.com\.cn\:8080\/app\/tasks\?userid script-path=https://ooxx.be/js/jegotrip.js, requires-body=true

[Mitm] 
hostname= app*.jegotrip.com.cn, task.jegotrip.com.cn

*/
const $ = API('JegoTrip', true);
const appName = `无忧行`;
const accountid = $.read('accountid');
const userid = $.read('userid');
const mobile = $.read('mobile');
const token = $.read('token');
const taskid = $.read('taskid');
const headers = {
  'Accept-Encoding': 'gzip, deflate',
  Origin: 'http://task.jegotrip.com.cn:8080',
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json;charset=utf-8',
  Connection: 'close',
  Host: 'task.jegotrip.com.cn:8080',
  'Content-Length': '89',
  'User-Agent':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 source/jegotrip',
  'Accept-Language': 'en-us',
  Referer: 'http://task.jegotrip.com.cn:8080/task/index.html',
};

if (typeof $request != 'undefined') {
  GetCookie();
} else if (accountid && mobile && userid && taskid && token) {
  Status();
} else {
  $.notify(appName, '签到失败：请先获取Cookie⚠️', '');
}

function Status() {
  delete headers[('Origin', 'Content-Type', 'Content-Length')];
  const url = `http://task.jegotrip.com.cn:8080/app/tasks?userid=${userid}`;
  const request = {
    url: url,
    headers: headers,
  };

  $.http
    .get(request)
    .then((resp) => {
      const data = resp.body;
      let res = JSON.parse(data);

      let list = res.rtn.tasks['日常任务'];
      let status = list[0].triggerAction;
      console.log(status);
      let coins = 0;
      if (status.indexOf('已签到') >= 0) {
        coins = list[0].credits;
        info = `签到失败：今日已签到‼️ 无忧币 +${coins}`;
        Total(info);
      } else {
        coins = list[0].credits;
        Checkin(coins);
      }
      $.log('Status body: \n' + data);
    })
    .catch((err) => {
      $.notify(appName, '状态获取失败⚠️', JSON.stringify(err));
      $.log(`状态获取失败⚠️\n ${JSON.stringify(err)}`);
    });
}

function Checkin(coins) {
  const url = 'http://task.jegotrip.com.cn:8080/app/sign';
  const body = `{
      "userid":"${userid}",
      "taskId":"${taskid}"
  }`;
  const request = {
    url: url,
    headers: headers,
    body: body,
  };

  $.http
    .post(request)
    .then((resp) => {
      const data = resp.body;
      if (data.indexOf('true') >= 0) {
        info = `签到成功：无忧币 +${coins}🎉`;
        VideoTask(info);
        $.log('\nCheckin body: \n' + data);
      }
    })
    .catch((err) => {
      $.notify(appName, '签到失败⚠️', JSON.stringify(err));
      $.log(`签到失败⚠️\n ${JSON.stringify(err)}`);
    });
}

function VideoTask(info) {
  const url = 'https://uds-i.cmishow.com:1443/uds/cloud/watch/update?version=1';
  delete headers['Content-Length'];
  headers['Accept-Encoding'] = 'gzip, deflate, br';
  headers['Origin'] = 'https://ishow.jegotrip.com.cn';
  headers['Connection'] = 'keep-alive';
  headers['Host'] = 'uds-i.cmishow.com:1443';
  headers['Referer'] = 'https://ishow.jegotrip.com.cn/freeStyleTourism/detail';
  const body = `{
      "userId":"${accountid}",
      "userWatchTime":"10.0",
      "accountId":"${mobile}"
  }`;
  const request = {
    url: url,
    headers: headers,
    body: body,
  };

  $.http
    .post(request)
    .then((resp) => {
      const data = resp.body;
      if (data.indexOf('update success') >= 0) {
        $.log('\n视频任务成功🎉\nVideoTask body: \n' + data);
        Exchange(headers, info);
      } else {
      }
    })
    .catch((err) => {
      $.notify(appName, '视频任务失败⚠️', JSON.stringify(err));
      $.log(`视频任务失败⚠️\n ${JSON.stringify(err)}`);
    });
}

function Exchange(headers, info) {
  const url =
    'https://uds-i.cmishow.com:1443/uds/cloud/watch/exchange?version=1';
  headers['Referer'] =
    'https://ishow.jegotrip.com.cn/freeStyleTourism/activity';
  const body = `{
      "userId":"${accountid}",
      "exchangeTime":10,
      "exchangeNum":10,
      "accountId":"${mobile}"
  }`;
  const request = {
    url: url,
    headers: headers,
    body: body,
  };

  $.http
    .post(request)
    .then((resp) => {
      const data = resp.body;
      if (data.indexOf('exchangeNum') >= 0) {
        $.log('\n兑换成功🎉\nExchange body: \n' + data);
        info += `\n视频任务：无忧币 +${JSON.parse(data).data.exchangeNum}🎉`;
      } else {
        $.log('\n兑换失败‼️\nExchange body: \n' + data);
        res = JSON.parse(data.replace('.', ''));
        info += '\n视频任务：' + res.mes + '‼️';
      }
      Total(info);
    })
    .catch((err) => {
      $.notify(appName, '兑换失败⚠️', JSON.stringify(err));
      $.log(`兑换失败⚠️\n ${JSON.stringify(err)}`);
    });
}

function Total(info) {
  const url = `https://app.jegotrip.com.cn/api/service/user/v1/getUserAssets?lang=zh_cn&token=${token}`;
  const body = `{"token":"${token}"}`;
  headers['Accept-Encoding'] = 'gzip, deflate, br';
  headers['Connection'] = 'keep-alive';
  headers['Content-Length'] = '44';
  headers['Host'] = 'app.jegotrip.com.cn';
  const request = {
    url: url,
    headers: headers,
    body: body,
  };

  $.http
    .post(request)
    .then((resp) => {
      const data = resp.body;
      let res = JSON.parse(data);
      console.log('\nTotal body: \n' + data);
      let total = res.body.tripCoins;
      info += `\n无忧币总计：${total}💰`;
      $.notify(appName, '', info);
    })
    .catch((err) => {
      $.notify(appName, '信息获取失败⚠️', JSON.stringify(err));
      $.log(`信息获取失败⚠️\n ${JSON.stringify(err)}`);
    })
    .finally(() => $.done());
}

function GetCookie() {
  if (
    $request.method != 'OPTIONS' &&
    $response.body &&
    $request.url.match(/userid/)
  ) {
    var body = JSON.parse($response.body.replace(/\[|]/g, ''));
    var taskid = body.rtn.tasks['日常任务'].id;
    if ($.read('taskid')) {
      if ($.read('taskid') !== taskid) {
        $.write(taskid, 'taskid');
        if ($.read('taskid') !== taskid) {
          info = '更新TaskID失败‼️';
        } else {
          info = '更新TaskID成功 🎉';
        }
      }
    } else {
      $.write(taskid, 'taskid');
      if ($.read('taskid') !== taskid) {
        info = '首次写入TaskID失败‼️';
      } else {
        info = '首次写入TaskID成功 🎉';
      }
    }
    if (typeof info != 'undefined') {
      $.notify(appName, '', info);
    }
  }

  if (
    $request.method != 'OPTIONS' &&
    $response.body &&
    $request.url.match(/getUser?/)
  ) {
    var body = JSON.parse($response.body);
    var res = body.body;
    var accountid = res['user_id'];
    var userid = res['open_id'];
    var mobile = res['mobile'];
    var regex = /token=([A-Za-z0-9]+)/;
    var token = regex.exec($request.url)[1];
    var info = '获取Cookie...';
    if ($.read('accountid')) {
      if ($.read('accountid') !== accountid) {
        $.write(accountid, 'accountid');
        if ($.read('accountid') !== accountid) {
          info = '更新AccountID失败‼️';
        } else {
          info = '更新AccountID成功 🎉';
        }
      }
    } else {
      $.write(accountid, 'accountid');
      if ($.read('accountid') !== accountid) {
        info = '首次写入AccountID失败‼️';
      } else {
        info = '首次写入AccountID成功 🎉';
      }
    }

    if ($.read('userid')) {
      if ($.read('userid') !== userid) {
        $.write(userid, 'userid');
        if ($.read('userid') !== userid) {
          info += '\n更新UserID失败‼️';
        } else {
          info += '\n更新UserID成功 🎉';
        }
      }
    } else {
      $.write(userid, 'userid');
      if ($.read('userid') !== userid) {
        info += '\n首次写入UserID失败‼️';
      } else {
        info += '\n首次写入UserID成功 🎉';
      }
    }

    if ($.read('mobile')) {
      if ($.read('mobile') !== mobile) {
        $.write(mobile, 'mobile');
        if ($.read('mobile') !== mobile) {
          info += '\n更新Mobile号码失败‼️';
        } else {
          info += '\n更新Mobile号码成功 🎉';
        }
      }
    } else {
      $.write(mobile, 'mobile');
      if ($.read('mobile') !== mobile) {
        info += '\n首次写入Mobile号码失败‼️';
      } else {
        info += '\n首次写入Mobile号码成功 🎉';
      }
    }

    if ($.read('token')) {
      if ($.read('token') !== token) {
        $.write(token, 'token');
        if ($.read('token') !== token) {
          info += '\n更新Token失败‼️';
        } else {
          info += '\n更新Token成功 🎉';
        }
      }
    } else {
      $.write(token, 'token');
      if ($.read('token') !== token) {
        info += '\n首次写入Token失败‼️';
      } else {
        info += '\n首次写入Token成功 🎉';
      }
    }
    if (info != '获取Cookie...') {
      $.notify(appName, '', info);
    }
  }

  $.done();
}

// prettier-ignore
// OpenAPI from Peng-YM
/*********************************** API *************************************/
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!t,o="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!o,isJSBox:o,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}
function HTTP(e = { baseURL: '' }) {
  const { isQX: t, isLoon: s, isSurge: o, isScriptable: i, isNode: n } = ENV(),
    r =
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/;
  const u = {};
  return (
    ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'].forEach(
      (l) =>
        (u[l.toLowerCase()] = (u) =>
          (function (u, l) {
            l = 'string' == typeof l ? { url: l } : l;
            const a = e.baseURL;
            a && !r.test(l.url || '') && (l.url = a ? a + l.url : l.url);
            const h = (l = { ...e, ...l }).timeout,
              c = {
                onRequest: () => {},
                onResponse: (e) => e,
                onTimeout: () => {},
                ...l.events,
              };
            let f, d;
            if ((c.onRequest(u, l), t)) f = $task.fetch({ method: u, ...l });
            else if (s || o || n)
              f = new Promise((e, t) => {
                (n ? require('request') : $httpClient)[u.toLowerCase()](
                  l,
                  (s, o, i) => {
                    s
                      ? t(s)
                      : e({
                          statusCode: o.status || o.statusCode,
                          headers: o.headers,
                          body: i,
                        });
                  }
                );
              });
            else if (i) {
              const e = new Request(l.url);
              (e.method = u),
                (e.headers = l.headers),
                (e.body = l.body),
                (f = new Promise((t, s) => {
                  e.loadString()
                    .then((s) => {
                      t({
                        statusCode: e.response.statusCode,
                        headers: e.response.headers,
                        body: s,
                      });
                    })
                    .catch((e) => s(e));
                }));
            }
            const $ = h
              ? new Promise((e, t) => {
                  d = setTimeout(
                    () => (
                      c.onTimeout(),
                      t(`${u} URL: ${l.url} exceeds the timeout ${h} ms`)
                    ),
                    h
                  );
                })
              : null;
            return (
              $ ? Promise.race([$, f]).then((e) => (clearTimeout(d), e)) : f
            ).then((e) => c.onResponse(e));
          })(l, u))
    ),
    u
  );
}
function API(e = 'untitled', t = !1) {
  const {
    isQX: s,
    isLoon: o,
    isSurge: i,
    isNode: n,
    isJSBox: r,
    isScriptable: u,
  } = ENV();
  return new (class {
    constructor(e, t) {
      (this.name = e),
        (this.debug = t),
        (this.http = HTTP()),
        (this.env = ENV()),
        (this.node = (() => {
          if (n) {
            return { fs: require('fs') };
          }
          return null;
        })()),
        this.initCache();
      Promise.prototype.delay = function (e) {
        return this.then(function (t) {
          return ((e, t) =>
            new Promise(function (s) {
              setTimeout(s.bind(null, t), e);
            }))(e, t);
        });
      };
    }
    initCache() {
      if (
        (s && (this.cache = JSON.parse($prefs.valueForKey(this.name) || '{}')),
        (o || i) &&
          (this.cache = JSON.parse($persistentStore.read(this.name) || '{}')),
        n)
      ) {
        let e = 'root.json';
        this.node.fs.existsSync(e) ||
          this.node.fs.writeFileSync(
            e,
            JSON.stringify({}),
            { flag: 'wx' },
            (e) => console.log(e)
          ),
          (this.root = {}),
          (e = `${this.name}.json`),
          this.node.fs.existsSync(e)
            ? (this.cache = JSON.parse(
                this.node.fs.readFileSync(`${this.name}.json`)
              ))
            : (this.node.fs.writeFileSync(
                e,
                JSON.stringify({}),
                { flag: 'wx' },
                (e) => console.log(e)
              ),
              (this.cache = {}));
      }
    }
    persistCache() {
      const e = JSON.stringify(this.cache, null, 2);
      s && $prefs.setValueForKey(e, this.name),
        (o || i) && $persistentStore.write(e, this.name),
        n &&
          (this.node.fs.writeFileSync(
            `${this.name}.json`,
            e,
            { flag: 'w' },
            (e) => console.log(e)
          ),
          this.node.fs.writeFileSync(
            'root.json',
            JSON.stringify(this.root, null, 2),
            { flag: 'w' },
            (e) => console.log(e)
          ));
    }
    write(e, t) {
      if ((this.log(`SET ${t}`), -1 !== t.indexOf('#'))) {
        if (((t = t.substr(1)), i || o)) return $persistentStore.write(e, t);
        if (s) return $prefs.setValueForKey(e, t);
        n && (this.root[t] = e);
      } else this.cache[t] = e;
      this.persistCache();
    }
    read(e) {
      return (
        this.log(`READ ${e}`),
        -1 === e.indexOf('#')
          ? this.cache[e]
          : ((e = e.substr(1)),
            i || o
              ? $persistentStore.read(e)
              : s
              ? $prefs.valueForKey(e)
              : n
              ? this.root[e]
              : void 0)
      );
    }
    delete(e) {
      if ((this.log(`DELETE ${e}`), -1 !== e.indexOf('#'))) {
        if (((e = e.substr(1)), i || o)) return $persistentStore.write(null, e);
        if (s) return $prefs.removeValueForKey(e);
        n && delete this.root[e];
      } else delete this.cache[e];
      this.persistCache();
    }
    notify(e, t = '', l = '', a = {}) {
      const h = a['open-url'],
        c = a['media-url'];
      if (
        (s && $notify(e, t, l, a),
        i &&
          $notification.post(e, t, l + `${c ? '\n多媒体:' + c : ''}`, {
            url: h,
          }),
        o)
      ) {
        let s = {};
        h && (s.openUrl = h),
          c && (s.mediaUrl = c),
          '{}' === JSON.stringify(s)
            ? $notification.post(e, t, l)
            : $notification.post(e, t, l, s);
      }
      if (n || u) {
        const s =
          l + (h ? `\n点击跳转: ${h}` : '') + (c ? `\n多媒体: ${c}` : '');
        if (r) {
          require('push').schedule({ title: e, body: (t ? t + '\n' : '') + s });
        } else console.log(`${e}\n${t}\n${s}\n\n`);
      }
    }
    log(e) {
      this.debug && console.log(`[${this.name}] LOG: ${e}`);
    }
    info(e) {
      console.log(`[${this.name}] INFO: ${e}`);
    }
    error(e) {
      console.log(`[${this.name}] ERROR: ${e}`);
    }
    wait(e) {
      return new Promise((t) => setTimeout(t, e));
    }
    done(e = {}) {
      s || o || i
        ? $done(e)
        : n &&
          !r &&
          'undefined' != typeof $context &&
          (($context.headers = e.headers),
          ($context.statusCode = e.statusCode),
          ($context.body = e.body));
    }
  })(e, t);
}
/*****************************************************************************/
