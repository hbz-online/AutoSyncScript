let body = $response.body;


body = body.replace(/"now_status":\-?\d/g, '"now_status":1');
body = body.replace(/"num":0/g, '"num":10');
body = body.replace(/"ratio":100/g, '"ratio":0');

$done({ body });
