
loadText();

function loadText(){
    var xmlHttp;
?<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">


<html lang="ja">
<head>
<meta http-equiv="Content-Type" Content="text/html;charset=UTF-8">
<meta http-equiv="Content-Script-Type" content="text/javascript">

<title>同期通信テスト</title>

<script type="text/javascript">
<!--
function loadText(){
    var xmlHttp;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "https://www.javadrive.jp/sample/plan.txt", false);
    xmlHttp.send(null);
    alert(xmlHttp.responseText);
}
// -->
</script>

</head>
<body>

<h1>同期通信テスト</h1>


<form>
<input type="button" value="ファイル読み込み" onClick="loadText()">
</form>

</body>
</html>

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "https://www.javadrive.jp/sample/plan.txt", false);
    xmlHttp.send(null);
    alert(xmlHttp.responseText);
}
//https://www.w3.org/TR/PNG/iso_8859-1.txt
