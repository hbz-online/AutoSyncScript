let body = $response.body;

if (/<\/html>|<\/body>/.test(body)) {
  body = body.replace(
    '</body>',
    `

  <script>
  function init() {
      const pList = document.querySelectorAll(".pdd-list-container span")
      document.documentElement.scrollTop = 200;


      for (const p of pList) {
        p.addEventListener('click', function(event) {
          // console.log(this.textContent.replace(/(.*)展开$/,'$1'));
          const input = document.createElement('input');
          input.setAttribute('readonly', 'readonly');
          input.setAttribute('value', this.textContent.replace(/(.*)展开$/,'$1'));
          document.body.appendChild(input);
          input.setSelectionRange(0, input.value.length);
          if (document.execCommand('copy')) {
            document.execCommand('copy');
            console.log('复制成功');
          }
          document.body.removeChild(input);
        })
      }
  }

  document.addEventListener("DOMContentLoaded", init);
  </script>
</body>`
  );
}

$done({ body });

// https://mobile.yangkeduo.com/search_result.html?search_key=%EF%BF%BC%EF%BF%BC%E5%8D%81%E6%9C%88%E7%A8%BB%E7%94%B0%20%E7%BA%A2%E7%9A%AE%E8%8A%B1%E7%94%9F%E7%B1%B31kg%20%E5%8E%BB%E5%A3%B3%E8%8A%B1%E7%94%9F%E4%BB%81%20%E6%9D%82%E7%B2%AE%20%E5%B0%8F%E7%B2%92%E8%8A%B1%E7%94%9F
