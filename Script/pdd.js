let body = $response.body;

if (/<\/html>|<\/body>/.test(body)) {
  body = body.replace(
    '</body>',
    `

  <script>
  function init() {
      document.documentElement.scrollTop = 200;
      document.querySelector(".pdd-list-container>div:nth-child(3)>div").addEventListener('click', function () { 
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

  document.addEventListener("DOMContentLoaded", init);
  </script>
</body>`
  );
}

$done({ body });
