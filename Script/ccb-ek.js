let body = $response.body;

body = body.replace(/"now_status":\-?\d/g, '"now_status":1');
body = body.replace(/"num":0/g, '"num":10');

$done({ body });
