/* 

我的app版本4.4.1

# QuanX
[rewrite_local]
# 人人视频 旧版本api限制解除
^https:\/\/api\.rr\.tv url script-request-header https://raw.githubusercontent.com/id77/QuantumultX/master/Script/rrtv.js

# Surge
[Script]
# 人人视频 旧版本api限制解除
人人视频 旧版本api限制解除  = type=http-request,pattern=^https:\/\/api\.rr\.tv,script-path= https://raw.githubusercontent.com/id77/QuantumultX/master/Script/rrtv.js

# Loon
[Script]
http-request ^https:\/\/api\.rr\.tv script-path=https://raw.githubusercontent.com/id77/QuantumultX/master/Script/rrtv.js, tag=人人视频 旧版本api限制解除
 
hostname = *.rr.tv
*/

const reg = /4\.\d+\.\d/g;
const headers = JSON.parse(
  JSON.stringify($request.headers).replace(reg, '4.10.1')
);

const data = { headers };

data.url = $request.url.replace(reg, '4.10.1');

$done(data);
