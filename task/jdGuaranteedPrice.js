/**
 * 京东保价
 * 京东 api 只能查询60天的订单
 * 保价期限是以物流签收时间为准的，30天是最长保价期。
 * 所以订单下单时间以及发货、收货时间，也可能占用很多天，60天内的订单进行保价是正常的。
 * 没进行过保价的60天内的订单。查询一次，不符合保价的，不会再次申请保价。
 *
 *
 * 修改自：https://raw.githubusercontent.com/ZCY01/daily_scripts/main/jd/jd_priceProtect.js
 *
 * 京东保价页面脚本：https://static.360buyimg.com/siteppStatic/script/priceskus-phone.js
 *
 *
 * > 同时支持使用 NobyDa 与 domplin 脚本的京东 cookie
 * > https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js
 * > https://raw.githubusercontent.com/dompling/Script/master/jd/JD_extra.js
 *
 * # Surge
 * Tasks: 京东保价 = type=cron,cronexp=3 0 * * *,script-path=https://raw.githubusercontent.com/id77/QuantumultX/master/task/jdGuaranteedPrice.js,wake-system=true
 *
 * # QuanX
 * 3 0 * * * https://raw.githubusercontent.com/id77/QuantumultX/master/task/jdGuaranteedPrice.js, tag=京东保价, img-url=https://raw.githubusercontent.com/id77/QuantumultX/master/icon/jdGuaranteedPrice.png
 *
 * # Loon
 * cron "3 0 * * *" script-path=https://raw.githubusercontent.com/id77/QuantumultX/master/task/jdGuaranteedPrice.js
 *
 */

const $ = new Env('京东保价');

const selfDomain = 'https://msitepp-fm.jd.com/';
const unifiedGatewayName = 'https://api.m.jd.com/';

let cookies = [];
$.getData('CookieJD') && cookies.push($.getData('CookieJD'));
$.getData('CookieJD2') && cookies.push($.getData('CookieJD2'));

const extraCookies = JSON.parse($.getData('CookiesJD') || '[]').map(
  (item) => item.cookie
);
cookies = Array.from(new Set([...cookies, ...extraCookies]));

!(async () => {
  if (!cookies[0]) {
    $.msg(
      $.name,
      '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取',
      'https://bean.m.jd.com/',
      {
        'open-url': 'https://bean.m.jd.com/',
      }
    );
    return;
  }
  for (let i = 0; i < cookies.length; i++) {
    if (cookies[i]) {
      $.cookie = cookies[i];
      $.UserName = decodeURIComponent(
        $.cookie.match(/pt_pin=(.+?);/) && $.cookie.match(/pt_pin=(.+?);/)[1]
      );
      $.index = i + 1;
      $.isLogin = false;
      $.nickName = '';
      await totalBean();
      if (!$.isLogin) {
        $.msg(
          $.name,
          `【提示】cookie已失效`,
          `京东账号${$.index} ${
            $.nickName || $.UserName
          }\n请重新登录获取\nhttps://bean.m.jd.com/`,
          {
            'open-url': 'https://bean.m.jd.com/',
          }
        );
        continue;
      }
      console.log(
        `\n***********开始【账号${$.index}】${
          $.nickName || $.UserName
        }********\n`
      );
      $.hasNext = true;
      $.refundtotalamount = 0;
      $.orderList = new Array();
      $.applyMap = {};
      // TODO
      $.token = '';
      $.feSt = 'f';
      console.log(`💥 获得首页面，解析超参数`);
      await getHyperParams();
      // console.log($.HyperParam)
      console.log(`----------`);
      console.log(`🧾 获取所有价格保护列表，排除附件商品`);
      for (let page = 1; $.hasNext; page++) {
        await getApplyData(page);
      }
      console.log(`----------`);
      console.log(`🗑 删除不符合订单`);
      console.log(`----------`);
      let taskList = [];
      for (let order of $.orderList) {
        taskList.push(historyResultQuery(order));
      }
      await Promise.all(taskList);
      console.log(`----------`);
      console.log(`📊 ${$.orderList.length}个商品即将申请价格保护！`);
      console.log(`----------`);
      for (let order of $.orderList) {
        await skuApply(order);
        await $.wait(300);
      }
      console.log(`----------`);
      console.log(`⏳ 等待申请价格保护结果...`);
      console.log(`----------`);
      for (let i = 1; i <= 30 && Object.keys($.applyMap).length > 0; i++) {
        await $.wait(1000);
        if (i % 5 == 0) {
          await getApplyResult();
        }
      }
      showMsg();
    }
  }
})()
  .catch((e) => {
    console.log(`❗️ ${$.name} 运行错误！\n${e}`);
  })
  .finally(() => $.done());

const getValueById = function (text, id) {
  try {
    const reg = new RegExp(`id="${id}".*value="(.*?)"`);
    const res = text.match(reg);
    return res[1];
  } catch (e) {
    throw new Error(`getValueById:${id} err`);
  }
};

function getHyperParams() {
  return new Promise((resolve, reject) => {
    const options = {
      url: 'https://msitepp-fm.jd.com/rest/priceprophone/priceProPhoneMenu',
      headers: {
        Host: 'msitepp-fm.jd.com',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        Connection: 'keep-alive',
        Cookie: $.cookie,
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        'Accept-Language': 'zh-cn',
        Referer: 'https://ihelp.jd.com/',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    };
    $.get(options, (err, resp, data) => {
      try {
        if (err) throw new Error(JSON.stringify(err));
        $.HyperParam = {
          sid_hid: getValueById(data, 'sid_hid'),
          type_hid: getValueById(data, 'type_hid'),
          isLoadLastPropriceRecord: getValueById(
            data,
            'isLoadLastPropriceRecord'
          ),
          isLoadSkuPrice: getValueById(data, 'isLoadSkuPrice'),
          RefundType_Orderid_Repeater_hid: getValueById(
            data,
            'RefundType_Orderid_Repeater_hid'
          ),
          isAlertSuccessTip: getValueById(data, 'isAlertSuccessTip'),
          forcebot: getValueById(data, 'forcebot'),
          useColorApi: getValueById(data, 'useColorApi'),
        };
      } catch (e) {
        reject(
          `⚠️ ${arguments.callee.name.toString()} API返回结果解析出错\n${e}\n${JSON.stringify(
            data
          )}`
        );
      } finally {
        resolve();
      }
    });
  });
}

function getApplyData(page) {
  return new Promise((resolve, reject) => {
    $.hasNext = false;
    const { sid_hid, type_hid, forcebot } = $.HyperParam;
    const pageSize = 5;

    let paramObj = {
      page,
      pageSize,
      keyWords: '',
      sid: sid_hid,
      type: type_hid,
      forcebot,
      token: $.token,
      feSt: $.feSt,
    };

    $.post(taskUrl('siteppM_priceskusPull', paramObj), (err, resp, data) => {
      try {
        if (err) {
          console.log(
            `🚫 ${arguments.callee.name.toString()} API请求失败，请检查网路\n${JSON.stringify(
              err
            )}`
          );
        } else {
          let pageErrorVal = data.match(
            /id="pageError_\d+" name="pageError_\d+" value="(.*?)"/
          )[1];
          if (pageErrorVal == 'noexception') {
            let pageDatasSize = eval(
              data.match(
                /id="pageSize_\d+" name="pageSize_\d+" value="(.*?)"/
              )[1]
            );
            $.hasNext = pageDatasSize >= pageSize;
            let orders = [...data.matchAll(/skuApply\((.*?)\)/g)];
            let titles = [...data.matchAll(/<p class="name">(.*?)<\/p>/g)];
            for (let i = 0; i < orders.length; i++) {
              let info = orders[i][1].split(',');
              if (info.length != 4) {
                throw new Error(`价格保护 ${order[1]}.length != 4`);
              }
              const item = {
                orderId: eval(info[0]),
                skuId: eval(info[1]),
                sequence: eval(info[2]),
                orderCategory: eval(info[3]),
                title: `🛒${titles[i][1].substr(0, 15)}🛒`,
              };
              let id = `skuprice_${item.orderId}_${item.skuId}_${item.sequence}`;
              let reg = new RegExp(`${id}.*?isfujian="(.*?)"`);
              isfujian = data.match(reg)[1];
              if (isfujian == 'false') {
                let skuRefundTypeDiv_orderId = `skuRefundTypeDiv_${item.orderId}`;
                item['refundtype'] = getValueById(
                  data,
                  skuRefundTypeDiv_orderId
                );
                // 设置原路返还
                if (item.refundtype === '2') item.refundtype = '1';
                $.orderList.push(item);
              }
              //else...尊敬的顾客您好，您选择的商品本身为赠品，是不支持价保的呦，请您理解。
            }
          }
        }
      } catch (e) {
        reject(
          `⚠️ ${arguments.callee.name.toString()} API返回结果解析出错\n${e}\n${JSON.stringify(
            data
          )}`
        );
      } finally {
        resolve();
      }
    });
  });
}

//  申请按钮
function skuApply(order) {
  return new Promise((resolve, reject) => {
    const { orderId, orderCategory, skuId, refundtype } = order;
    const { sid_hid, type_hid, forcebot } = $.HyperParam;

    let paramObj = {
      orderId,
      orderCategory,
      skuId,
      sid: sid_hid,
      type: type_hid,
      refundtype,
      forcebot,
      token: $.token,
      feSt: $.feSt,
    };

    console.log(`🈸 ${order.title}`);
    $.post(taskUrl('siteppM_proApply', paramObj), (err, resp, data) => {
      try {
        if (err) {
          console.log(
            `🚫 ${arguments.callee.name.toString()} API请求失败，请检查网路\n${JSON.stringify(
              err
            )}`
          );
        } else {
          data = JSON.parse(data);
          if (data.flag) {
            if (data.proSkuApplyId != null) {
              $.applyMap[data.proSkuApplyId[0]] = order;
            }
          } else {
            console.log(`🚫 ${order.title} 申请失败：${data.errorMessage}`);
          }
        }
      } catch (e) {
        reject(
          `⚠️ ${arguments.callee.name.toString()} API返回结果解析出错\n${e}\n${JSON.stringify(
            data
          )}`
        );
      } finally {
        resolve();
      }
    });
  });
}

// 历史结果查询
function historyResultQuery(order) {
  return new Promise((resolve, reject) => {
    const { orderId, sequence, skuId } = order;
    const { sid_hid, type_hid, forcebot } = $.HyperParam;

    let paramObj = {
      orderId,
      skuId,
      sequence,
      sid: sid_hid,
      type: type_hid,
      pin: undefined,
      forcebot,
    };

    const reg = new RegExp(
      'overTime|[^库]不支持价保|无法申请价保|请用原订单申请'
    );
    let deleted = true;
    $.post(taskUrl('siteppM_skuProResultPin', paramObj), (err, resp, data) => {
      try {
        if (err) {
          console.log(
            `🚫 ${arguments.callee.name.toString()} API请求失败，请检查网路\n${JSON.stringify(
              err
            )}`
          );
        } else {
          deleted = reg.test(data);
        }
      } catch (e) {
        reject(
          `⚠️ ${arguments.callee.name.toString()} API返回结果解析出错\n${e}\n${JSON.stringify(
            data
          )}`
        );
      } finally {
        if (deleted) {
          console.log(`🚫 删除商品：${order.title}`);
          $.orderList = $.orderList.filter((item) => {
            return item.orderId != order.orderId || item.skuId != order.skuId;
          });
        }
        resolve();
      }
    });
  });
}

function getApplyResult() {
  function handleApplyResult(ajaxResultObj) {
    if (
      ajaxResultObj.hasResult != 'undefined' &&
      ajaxResultObj.hasResult == true
    ) {
      //有结果了
      let proSkuApplyId = ajaxResultObj.applyResultVo.proSkuApplyId; //申请id
      let order = $.applyMap[proSkuApplyId];
      delete $.applyMap[proSkuApplyId];
      if (ajaxResultObj.applyResultVo.proApplyStatus == 'ApplySuccess') {
        //价保成功
        $.refundtotalamount += ajaxResultObj.applyResultVo.refundtotalamount;
        console.log(
          `📋 ${order.title} \n🟢 申请成功：￥${$.refundtotalamount}`
        );
        console.log(`-----`);
      } else {
        console.log(
          `📋 ${order.title} \n🔴 申请失败：${ajaxResultObj.applyResultVo.failTypeStr} \n🔴 失败类型:${ajaxResultObj.applyResultVo.failType}`
        );
        console.log(`-----`);
      }
    }
  }
  return new Promise((resolve, reject) => {
    let proSkuApplyIds = Object.keys($.applyMap).join(',');
    const { pin, type_hid } = $.HyperParam;

    let paramObj = {
      proSkuApplyIds,
      pin,
      type: type_hid,
    };

    $.post(taskUrl('siteppM_moreApplyResult', paramObj), (err, resp, data) => {
      try {
        if (err) {
          console.log(
            `🚫 ${arguments.callee.name.toString()} API请求失败，请检查网路\n${JSON.stringify(
              err
            )}`
          );
        } else if (data) {
          data = JSON.parse(data);
          let resultArray = data.applyResults;
          for (let i = 0; i < resultArray.length; i++) {
            let ajaxResultObj = resultArray[i];
            handleApplyResult(ajaxResultObj);
          }
        }
      } catch (e) {
        reject(
          `⚠️ ${arguments.callee.name.toString()} API返回结果解析出错\n${e}\n${JSON.stringify(
            data
          )}`
        );
      } finally {
        resolve();
      }
    });
  });
}

function taskUrl(functionid, body) {
  let urlStr = selfDomain + 'rest/priceprophone/priceskusPull';
  const { useColorApi, forcebot } = $.HyperParam;

  if (useColorApi == 'true') {
    urlStr =
      unifiedGatewayName +
      'api?appid=siteppM&functionId=' +
      functionid +
      '&forcebot=' +
      forcebot +
      '&t=' +
      new Date().getTime();
  }
  return {
    url: urlStr,
    headers: {
      Host: useColorApi == 'true' ? 'api.m.jd.com' : 'msitepp-fm.jd.com',
      Accept: '*/*',
      'Accept-Language': 'zh-cn',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: 'https://msitepp-fm.jd.com',
      Connection: 'keep-alive',
      Referer: 'https://msitepp-fm.jd.com/rest/priceprophone/priceProPhoneMenu',
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      Cookie: $.cookie,
    },
    body: body ? `body=${JSON.stringify(body)}` : undefined,
  };
}

function showMsg() {
  console.log(`🧮 本次价格保护金额：${$.refundtotalamount}💰`);
  if ($.refundtotalamount) {
    $.msg(
      $.name,
      ``,
      `京东账号${$.index} ${$.nickName || $.UserName}\n🎉 本次价格保护金额：${
        $.refundtotalamount
      }💰`,
      {
        'open-url':
          'https://msitepp-fm.jd.com/rest/priceprophone/priceProPhoneMenu',
      }
    );
  }
}

function totalBean() {
  return new Promise((resolve) => {
    const opts = {
      url: 'https://wq.jd.com/user_new/info/GetJDUserInfoUnion?orgFlag=JD_PinGou_New&callSource=mainorder&channel=4&isHomewhite=0&sceneval=2&sceneval=2&g_login_type=1g_ty=ls',
      headers: {
        Accept: `*/*`,
        Connection: `keep-alive`,
        Cookie: $.cookie,
        Host: `wq.jd.com`,
        'Accept-Language': 'zh-cn',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Mobile/15E148 Safari/604.1`,
        Referer: `https://home.m.jd.com/myJd/home.action`,
      },
    };

    $.get(opts, (err, resp, data) => {
      let userInfo;

      try {
        const res = JSON.parse(data);
        if (res['retcode'] === 0) {
          $.isLogin = true;
          userInfo = res.data.userInfo;
          $.nickName = userInfo['baseInfo'].nickname;
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(userInfo);
      }
    });
  });
}

function jsonParse(str) {
  if (typeof str == 'string') {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg(
        $.name,
        '',
        '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie'
      );
      return [];
    }
  }
}
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
