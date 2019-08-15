//JSON読み出しする上でのデータ定義リストの一覧
var g_DataContractList = InitDataContractList();

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
		if(propType == PROP_TYPE_MAP_STR){
			convertedArray = [...fromObj[propName]];
			tempObj[propName] = convertedArray;
		}else if(propType == PROP_TYPE_OBJECT_STR){
			tempObj[propName] = fromObj[propName];
		}else{
			tempObj[propName] = fromObj[propName];
		}
	}
	
	retVal.dataContractMap = propNameAndTypeMap;
	retVal.jsonStr = JSON.stringify(tempObj);
	
	return retVal;
}

//DataConstructのノードの連番採番用
var g_DataConstructNodeCount = 0;
//一つのメンバについてのオブジェクトのデータ定義を表すノードのコンストラクタ
function DataConstruct(){
	this.name = null;
	this.type = null;	
	this.child_seq = [];
	this.child = [];
	
	this.seq = g_DataConstructNodeCount;
	g_DataConstructNodeCount++;
}

//オブジェクトのデータ定義を抽出する
function AssembleObjFromJsonStr2(obj, dataConstructTopNode){
	g_DataConstructNodeCount = 0;
	var dataConstruct = dataConstructTopNode.child[0];
	return AssembleObjFromJsonStr(obj, dataConstruct);
}

//データ定義を参照しながら、JSON文字列をstrigify()でそのままパースしただけのオブジェクトをマップ付きのオブジェクトに変換する
//JSON文字列をstringify()でオブジェクト化したとき、元のJSON文字列に空の配列・マップ・オブジェクトが含まれててもOK
function AssembleObjFromJsonStr(obj, dataConstruct){
	var newVal;
	
	if(dataConstruct.type == PROP_TYPE_OBJECT_STR){
		newVal = {};
		dataConstruct.child.forEach( function(ch1){
			if(ch1.type == PROP_TYPE_OBJECT_STR ||
			   ch1.type == PROP_TYPE_ARRAY_STR ||
			   ch1.type == PROP_TYPE_MAP_STR){
			   
			   var retMem1 = AssembleObjFromJsonStr(obj[ch1.name], ch1);
			   
			   newVal[ch1.name] = retMem1;
			}else{
				newVal[ch1.name] = obj[ch1.name];
			}
		});
		return newVal;
		
	}else if(dataConstruct.type == PROP_TYPE_ARRAY_STR){
		var ch1 = dataConstruct.child[0];
		newVal = [];
		for(var i=0; i<obj.length; i++){
			if(ch1.type == PROP_TYPE_OBJECT_STR ||
			   ch1.type == PROP_TYPE_ARRAY_STR ||
			   ch1.type == PROP_TYPE_MAP_STR){
			   	var retElem1 = AssembleObjFromJsonStr(obj[i], ch1);
			   	newVal.push(retElem1);
			}else{
				newVal.push(obj[i]);
			}
		}
		return newVal;
		
	}else if(dataConstruct.type == PROP_TYPE_MAP_STR){
		var ch1 = dataConstruct.child[0];
		var key1;
		newVal = new Map();
		obj.forEach( function(entry1){
			key1 = entry1[0];
			if(ch1.type == PROP_TYPE_OBJECT_STR ||
			   ch1.type == PROP_TYPE_ARRAY_STR ||
			   ch1.type == PROP_TYPE_MAP_STR){
			   	var retVal1 = AssembleObjFromJsonStr(entry1[1], ch1);
			   	newVal.set(key1, retVal1);
			}else{
				newVal.set(key1, entry1[1]);
			}
		});
		return newVal;
	}else{
		newVal = obj;
	}
	
	return newVal;
}

function parseXML(xmlStr1){
        var xml = xmlStr1;
        // XMLのDOMをパースする
        var parser = new DOMParser();
        var dom = parser.parseFromString(xml, 'text/xml');
        return dom;
}

////XMLファイルで指定したデータ定義からデータ定義を抽出する(再帰のトップ)
function ExtractDataConstructFromMyXML(xmlStr1){

	var dom1 = parseXML(xmlStr1);
	
	g_DataConstructNodeCount = 0;
	
	var TopDataConstructNode = new DataConstruct();
	TopDataConstructNode.name = "";
	TopDataConstructNode.type = null;

	var rootNode = dom1.getElementsByTagName("rootVariable")[0];
	var rootVariableNode = getChildrenElemListByTag(rootNode, 'Variable');	
	ExtractDataConstructByMyXML2(rootVariableNode[0], TopDataConstructNode);	

	return TopDataConstructNode;
}

function getChildrenElemListByTag(dom1, tagName1){
	var resultVals = [];
	
	if(dom1.children != undefined){
		for(var i=0; i<dom1.children.length; i++){
			if(dom1.children[i].tagName == tagName1){
				resultVals.push(dom1.children[i]);
			}
		}
	}
	
	return resultVals;
}

function getChildrenValueTextByTag(dom1, tagName1){
	var resultVals = "";
	
	if(dom1.children != undefined){
		for(var i=0; i<dom1.children.length; i++){
			if(dom1.children[i].tagName == tagName1){
				resultVals = dom1.children[i].textContent;
				break;
			}
		}
	}
	
	return resultVals;
}

//XMLファイルで指定したデータ定義からデータ定義を抽出する
function ExtractDataConstructByMyXML2(dom1, parentDataConstructNode){
	var currentDataConstructNode = new DataConstruct();
	//DOMの値を取得
	var propType = getChildrenValueTextByTag(dom1, 'Type');

	currentDataConstructNode.name = getChildrenValueTextByTag(dom1, 'Name');
	currentDataConstructNode.type = propType;
	

	var childElem;	
	if(propType == PROP_TYPE_MAP_STR){
		childElem = getChildrenElemListByTag(dom1, 'Variable');
		if(childElem.length == 0){
			alert('マップの子要素のデータ定義がありません、データ構造の作成に失敗しました');
			return;
		}
		ExtractDataConstructByMyXML2(childElem[0], currentDataConstructNode);
		
	}else if(propType == PROP_TYPE_ARRAY_STR){
		childElem = getChildrenElemListByTag(dom1, 'Variable');	
		if(childElem.length == 0){
			alert('配列の子要素のデータ定義がありません、データ構造の作成に失敗しました');
			return;
		}	
		ExtractDataConstructByMyXML2(childElem[0], currentDataConstructNode);
		
	}else if(propType == PROP_TYPE_OBJECT_STR){
		var childElemList = getChildrenElemListByTag(dom1, 'Variable');	
		if(childElem.length == 0){
			alert('オブジェクトの子メンバのデータ定義がありません、データ構造の作成に失敗しました');
			return;
		}	
		for(var i=0; i<childElemList.length; i++){
			ExtractDataConstructByMyXML2(childElemList[i], currentDataConstructNode);
		}
	
	}
	
	parentDataConstructNode.child_seq.push(currentDataConstructNode.seq);
	parentDataConstructNode.child.push(currentDataConstructNode);


}


//オブジェクトからオブジェクトのデータ定義を抽出する(再帰のトップ)
function ExtractDataConstruct(obj){
	g_DataConstructNodeCount = 0;
	
	var TopDataConstructNode = new DataConstruct();
	TopDataConstructNode.name = "";
	TopDataConstructNode.type = null;
	
	ExtractDataConstruct2("",obj,TopDataConstructNode);
	return TopDataConstructNode;
}

//オブジェクトのデータ定義を抽出する(配列・マップ型についてはその型の子要素はすべて同じ型とする
function ExtractDataConstruct2(objNm, obj, parentDataConstructNode){
	var currentDataConstructNode = new DataConstruct();
	var propType = Object.prototype.toString.call(obj);

	currentDataConstructNode.name = objNm;
	currentDataConstructNode.type = propType;
	
	
	if(propType == PROP_TYPE_MAP_STR){
		if(obj.size == 0){
			alert('キーが0個のマップが含まれています、データ定義の抽出に失敗しました');
			return null;
		}
	
		for(var [key1, val1] of obj.entries()){
			ExtractDataConstruct2("",val1,currentDataConstructNode);
			break;
		}
	}else if(propType == PROP_TYPE_ARRAY_STR){
		if(obj.length == 0){
			alert('要素が0個の配列が含まれています、データ定義の抽出に失敗しました');
			return null;
		}
		var headObj = obj[0];
		ExtractDataConstruct2("", headObj, currentDataConstructNode);
		
	}else if(propType == PROP_TYPE_OBJECT_STR){
		//オブジェクトの各メンバを取得
		var propNameAndTypeMap = GetPropsAndType(obj);

		for (var propName of propNameAndTypeMap.keys()) {
			ExtractDataConstruct2(propName, obj[propName], currentDataConstructNode);
		}
	
	}
	
	parentDataConstructNode.child_seq.push(currentDataConstructNode.seq);
	parentDataConstructNode.child.push(currentDataConstructNode);
	
} 


//マップを含むオブジェクトをJson変換処理用に整形する、戻り値：整形後のオブジェクト
function ShapingObjForJson(fromObj){
	var propNameAndTypeMap;
	var propType;
	var resultObj = {};
	var tempValObj = {};
	var convertedArray;
	var jsonStr1;
	var obj1;
	var ObjType = Object.prototype.toString.call(fromObj);
	
	if(ObjType == PROP_TYPE_ARRAY_STR){//配列型オブジェクトが来た場合		
		resultObj = [];
		var elem2;
		fromObj.forEach( function( elem1 ){
			
			//配列の各要素を整形したものをセット
			elem2 = ShapingObjForJson(elem1);
			resultObj.push(elem2);
			
			
		});
		
	}else if(ObjType == PROP_TYPE_OBJECT_STR){//オブジェクト型が来た場合
		resultObj = {};
		
		//オブジェクトの各メンバを取得
		propNameAndTypeMap = GetPropsAndType(fromObj);
		
		for (var propName of propNameAndTypeMap.keys()) {
			propType = propNameAndTypeMap.get(propName);
			if(propType == PROP_TYPE_MAP_STR){//メンバがマップ型の時
							
				convertedArray = [];
				var entry1;
				var mapValType;
				var val2;
				for(var [key1, val1] of fromObj[propName]){
					entry1 = [];
					
					entry1.push(key1);
					
					//マップの各値を整形したものをセット
					val2 = ShapingObjForJson(val1);
					entry1.push(val2);
					
					convertedArray.push(entry1);
				}
				resultObj[propName] = convertedArray;
				
				
			}else if(propType == PROP_TYPE_OBJECT_STR){//メンバがオブジェクト型の時
				tempObj = ShapingObjForJson(fromObj[propName], propName);
				
				resultObj[propName] = tempObj;
				

			}else{//メンバがプリミティブ型の時
				resultObj[propName] = fromObj[propName];
			}
		}
		

	}else{//プリミティブ型が来た場合
		resultObj = fromObj
	
	}
	
	
	return resultObj;
	
}

//オブジェクトの各メンバとタイプのリストを取得する
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