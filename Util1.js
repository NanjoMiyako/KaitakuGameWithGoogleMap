function makeCurrentDateTimeStr(){
    return makeDateStr(new Date());
}

//Date型から'YYYY/MM/DD hh:mm'の文字列を作成する
function makeDateStr(dateVal){
    if(dateVal == null || dateVal == ""){
        return "";
    }
    var year = dateVal.getFullYear();
    var month = dateVal.getMonth()+1;
    if(month < 10){
        month = "0"+month;
    }
    var date1 = dateVal.getDate();
    if(date1 < 10){
        date1 = "0"+date1;
    }
    var hour = dateVal.getHours();
    if(hour < 10){
        hour = "0"+hour;
    }
    var minute = dateVal.getMinutes();
    if(minute < 10){
        minute = "0"+minute;
    }
    
    return year+"/"+month+"/"+date1+" "+ hour + ":"+minute;
}
//YYYY/MM/DD hh:mmの文字列からDate型を取得する
function getDateFromDateTimeStr(dateStr){
	 var year1 = parseInt(dateStr.substring(0,5),10);
    //月はmonthIndexに変換
    var month1 = parseInt(dateStr.substring(5,7),10) - 1;
    var date1 = parseInt(dateStr.substring(8,10),10);
    var hour1 = parseInt(dateStr.substring(11,13),10);
    var minute1 = parseInt(dateStr.substring(14,16),10);
    
    return new Date(year1, month1, date1, hour1, minute1);
}

function isObject (value) {
  return value !== null && typeof value !== 'undefined' && Object(value) === value;
}

function deepCloneArray(array1){
	let r = [];
	
	for(var i=0; i<array1.length; i++){
		let v1 = array1[i];		
		let propType = Object.prototype.toString.call(v1);
		if(propType == PROP_TYPE_OBJECT_STR){
			v2 = deepCloneObject(v1);
		}else if(propType == PROP_TYPE_MAP_STR){
			v2 = deepCloneMap(v1);
		}else{
			v2 = v1;
		}
				
		r.push(v2);
	}
	return r;
}

function deepCloneMap(map1){
	let r = new Map();
	
	for([key1, val1] of map1){
		let v2;
		let propType = Object.prototype.toString.call(val1);
		if(propType == PROP_TYPE_OBJECT_STR){
			v2 = deepCloneObject(val1);
		}else if(propType == PROP_TYPE_MAP_STR){
			v2 = deepCloneMap(va1);
		}else{
			v2 = val1;
		}

		r.set(key1, v2);
	}
	return r;
}

function deepCloneObject(obj){

    let r = {}
    let propType;
    for(var member1 in obj){
        propType = Object.prototype.toString.call(obj[member1]);
        if(propType == PROP_TYPE_OBJECT_STR){
            r[member1] = deepCloneObject(obj[member1])
        }else if(propType == PROP_TYPE_ARRAY_STR){
            var v2;
            
            v2 = deepCloneArray(obj[member1]);
            r[member1] = v2;
        }else if(propType == PROP_TYPE_MAP_STR){
        	var v3;
        	
        	v3 = deepCloneMap(obj[member1]);
        	r[member1] = v3;
        }else{
        	r[member1] = obj[member1];
        }
    }
    return r

}


//[0,1,2,...]のような配列を長さlength1で作成する
function makeNumberArray(length1){
	return makeNumberArray2(0, length1);
}

function makeNumberArray2(startVal,  length1){
	var ret = [];
	for(i=0; i<length1; i++){
		ret.push(i+startVal);
	}
	return ret;
}

//テーブルにthタグを追加
function setTHRow(tableId, thArray, headerColor){
    var Tbl = document.getElementById(tableId);
    var thRow = Tbl.insertRow(0);

    thArray.forEach( function( thVal, idx ){
        var thObj = document.createElement("th");
        thObj.innerHTML = thVal;
        thObj.style.border = '2px solid' + headerColor;
        thRow.appendChild(thObj);
    });
}

//半角1文字・全角2文字として文字数をカウント
function getLen(str){
  var result = 0;
  for(var i=0;i<str.length;i++){
    var chr = str.charCodeAt(i);
    if((chr >= 0x00 && chr < 0x81) ||
       (chr === 0xf8f0) ||
       (chr >= 0xff61 && chr < 0xffa0) ||
       (chr >= 0xf8f1 && chr < 0xf8f4) ){
      //半角文字の場合は1を加算
      result += 1;
    }else{
      //それ以外の文字の場合は2を加算
      result += 2;
    }
  }
  //結果を返す
  return result;
}

//入力キーワードが' 'で区切られて入力されることを想定した場合のオートコンプリートを設定する
function SetAutoCompleteOnInputOfMultipleKeyword(targetTextboxId, keywordList, kanaYomiMap){
	//入力時のオートコンプリートを設定する
    $('#'+targetTextboxId).autocomplete(
    {
     delay: 500,
	 source : function(request, response) {
	 			var keylist = [];
	 			var resultKeywordAndSearcheIndexList = [];
	 			var keywordAndSearchedIndex;
	 			var searchedIndex1;
	 			var searchedIndex2;
	 			var searchedIndex3;
	 			
	 			var keyStr;
	 			var kanaStr;
	 			var hiraStr;
	 			var term_list = request.term.trim().split(' ');
	 			var term_list_pre;
	 			var term_end_ch = request.term.slice(-1);
	 			var term_list_pre_str;
	 			
	 			var current_term;
	 			//入力が半角スペースで終わっていたら現在の入力中のキーワードは何も入力されていないとする
	 			if(term_end_ch != ' '){
	 				term_list_pre = term_list.slice(0, term_list.length-1);
	 				term_list_pre_str = term_list_pre.join(' ');
	 			 	current_term = term_list[term_list.length-1];
	 			}else{
	 				term_list_pre = term_list.slice(0, term_list.length);
	 				term_list_pre_str = term_list_pre.join(' ');
	 				current_term = '';
	 			}
	 			//入力からオートコンプリートのキーワード(と見つかった位置)のリストをセットする
				for(var i=0; i<keywordList.length; i++){
					keyStr = keywordList[i];
					kanaStr = kanaYomiMap.get(keyStr);
					hiraStr = kanaToHira(kanaStr);

					if(term_list_pre.includes(keyStr)){//すでに前の検索項目中に入っているキーワードの場合オートコンプリートリストから外す
						continue;
					}
					
					if( (searchedIndex1 = keyStr.indexOf(current_term) )  != -1 ||
					    (searchedIndex2 = kanaStr.indexOf(current_term) ) != -1 ||
					    (searchedIndex3 = hiraStr.indexOf(current_term) ) != -1){
					    
						keywordAndSearchedIndex = [];
						keywordAndSearchedIndex.push(keyStr);
						if(searchedIndex1 != -1){
							keywordAndSearchedIndex.push(searchedIndex1);
						}else if(searchedIndex2 != -1){
							keywordAndSearchedIndex.push(searchedIndex2);
						}else{
							keywordAndSearchedIndex.push(searchedIndex3);
						}
						resultKeywordAndSearcheIndexList.push(keywordAndSearchedIndex);
						
					}
				}
				
				//入力から何も候補が絞れなかったらすべての候補を表示する
				if(resultKeywordAndSearcheIndexList.length == 0){
					keylist = keywordList;
				}else{//そうでなければ、見つかった位置順でソートして表示用キーワードリストを作成する
					resultKeywordAndSearcheIndexList.sort( function(a, b){
						if(a[1] < b[1]){
							return -1;
						}
						if(a[1] > b[1]){
							return 1;
						}
						return 1;
					});
					
					for(var k=0; k<resultKeywordAndSearcheIndexList.length; k++){
						keylist.push(term_list_pre_str+' '+resultKeywordAndSearcheIndexList[k][0]);
					}
				}
				
	            response(keylist);
	        }
	}
	);

}

//入力時のオートコンプリートを設定する
function SetAutoCompleteOnInput(targetTextboxId, keywordList, kanaYomiMap){

	//入力時のオートコンプリートを設定する
    $('#'+targetTextboxId).autocomplete(
    {
     delay: 500,
	 source : function(request, response) {
	 			var keylist = [];
	 			var resultKeywordAndSearcheIndexList = [];
	 			var keywordAndSearchedIndex;
	 			var searchedIndex1;
	 			var searchedIndex2;
	 			var searchedIndex3;
	 			
	 			var keyStr;
	 			var kanaStr;
	 			var hiraStr;
	 			//入力からオートコンプリートのキーワード(と見つかった位置)のリストをセットする
				for(var i=0; i<keywordList.length; i++){
					keyStr = keywordList[i];
					kanaStr = kanaYomiMap.get(keyStr);
					hiraStr = kanaToHira(kanaStr);
					
					if( (searchedIndex1 = keyStr.indexOf(request.term) )  != -1 ||
					    (searchedIndex2 = kanaStr.indexOf(request.term) ) != -1 ||
					    (searchedIndex3 = hiraStr.indexOf(request.term) ) != -1 ){
					    
						keywordAndSearchedIndex = [];
						keywordAndSearchedIndex.push(keyStr);
						if(searchedIndex1 != -1){
							keywordAndSearchedIndex.push(searchedIndex1);
						}else if(searchedIndex2 != -1){
							keywordAndSearchedIndex.push(searchedIndex2);
						}else{
							keywordAndSearchedIndex.push(searchedIndex3);
						}
						resultKeywordAndSearcheIndexList.push(keywordAndSearchedIndex);
						
					}
				}
				
				//入力から何も候補が絞れなかったらすべての候補を表示する
				if(resultKeywordAndSearcheIndexList.length == 0){
					keylist = keywordList;
				}else{//そうでなければ、見つかった位置順でソートして表示用キーワードリストを作成する
					resultKeywordAndSearcheIndexList.sort( function(a, b){
						if(a[1] < b[1]){
							return -1;
						}
						if(a[1] > b[1]){
							return 1;
						}
						return 1;
					});
					
					for(var k=0; k<resultKeywordAndSearcheIndexList.length; k++){
						keylist.push(resultKeywordAndSearcheIndexList[k][0]);
					}
				}
				
	            response(keylist);
	        }
	}
	);

}

//データリストに値をセット
function setDataList(dataListId, valList){
	var dataList = document.getElementById(dataListId);
	
	//データリストのoptionをクリア
	while(dataList.firstChild != null){ dataList.removeChild(dataList.firstChild); }
	
	for(var i=0; i<valList.length; i++){
        let op = document.createElement("option");
        op.value = valList[i];
        dataList.appendChild(op);
	}

}
//カタカナ->ひらがな変換
function kanaToHira(str) {
    return str.replace(/[\u30a1-\u30f6]/g, function(match) {
        var chr = match.charCodeAt(0) - 0x60;
        return String.fromCharCode(chr);
    });
}
//ひらがな->カタカナ変換
function hiraToKana(str) {
    return str.replace(/[\u3041-\u3096]/g, function(match) {
        var chr = match.charCodeAt(0) + 0x60;
        return String.fromCharCode(chr);
    });
}

//マップのキーの個数をカウント
function getNumberOfKeyInMap(map1){
	var result1 = 0;
	for([key1, val1] of map1){
		result1++;
	}
	return result1;
}


//[1, 2, ... , n](要素の数)+[sh1, sh2, ... , sh_m](仕切りの数) を元の配列としたときに
//引数(各仕切りの位置, 仕切りの数+要素数n)から仕切り別の個数のリストを作成する
function getVolumeListByShikiriIdxList(shikiriIdxList, maxVol){
	var ret = [];
	var elemCount = maxVol+shikiriIdxList.length-1;
	var shiftCount = 0;
	
	var count1;
	var rest = maxVol;
	for(var i=0; i<shikiriIdxList.length; i++){
		if(i == 0){
			count1 = shikiriIdxList[0];
			rest -= count1;
			ret.push(shikiriIdxList[0]);
		}else{
			count1 = shikiriIdxList[i] - (shikiriIdxList[i-1]+1);
			rest -= count1;
			ret.push(count1);
		}
	}
	ret.push(rest);
	
	return ret;
}

function GetDeviceType(){
    var ua = navigator.userAgent;
    if(ua.indexOf('iPhone') > 0 ||
       ua.indexOf('iPod') > 0 ||
       ( ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0) ){
               return 'smartPhone';
    }else if(ua.indexOf('iPad') > 0 ||
                ua.indexOf('Android') > 0){
               return 'tablet';
    }else{
               return 'other';
    }
}

