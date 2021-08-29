/*
     强制增加中青看点看看赚入口，和签到Cookie有冲突，请使用时添加，不用时请禁用
   
   https:\/\/kandian\.wkandian\.com\/V17\/NewTaskIos\/getTaskList url script-response-body youdata.js
*/

let obj = JSON.parse($response.body);
let look = {"title":"看看赚","event":"task_lookmaking","logo":"http://res.youth.cn/app_icon/20210705/kankanzhuan.png","topIcon":"+1元","minlogo":"","action":"","url":"https://kd.youth.cn/h5/20190527watchMoney","jump_type":1};
if (obj.items.head[3].title !== "看看赚"){
    data = obj.items.head.push(look)
}
$done({body: JSON.stringify(obj)})
