/* 
打开活动页面自动注入console，需要手动执行脚本

[rewrite_local]
# 京东活动助手
https://.*\.m\.jd\.com/babelDiy/Zeus/.*/index\.html url script-response-body jd_hd.js
https://.*\.m\.jd\.com/.*\.html url script-response-body jd_hd.js
https://jingfen\.jd\.com/.*\.html url script-response-body jd_hd.js
https://coupon\.m\.jd\.com/center/getCouponCenter\.action url script-response-body jd_hd.js
https://active.jd.com/forever/btgoose url script-response-body jd_hd.js

[mitm]
hostname = *.jd.com, *.*.jd.com
*/

let html = $response.body;


if (!html.includes("</html>")) {

  $done({ body: html });
  return
}

let url = $request.url.replace(/https?:\/\/|\?.*/g, '');

html =
  html.replace(/(<\/html>)/g, '') +
  `
  <style>
    html, body {
      -webkit-user-select: auto !important;
      user-select: auto !important;
    }
    #alook, #yyb {
      position: fixed;
      bottom: 150px;
      right: 0;
      z-index: 99999;
    }
    #alook img, #yyb img {
      box-sizing: content-box;
      width: 30px;
      height: 30px;
      padding: 0 20px 0 5px;
      border:1px solid rgba(255,255,255,0.8);
      background: #FFF;
      border-radius: 50px 0 0 50px;
    }

    #yyb {
      bottom: 117px;
    }
  </style>
  <div id="alook">
    <a href="alook://${url}">
      <img src="https://alookbrowser.com/assets/uploads/profile/1-profileavatar.png" />
    </a>
  </div>
  <div id="yyb">
    <a href="yybpro://url?${url}">
      <img src="https://tvax3.sinaimg.cn/crop.0.0.828.828.180/006nobRDly8gel4md0kfzj30n00n03z2.jpg" />
    </a>
  </div>
  
  <script>

    const script = document.createElement('script');
    script.src = "https://cdn.bootcss.com/vConsole/3.2.0/vconsole.min.js";
    // script.doneState = { loaded: true, complete: true};
    script.onload = function() {
        init();
        console.log("初始化成功");
    };
    
    
    document.getElementsByTagName('head')[0].appendChild(script);
    
    
    function init () {
      
      window.vConsole = new VConsole({ defaultPlugins: ["system", "element"] });
      /**
      const myPlugin = new VConsole.VConsolePlugin("jd_hd", "京东活动");
      vConsole.addPlugin(myPlugin);

      myPlugin.on("renderTab", function (callback) {
        var html = \`
                    1234567  
                    \`;
                    
        callback(html);
      });
      
      myPlugin.on("addTool", function (callback) {
       
        var toolList = [];
        toolList.push({
          name: "脚本1",
          global: false,
          onClick: function (event) {
            vConsole.showTab("default");
            
            // 脚本1
            eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)d[e(c)]=k[c]||e(c);k=[function(e){return d[e]}];e=function(){return'\\\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\\\b'+e(c)+'\\\\b','g'),k[c]);return p}(' e 9=4.3(\\'9\\');9.d=\"b/6\";9.a=\"5://c.2/8/7.8\";4.1.0(9);',62,15,'appendChild|body|com|createElement|document|https|javascript|jdqmyy|js|script|src|text|tyh52|type|var'.split('|'),0,{}))
          }

        },
        {
          name: "领券页面",
          global: false,
          onClick: function (event) {
            vConsole.showTab("default");
             
             // 脚本2
             eval(function(){function c(){var d=document.getElementById(\"loadJs\"),e=document.createElement(\"script\");d&&document.getElementsByTagName(\"head\")[0].removeChild(d),e.id=\"loadJs\",e.type=\"text/javascript\",e.src=\"https://krapnik.cn/tools/JDCouponAssistant/bundle.js\",document.getElementsByTagName(\"head\")[0].appendChild(e)}c()}())

         },
         
          
        });
        
        callback(toolList);
      });
      
      
      myPlugin.on('ready', function() {
      
          //vConsole.show();
          
	      setTimeout(() => vConsole.showTab("jd_hd"), 300);
           console.log(window.location.href)
          
      });
      **/
      
    }
  </script>
</html>
`;


$done({ body: html });
