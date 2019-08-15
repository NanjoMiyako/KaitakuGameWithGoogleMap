//型を表す文字列
const PROP_TYPE_MAP_STR = "[object Map]";
const PROP_TYPE_STRING_STR = "[object String]";
const PROP_TYPE_INT_STR = "[object Number]";
const PROP_TYPE_ARRAY_STR = "[object Array]";
const PROP_TYPE_OBJECT_STR = "[object Object]";


//GoogleAPIキー
var GoogleAPIKey = ''
var g_MapOpts;
var g_Map;
var deviceType;

//JSON読み出しする上でのデータ定義リストの一覧
var g_DataContractList = InitDataContractList();

//テスト用
//Test1();

Test2();



function SetGoogleApiKey(){
    GoogleAPIKey = document.getElementById("GoogleApiKey1").value;
    Init();
}
function Init(){

    var srcURL = "https://maps.googleapis.com/maps/api/js?key=";
    srcURL += GoogleAPIKey;
    srcURL +="&callback=initMap";
    var s = document.createElement("script");
    s.src = srcURL;    

    var ele = document.getElementById("InitScriptTag");
    ele.appendChild(s);
    
     
}

function initMap(){
  g_MapOpts = {
    zoom: 14,//ズームレベル
    center: new google.maps.LatLng(35.6807527,139.7600500)
  };
  g_Map = new google.maps.Map(document.getElementById("map"), g_MapOpts);
  
  g_Map.addListener('click', function(e){
  
  	var latElem = document.getElementById("latDisp1");
  	var lngElem = document.getElementById("lngDisp1");
  	
  	latElem.innerHTML = e.latLng.lat();
  	lngElem.innerHTML = e.latLng.lng();
  	
     var mopts = {
        position: e.latLng,
        map: g_Map,
        title: "test"
        };
    
    var marker = new google.maps.Marker(mopts);

	});
  
  
  drawPolygon();
  
  
}

function drawPolygon(){
	g_Map.setCenter(new google.maps.LatLng(34.98655,135.75531), 13);

	var points = [
	  new google.maps.LatLng(34.991261,135.730076),
	  new google.maps.LatLng(34.997976,135.759945),
	  new google.maps.LatLng(34.965979,135.772219),
	  new google.maps.LatLng(34.90, 135.76),
	  new google.maps.LatLng(34.991261,135.730076)
	];
	
    // Construct the polygon.
    var polygon = new google.maps.Polygon({
          paths: points,//多角形の各頂点を設定
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,//周囲を取り囲む直線の不透明度
          strokeWeight: 2,
          fillColor: '#00ff00',
          fillOpacity: 0.55//内部の不透明度
        });

	polygon.setMap(g_Map);
	
}

//外部Jsonファイル読み込みテストコード
function Test2(){
	/*
	var jsonDataUrl = "https://drive.google.com/file/d/1ovM-bmDWGXfRzCH5S24hIMCOXUneD58S/view?usp=sharing";
    httpObj = new XMLHttpRequest();
    httpObj.open("get", jsonDataUrl, true);
    httpObj.onload = function(){
			var elem1 = document.getElementById("forDebugP1");

			elem1.innerHTML = this.responseText;

        };
   httpObj.send(null);
   */

}

//Json読み込みテストコード
function Test1(){
	var Obj1 = new TestObj(2019, "testString123");
	var Obj2 = new TestObj(2010, "testString345");
	
	var Map1 = new Map();
	var Map2 = new Map();
	
	Map1.set(1, 100);
	Map1.set(3, 392);
	
	Map2.set(93, Obj1);
	Map2.set(87, Obj2);
	
	var JsonObj1 = new JsonObj(Map1, Map2, "testJson0950", 253);
	
	var resultMap = GetPropsAndType(JsonObj1);
	var elem1 = document.getElementById("forDebugP1");
	var elem2 = document.getElementById("forDebugP2");
	elem1.innerHTML = '';
	elem2.innerHTML = '';
	
	var jsonValObj1 = ConvertToJsonStrFromObjWithMap(JsonObj1);

	elem1.innerHTML = jsonValObj1.jsonStr;
	for (var key of jsonValObj1.dataContractMap.keys()) {
	    var line1 = key + " => " + jsonValObj1.dataContractMap.get(key) + "<br>";
	    elem2.innerHTML += line1; 
	}
	
	var dataContract1 = GetMyDataContractByName("JsonObj");
	var val2 = ConvertToObjFromJsonStrByDataContract(jsonValObj1.jsonStr, dataContract1);
	
}

//データ定義のコンストラクタ1
function MyDataContract(name1, map1){
	this.name = name1;
	this.dataContractMap = map1;
}

//データ定義のコンストラクタ2
function MyDataConstract(name1, propNmList, propTypeList){
	var map1 = new Map();
	
	for(var i=0; i<propNmList.length; i++){
		map1.set(propNmList[i], propTypeList[i]);
	}
	
	this.name = name1
	this.dataContractMap = map1;
	
}
//Json読み出し時用の各クラスのデータ定義を作成するメソッド
function InitDataContractList(){
	var resultList = [];
	
	//各データ定義をセット
	dataConstractName = "JsonObj";//Jsonのクラス名
	propNmList = ["Map1","Map2","prop3","prop4"];
	propTypeList = [PROP_TYPE_MAP_STR, PROP_TYPE_MAP_STR, PROP_TYPE_STRING_STR, PROP_TYPE_INT_STR];
	resultList.push(new MyDataConstract(dataConstractName, propNmList, propTypeList));
	
	return resultList;
}

//データ定義リストから名前でデータ定義を取ってくるメソッド
function GetMyDataContractByName(name){
	
	var retVal = null;
	for(var i=0; i<g_DataContractList.length; i++){
		if(g_DataContractList[i].name == name){
			retVal = g_DataContractList[i];
			break;
		}
	}
	return retVal;
}

//TestObjクラス作成コンストラクタ
function  TestObj(valInt, valStr){
	this.prop1 = valInt;
	this.prop2 = valStr;
}
//JsonObj作成コンストラクタ
function JsonObj(valMap1, valMap2, valStr, valInt){
	this.Map1 = valMap1;
	this.Map2 = valMap2;
	this.prop3 = valStr;
	this.prop4 = valInt;
}

//Json文字列にマップを含む場合、データ定義にしたがって適宜マップに変換してオブジェクトに変換する
function ConvertToObjFromJsonStrByDataContract(jsonStr, myDataContract){
	var tempObj = JSON.parse(jsonStr);
	var resultObj = JSON.parse(jsonStr);
	
	var propType;
	var key1;
	var val1;
	var mapVal1;
	var dataContractMap = myDataContract.dataContractMap;
	
	for(var propName of dataContractMap.keys()){
		propType = dataContractMap.get(propName);
		if(propType == PROP_TYPE_MAP_STR){
		//JSON文字列がマップの場合[[KEY],[VALUE]],[]...]のそれぞれ2個の要素を持つ配列として格納されている(とする)
			mapVal1 = new Map();

			//配列をマップに変換
			var array1 = tempObj[propName];
			array1.forEach( function( value ){
				key1 = value[0];
				val1 = value[1];
				mapVal1.set(key1, val1);
			});
			
			resultObj[propName] = mapVal1;
			
		}
	}
	
	return resultObj;
	
}

//マップを含むオブジェクトからjsonStrを生成する
//戻り値: Json文字列(jsonStr), データ定義(dataContractMap)のメンバを持つオブジェクト
function ConvertToJsonStrFromObjWithMap(fromObj){
	var tempObj = {};
	var convertedArray;
	var retVal = {};
	var jsonStr1;
	
	propNameAndTypeMap = GetPropsAndType(fromObj);
	var propType;
	for (var propName of propNameAndTypeMap.keys()) {
		propType = propNameAndTypeMap.get(propName);
		if(propType != PROP_TYPE_MAP_STR){
			tempObj[propName] = fromObj[propName];
		}else if(propType == PROP_TYPE_MAP_STR){
			convertedArray = [...fromObj[propName]];
			tempObj[propName] = convertedArray;
		}
	}
	
	retVal.dataContractMap = propNameAndTypeMap;
	retVal.jsonStr = JSON.stringify(tempObj);
	
	return retVal;
}

function GetPropsAndType(obj) {
  var result = new Map();
  var propName = '';
  var propType = '';
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
		propName = i;
		propType = Object.prototype.toString.call(obj[i]);
		result.set(propName, propType);
    }
  }
  return result;
}

var googleDriveClient;
var nextPageToken;
var parentId;
var CLIENT_ID = "697932331583-tbb17gltkqvutp34a0lvraqi5kjjfqrk.apps.googleusercontent.com";
var API_KEY = "AIzaSyD8eIi5pddYS7ON8pzuHSIZx7pPJgz1lqo";
var SCOPES ="https://www.googleapis.com/auth/drive.readonly";
var API_VERSION = 'v1';


gapi.load('client', {
  callback: function() {
    // Handle gapi.client initialization.
    initGapiClient();
  },
  onerror: function() {
    // Handle loading error.
    alert('gapi.client failed to load!');
  },
  timeout: 5000, // 5 seconds.
  ontimeout: function() {
    // Handle timeout.
    alert('gapi.client could not load in a timely manner!');
  }
});

function initGapiClient(){
 authorization();
}
 /**
  * Authorize Google Compute Engine API.
  */
 function authorization() {
   gapi.client.setApiKey(API_KEY);
   gapi.auth.authorize({
     client_id: CLIENT_ID,
     scope: SCOPES,
     immediate: false
   }, function(authResult) {
        if (authResult && !authResult.error) {
          window.alert('Auth was successful!');
        } else {
          window.alert('Auth was not successful');
        }
      }
   );
 }


/**
 * Load the Google Compute Engine API.
 */
function initializeApi() {
  gapi.client.load('compute', API_VERSION);
}

