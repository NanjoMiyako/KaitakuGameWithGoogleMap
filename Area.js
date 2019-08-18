//Areaのコンストラクタ等

//全エリアのリスト
g_AreaList = []

//クラスのコンストラクタ関係
//Areaのコンストラクタ
function Skill(areaType, lat1, lng1, lat2, lng2){
	this.areaType = areaType
	this.latitude1 = lat1
	this.longitude1 = lng1
	this.latitude2 = lat2
	this.longitude2 = lng2
 
}

Area.protype.isInArea = function IsInArea(lat, lng){
	if( lat >= latitude1 && lat <= latitude2){
		if(lng >= longitude1 && lng <= longitude2){
			return true
		}
	}
	return false
}

function GetInAreaList(lat, lng){
	var resultAreaList = [];
	
	for(var i=0; i<g_AreaList.length; i++){
		if(g_AreaList[i].isInArea(lat, lng)){
			resultAreaList.push(g_AreaList[i])
		}
	}
	
	return  resultAreaList
}

function GetAnableConstructBuiltTypeList(lat, lng){
	var areaList;
	var buildTypeList = [];
	var areaTypeInfo;
	
	areaList = GetInAreaList(lat, lng);
	for(var i=0; i<areaList.length; i++){
		areaTypeInfo = GetAreaTypeInfoByAreaType(areaList[i].areaType);
		for(var j=0; j<areaTypeInfo.anableConstructBuildTypeList.length; j++){
			if(!buildTypeList.includes(areaTypeInfo.anableConstructBuildTypeList[j])){
				buildTypeList.push(areaTypeInfo.anableConstructBuildTypeList[j]);
			}
		}
	}
	
	return buildTypeList;
}