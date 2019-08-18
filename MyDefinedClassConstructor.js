//Resource, Convert, BuildTypeInfo, BuildObjectのコンストラクタ等

//全資源と資源量のリスト(表示時には現在の資源量が1以上のもののみ表示するようにする)
var g_ResourceList = [];

//全変換のリスト(表示時には開放されている(lockedFlg=false)のもののみ表示するようにする)
var g_ConvertList = [];

//全建物情報のリスト(表示時にはg_BuildingList中に含まれる建物の建物情報のみ表示するようにする)
var g_BuildTypeInfoList = [];

//登録されている建物のリスト
var g_BuildingList = [];

//クラスのコンストラクタ関係
//Resourceのコンストラクタ
function Resource(resourceType, volume, grainSize, parentResourceType){
	this.resourceType = resourceType;
	this.volume = volume;
	this.grainSize = grainSize;
	if(grainSize == RES_GRAIN_SIZE_CONCREATE){
		this.parentResourceType = parentResourceType;
	}else{
		this.parentResourceType = null;
	}
}

function IsBuildTypeForManuallyConversion(buildType){
	if(buildType == BUILD_TYPE_BARN ||
      buildType == BUILD_TYPE_HOUSE ){
      	return true;
      }
    
    return false;
}

//Convertのコンストラクタ(変換に使用する具体的な資源リストのメンバに引数で指定された値を設定)
function Convert(convertType, noConsumptFlg, convertOrder,
 FromResVolInSmallestUnit, ToResVolInSmallestUnit, concreteResTypeListMapUsedForConverting,
 lockedFlg){
 	this.convertType = convertType;//変換の種類
 	this.noConsumptFlg = noConsumptFlg;//変換処理時に資源を消費しないかどうか
 	this.convertOrder = convertOrder;
 	this.FromResVolInSmallestUnit = FromResVolInSmallestUnit;
 	
 	//Toの資源の粒度はすべて具体的な資源である必要があるため、チェック
 	var Res1;
 	for([toResType, vol1] of ToResVolInSmallestUnit){
 		Res1 = GetResourceByResType(g_ResourceList, toResType);
 		if(Res1.grainSize == RES_GRAIN_SIZE_ROUGH){
 			alert('変換のTo資源の粒度が具体的でないものが含まれています、インスタンス化に失敗しました');
 			return null;
 		}else if(vol1 <= 0){
 			alert('変換のTo資源の最小量は1以上を設定してください、インスタンス化に失敗しました');
 			return null;
 		}
 	}
 	
 	this.ToResVolInSmallestUnit = ToResVolInSmallestUnit;
 	this.concreteResTypeUsedForConverting = concreteResTypeListMapUsedForConverting;
 	this.lockedFlg = lockedFlg;//変換が開放されているかどうか	
}

//Convertのコンストラクタ(変換に使用する具体的な資源リストのメンバにデフォルト値を設定)
function Convert(convertType, noConsumptFlg, convertOrder,
 FromResVolInSmallestUnit, ToResVolInSmallestUnit, lockedFlg){
 	this.convertType = convertType;//変換の種類
 	this.noConsumptFlg = noConsumptFlg;//変換処理時に資源を消費しないかどうか
 	this.convertOrder = convertOrder;
 	this.FromResVolInSmallestUnit = FromResVolInSmallestUnit;
 	
 	//Toの資源の粒度はすべて具体的な資源である必要があるため、チェック
 	var Res1;
 	for([toResType, vol1] of ToResVolInSmallestUnit){
 		Res1 = GetResourceByResType(g_ResourceList, toResType);
 		if(Res1.grainSize == RES_GRAIN_SIZE_ROUGH){
 			alert('変換のTo資源の粒度が具体的でないものが含まれています、インスタンス化に失敗しました');
 			return null;
 		}else if(vol1 <= 0){
 			alert('変換のTo資源の最小量は1以上を設定してください、インスタンス化に失敗しました');
 			return null;
 		}
 	}
 	
 	this.ToResVolInSmallestUnit = ToResVolInSmallestUnit;
 	this.concreteResTypeUsedForConverting = MakeDefaultConsumptTargetConcreteResTypeListMapByFromResVolListMap(FromResVolInSmallestUnit);
 	this.lockedFlg = lockedFlg;//変換が開放されているかどうか	
}

//(具体的・大まか)の資源タイプresType1の資源量を計算する
function CalcTotalResVolume(resType1){
	var concResList = GetConcreteResListByResType(resType1);
	var amount = 0;
	
	concResList.forEach( function(res1){
		amount += res1.volume;
	});
	
	return amount;
}

//変換前の各必要資源量リストのマップ(大まか・具体的の両方の粒度の資源を含む)から、
//デフォルト値としての、変換処理にて消費される具体的資源リストを作成する
function MakeDefaultConsumptTargetConcreteResTypeListMapByFromResVolListMap(FromResVolMap){
	//引数用のリストを作成
	var arg1 = [];
	for(var [key1, val1] of FromResVolMap){
		arg1.push(key1);
	}
	
	return MakeDefaultConsumptTargetConcreteResTypeListMapByResTypeList(arg1);
}

//変換前の各資源リスト(大まか・具体的の両方の粒度の資源を含む)から、
//変換で消費する粒度が'具体的'のもののみの資源のリストを抽出し、
//デフォルト値としての、変換処理にて消費される具体的資源リストのマップを作成する
function MakeDefaultConsumptTargetConcreteResTypeListMapByResTypeList(resTypeList){
	var resultMap = new Map();
	
	var key;
	var val;
	for(var i=0; i<resTypeList.length; i++){
		key = resTypeList[i];
		val = GetConcreteResTypeListByResType(key);
		resultMap.set(key, val);
	}
	
	return resultMap;
}

//リソースタイプから対応する粒度='具体的'の資源タイプのリストを作成する
function GetConcreteResTypeListByResType(resType){
	var resultList = [];
	
	var Resource1 = GetResourceByResType(g_ResourceList, resType);
	if(Resource1.grainSize == RES_GRAIN_SIZE_CONCREATE){
		resultList.push(Resource1.resourceType);
		
	}else{
		for(var i=0; i<g_ResourceList.length; i++){
			if(g_ResourceList[i].parentResourceType == Resource1.resourceType){
				resultList.push(g_ResourceList[i].resourceType);
			}
		}
	}
	
	return resultList;
}

//リソースタイプから対応する粒度='具体的'の資源のリストを作成する
function GetConcreteResListByResType(resType){
	var resultList = [];
	
	var Resource1 = GetResourceByResType(g_ResourceList, resType);
	if(Resource1.grainSize == RES_GRAIN_SIZE_CONCREATE){
		resultList.push(Resource1);
		
	}else{
		for(var i=0; i<g_ResourceList.length; i++){
			if(g_ResourceList[i].parentResourceType == Resource1.resourceType){
				resultList.push(g_ResourceList[i]);
			}
		}
	}
	
	return resultList;
}


//資源のタイプから資源を取得する
function GetResourceByResType(resourceList1, resType){
	for(var i=0; i<resourceList1.length; i++){
		if(resourceList1[i].resourceType == resType){
			return resourceList1[i];
		}
	}
	return null;
}

//建物区分と変換IDから最大変換量のデフォルト値を作成する
function MakeDefaultMaxConvVolMapOfBuilding(buildType, convType){
	var convert1 = GetConvertByConvType(convType);
	var buildTypeInfo1 = GetBuildTypeInfoByBuildType(buildType);
	
	var resultMap = new Map();
	//初期値をセット
	for(var [resType, resVol] of convert1.ToResVolInSmallestUnit){
		resultMap.set(resType, 0);
	}
	
	var canConvertAtOneLargeUnit = true;
	while(canConvertAtOneLargeUnit){
		//変換後の資源が一つでも最大量を超えたら変換しないようにする
		for(var [resType, resVol] of convert1.ToResVolInSmallestUnit){
			if((resultMap.get(resType) + resVol) > buildTypeInfo1.anableMaxConvertVolMapAtOneProcess.get(resType)){
				canConvertAtOneLargeUnit = false;
				break;
			}
		}
		
		if(canConvertAtOneLargeUnit == true){
			for(var [resType, resVol] of convert1.ToResVolInSmallestUnit){
				resultMap.set(resType, resultMap.get(resType) + resVol);
			}
		}		
	}
	
	return resultMap;

}

//変換タイプIDから変換を取得
function GetConvertByConvType(convType){
	for(var i=0; i<g_ConvertList.length; i++){
		if(g_ConvertList[i].convertType == convType){
			return g_ConvertList[i];
		}
	}
	return null;
}


//建物の種類から建物情報を取得
function GetBuildTypeInfoByBuildType(buildType){
	for(var i=0; i<g_BuildTypeInfoList.length; i++){
		if(g_BuildTypeInfoList[i].buildType == buildType){
			return g_BuildTypeInfoList[i];
		}
	}
	return null;
}

//BuildingTypeInfoのコンストラクタ
function BuildingTypeInfo(buildType, needStepForConvert, anableConvertList, anableMaxConvertVolMapAtOneProcess,
 needStepForConstruction, defaultConvertType, needResForConstruction, lockedFlg, description){
  this.buildType = buildType;
  this.needStepForConvert = needStepForConvert;//変換に必要なターン数
  this.anableConvertList = anableConvertList;
  this.anableMaxConvertVolMapAtOneProcess = anableMaxConvertVolMapAtOneProcess;//一回の変換処理での資源別最大生産可能量
  this.needStepForConstruction = needStepForConstruction;//建設に必要なターン数
  this.defaultConvertType = defaultConvertType;
  this.needResForConstruction = needResForConstruction;//建設に必要な資源
  this.lockedFlg = lockedFlg;
  this.description = description;
}

//BuildObjectのコンストラクタ
function BuildObject(buildId, buildType, status,
 passedStepCount, applyingConvertingType, convertMaxVolAtOneProcess,
 convertedVolAtOneProcess, convertOrderInSameConvert, name, latitude, longitude){
	this.buildId = buildId;
	this.buildType = buildType;
	this.status = status;
	this.passedStepCount  = passedStepCount;
	this.applyingConvertingType = applyingConvertingType;
	this.convertMaxVolAtOneProcess = convertMaxVolAtOneProcess;
	//一回の変換処理でどれだけ確定で変換できたか
	this.convertedVolAtOneProcess = convertedVolAtOneProcess;
	//同一の変換処理中での建物別の優先順位
	this.convertOrderInSameConvert = convertOrderInSameConvert;
	this.name = name;
	this.latitude = latitude;
	this.longitude = longitude;
}

//BuildObjectのコンストラクタ(建設中を新規作成)
function BuildObject(buildId, buildType, name, latitude, longitude){
	var buildTypeInfo1 = GetBuildTypeInfoByBuildType(buildType);
	
	this.buildId = buildId;
	this.buildType = buildType;
	this.status = BUILD_STS_KENSETU;
	this.passedStepCount = 0;
	
	if( !IsBuildTypeForManuallyConversion(buildType) ){
		this.applyingConvertingType = buildTypeInfo1.defaultConvertType;
		this.convertMaxVolAtOneProcess = MakeDefaultMaxConvVolMapOfBuilding(buildType, buildTypeInfo1.defaultConvertType);
	}else{
		this.applyingConvertingType = -1;
		this.convertMaxVolAtOneProcess = new Map();	
	}
	this.convertedVolAtOneProcess = new Map();
	this.convertOrderInSameConvert = 1;
	this.name = name;
	this.latitude = latitude;
	this.longitude = longitude;
	
}

//BuildObjectのコンストラクタ(建設済みのものを作成)
function BuildObjectConstructionAlready(buildId, buildType, name, latitude, longitude){
	var buildTypeInfo1 = GetBuildTypeInfoByBuildType(buildType);
	
	this.buildId = buildId;
	this.buildType = buildType;
	this.status = BUILD_STS_KADOU_AND_HENKAN_TAIKI;
	this.passedStepCount = 0;
	
	if( !IsBuildTypeForManuallyConversion(buildType) ){
		this.applyingConvertingType = buildTypeInfo1.defaultConvertType;
		this.convertMaxVolAtOneProcess = MakeDefaultMaxConvVolMapOfBuilding(buildType, buildTypeInfo1.defaultConvertType);
	}else{
		this.applyingConvertingType = -1;
		this.convertMaxVolAtOneProcess = new Map();	
	}
	this.convertedVolAtOneProcess = new Map();
	this.convertOrderInSameConvert = 1;
	this.name = name;
	this.latitude = latitude;
	this.longitude = longitude;

}

//IDから対応するBuildObjectを取得する
function GetBuildObjectById(id1){
	for(var i=0; i<g_BuildingList.length; i++){
		if(g_BuildingList[i].buildId == id1){
			return g_BuildingList[i];
		}
	}
	return null;
}

//位置から対応するBuildObjectを取得する
function GetBuildObjectByPosition(latitude, longitude){
	for(var i=0; i<g_BuildingList.length; i++){
		if(g_BuildingList[i].latitude == parseFloat(latitude.toPrecision(NUMBER_DIGIT_OF_PRECISION)) &&
		   g_BuildingList[i].longitude == parseFloat(longitude.toPrecision(NUMBER_DIGIT_OF_PRECISION)) ){
			return g_BuildingList[i];
		}
	}
	return null;
}

//buildObjectの稼働を再開する
BuildObject.prototype.startOperation = function StartOperation(){
	if(this.status == BUILD_STS_KENSETU ||
	   this.status == BUILD_STS_KADOU_AND_HENKAN ||
	   this.status == BUILD_STS_KADOU_AND_HENKAN_TAIKI){
	   	return;
	}
	
	this.status =  BUILD_STS_KADOU_AND_HENKAN_TAIKI;
}

//buildObjectの稼働を停止する
BuildObject.prototype.stopOperation = function StopOperation(){
	if(this.status == BUILD_STS_KENSETU ||
	   this.status == BUILD_STS_KADOU_TEISHI){
	   	return;
	}
	//変換確定量をクリアする
	this.convertedVolAtOneProcess = new Map();	
	
	this.status = BUILD_STS_KADOU_TEISHI;
}

//buildObjctの変換確定量から資源を生産する
BuildObject.prototype.produce = function Produce(){
	var Res1;
	for(let [concResType, resVol] of this.convertedVolAtOneProcess){
		Res1 = GetResourceByResType(g_ResourceList, concResType);
		Res1.volume += resVol;
	}
	this.convertedVolAtOneProcess = new Map();
}

//buildObjectから各Conc資源の消費量リストに基づいて、資源を消費
BuildObject.prototype.consume = function Consume(fromConcreteResVolMap){
	var Res1;
	
	var consumeOkFlg = true; //現在の資源量から消費が可能かどうか
	
	for(let [fromConcResType, resVol] of fromConcreteResVolMap){
		Res1 = GetResourceByResType(g_ResourceList, fromConcResType);
		if(Res1.volume < resVol){
			consumeOkFlg = false;
			break;
		}
	}
	
	if(consumeOkFlg == false){
		return false;
	}
	
	//消費可能な場合、消費
	for(let [fromConcResType, resVol1] of fromConcreteResVolMap){
		Res1 = GetResourceByResType(g_ResourceList, fromConcResType);
		Res1.volume -= resVol1;
	}
	
	//変換確定量を更新
	var conv1 = GetConvertByConvType(this.applyingConvertingType);
	for(let [toConcResType, resVol2] of conv1.ToResVolInSmallestUnit){
		Res1 = GetResourceByResType(g_ResourceList, toConcResType);
		
		if(!this.convertedVolAtOneProcess.has(toConcResType)){
			this.convertedVolAtOneProcess.set(toConcResType, 0);
		}
		this.convertedVolAtOneProcess.set(toConcResType, this.convertedVolAtOneProcess.get(toConcResType)+resVol2);
	}
	
	return true;	
}

//convert1の最小単位の変換を実行したときにbuildObj1の変換確定量が変換可能最大量を超えるかどうか判定する
function isConvertionVolumeExceedTheMaxConvertibleAmount(convert1, buildObj1){
	
	for([concResType, resVol] of convert1.ToResVolInSmallestUnit){
		if( buildObj1.convertedVolAtOneProcess.has(concResType) &&
			resVol + buildObj1.convertedVolAtOneProcess.get(concResType) > buildObj1.convertMaxVolAtOneProcess.get(concResType)){
			return true;
		}
	}
	
	return false;	
}
//convert1の変換が現在の資源量から可能かどうか計算し、できた場合は変換元のconcResの各消費量の配合候補のリストを戻す
function isEnableConvert(convert1, resultHaigouKouhoList){
	var ResList_temp = deepCloneArray(g_ResourceList);
	var needResVolMap_temp = deepCloneMap(convert1.FromResVolInSmallestUnit);
	var fixedConsumptionTargetConcreteResVolMap = new Map();

	//まずそれぞれのFromResから重なっていないConcResのリストを取得する	
	var onlyUsedConcreteResTypeList = getOnlyUsedConcreteResTypeList(convert1);

	//それらのResを減らせるだけResList_tempから減らす
	var Res1;
	var restNeedVol;
	var consumptVol;
	for([resType1, concResTypeList] of convert1.concreteResTypeUsedForConverting){
		concResTypeList.forEach( function(concResType){
			if(onlyUsedConcreteResTypeList.includes(concResType)){
				Res1 = GetResourceByResType(ResList_temp, concResType);
				restNeedVol = needResVolMap_temp.get(resType1);
				if(restNeedVol >= Res1.volume){
					consumptVol = Res1.volume;
					needResVolMap_temp.set(resType1, restNeedVol - consumptVol);
					Res1.volume = 0;
					
				}else{
					Res1.volume -= restNeedVol;
					consumptVol = restNeedVol;
					needResVolMap_temp.set(resType1, 0);
					
				}
				fixedConsumptionTargetConcreteResVolMap.set(concResType, consumptVol);
			}
		});
	}
	
	//変換に使用するConcResの種類を選択
	var usingConcreteResTypeMap = new Map();
	var retVal;
	retVal = PickUpUsingConcreteResTypeMapByResVol(ResList_temp, needResVolMap_temp, convert1, usingConcreteResTypeMap);
	if(retVal == false){//変換に使用するConcResの種類が選択できなかった(資源量が足りない)場合、変換不可能
		return false;
	}
	
	//必要資源量が1以上残っている資源のfrom資源量(具/大まか含む)のリスト作成
	var resList = [];
	for([resType1, concResTypeList] of usingConcreteResTypeMap){
		if(needResVolMap_temp.get(resType1) >= 1){
			resList.push(resType1);
		}
	}
	
	//すでに必要資源量がfixedConsumptionTargetConcreteResVolMapの消費でまかなえる場合はそのマップを返す
	if(resList.length == 0){
		resultHaigouKouhoList.push(fixedConsumptionTargetConcreteResVolMap);
		return true;
	}
	
	//使うfromResの種類のリストを配合の組み合わせが少ない順にソート(仕切り付き組み合わせの考え方から)
	resList.sort( function(a, b){
		var a_combiNum = CalcNumberOfCombination(needResVolMap_temp.get(a.resourceType), usingConcreteResTypeMap.get(a.resourceType).length-1);
		var b_combiNum = CalcNumberOfCombination(needResVolMap_temp.get(b.resourceType), usingConcreteResTypeMap.get(b.resourceType).length-1);
		if( a_combiNum < b_combiNum){
			return -1;
		}
		if( a_combiNum > b_combiNum){
			return 1;
		}
		return 0;
	});

	//リスト：配合率候補HK1を宣言
	//L1のトップのリソースの配合率の候補を算出し、HK1に格納する	
	var haigouKouhoList1;
	haigouKouhoList1 = createAllBlendingRatioCombinationOfConcreteRes(usingConcreteResTypeMap.get(resList[0]), needResVolMap_temp.get(resList[0]));

	//リスト：配合率候補HK2を宣言
	//リスト：配合率候補HK3を宣言	
	var haigouKouhoList2;
	var haigouKouhoList3;
	for(var i=1; i<resList.length; i++){
		//ソート順で次のリソースの配合率の候補を算出しHK2に格納する
		haigouKouhoList2 = createAllBlendingRatioCombinationOfConcreteRes(usingConcreteResTypeMap.get(resList[i]), needResVolMap_temp.get(resList[i]));

		//HK1, HK2の候補のうち同時に適用可能な配合率の組み合わせをマージしHK3に格納
		haigouKouhoList3 = GetApplicableBleandingRatioListInDoubleBlendingRatioCombiList(haigouKouhoList1, haigouKouhoList2, ResList_temp);
		
		//HK1の値をHK3に上書き
		haigouKouhoList1 = haigouKouhoList3;
		if(haigouKouhoList1.length == 0){//配合率候補がなくなった時点で変換不可能
			return false;
		}
	}
	
	//結果の配合率リストを格納
	for(var j=0; j<haigouKouhoList1.length; j++){		
		//各配合率についてfixedConsumptionTargetConcreteResVolMapの分も加味する
		for([concResType1, fixedConsumpVol] of fixedConsumptionTargetConcreteResVolMap){
			if(haigouKouhoList1[j].has(concResType1)){
				haigouKouhoList1[j].set(concResType1, haigouKouhoList1[j].get(concResType1) + fixedConsumpVol);
			}else{
				haigouKouhoList1[j].set(concResType1, fixedConsumpVol);
			}
		}
		
		resultHaigouKouhoList.push(haigouKouhoList1[j]);
	}
	
	return true;

}

function GetApplicableBleandingRatioListInDoubleBlendingRatioCombiList(haigouKouhoList1, haigouKouhoList2, allResVolList){
	var result1;
	var newVal;
	var haigou1;
	var haigou2;
	var keyList;
	var key1;
	
	result1 = [];
	for(var i=0; i<haigouKouhoList1.length; i++){
		haigou1 = haigouKouhoList1[i];
		for(var j=0; j<haigouKouhoList2.length; j++){
			newVal = null;
			haigou2 = haigouKouhoList2[j];
			
			if(isApplicableTheDoubleBlendingAtTheSameTime(haigou1, haigou2, allResVolList) == true){
				keyList = GetMergedKeySet(haigou1, haigou2);
				newVal = new Map();
				for(var k=0; k<keyList.length; k++){
					key1 = keyList[k];
					if(haigou1.has(key1) && haigou2.has(key1)){
						newVal.set(key1, haigou1.get(key1)+haigou2.get(key1));
					}else if(haigou1.has(key1)){
						newVal.set(key1, haigou1.get(key1));
					}else{
						newVal.set(key1, haigou2.get(key1));
					}
				}
				
			}
			
			if(newVal != null){
				result1.push(newVal);
			}
		}
	}
	
	return result1;
}
//concRes毎の2つの配合率リストが同時に適用可能かどうかチェックする
function isApplicableTheDoubleBlendingAtTheSameTime(blend1, blend2, allResVolList){
	var keyList = GetMergedKeySet(blend1, blend2);
	var Res1;
	var flg = true;
	var key1;
	
	//配合率に従って、concreteResの各資源量を減らす
	for(var i=0; i<keyList.length; i++){
		key1 = keyList[i];
		Res1 = GetResourceByResType(allResVolList, key1);
		if(blend1.has(key1)){
			Res1.volume -= blend1.get(key1);
		}
		if(blend2.has(key1)){
			Res1.volume -= blend2.get(key1);
		}
		if(Res1.volume < 0){//資源量が負の値になったらフラグをOFFに
			flg = false;
		}
		
		//減らした資源量を戻す
		if(blend1.has(key1)){
			Res1.volume += blend1.get(key1);
		}
		if(blend2.has(key1)){
			Res1.volume += blend2.get(key1);
		}
		
		if(flg == false){
			return false;
		}
	}
}

function GetMergedKeySet(map1, map2){
	var result1 = [];
	for([key1, val1] of map1){
		result1.push(key1);
	}
	
	for([key2, val2] of map2){
		if(!map1.has(key2)){
			result1.push(key2);
		}
	}
	return result1;
}

function CalcNumberOfCombination(n, r){
	var result1 = 1;
	var a=1;
	var b=1;
	
	for(i=0; i<r; i++){
		a = a*(n-i);
		b = b*(r-i);
	}
	result1 = a/b;
	return result1;
}

function PickUpUsingConcreteResTypeMapByResVol(allResVolList, needResVolMap, convert1, retValMap){
	var resVolList;
	var Res1;
	var amountVol;
	var amountVolOkFlg;
	var valOfMap;
	
	for([resType1, concResTypeList] of convert1.concreteResTypeUsedForConverting){
		//resVolListを作成
		resVolList = [];
		concResTypeList.forEach( function(concResType){
			Res1 = GetResourceByResType(allResVolList, concResType);
			resVolList.push(Res1);
		});
		
		//resVolListをリソースの資源量の降順でソート
		resVolList.sort( function(a, b){
			if(a.volume < b.volume){
				return 1;
			}
			if(a.volume > b.volume){
				return -1;
			}
			return 0;
		});
	
		amountVol = 0;	
		amountVolOkFlg = false;
		valOfMap = [];
		for(var i=0; i<resVolList.length; i++){
			valOfMap.push(resVolList[i].resourceType);
			amountVol += resVolList[i].volume;
			if(amountVol >= needResVolMap.get(resType1)){
				amountVolOkFlg = true;
				break;
			}
		}
		if(amountVolOkFlg == false){
			return false;
		}
		retValMap.set(resType1, valOfMap);
	}
	return true;

}

//convert1のfrom資源リストのうち重なっているconcrete資源のリストを抽出する
function getDuplicatedConcreteResTypeList(convert1){

	var retVal = [];
	var AppearedCountMap = new Map();
	
	for([resType, concResTypeList] of convert1.concreteResTypeUsedForConverting){
		concResTypeList.forEach( function(concResType){
			if(!AppearedCountMap.has(concResType)){
				AppearedCountMap.set(concResType, 1);
			}else{
				AppearedCountMap.set(concResType, AppearedCountMap.get(concResType));
			}
			
		});
	}
	
	for([concResType, appearedCount] of AppearedCountMap){
		if(appearedCount >= 2){
			retVal.push(concResType);
		}
	}
	
	return retVal;

}

//convert1のfrom資源リストのうち重なっていないconcrete資源のリストを抽出する
function getOnlyUsedConcreteResTypeList(convert1){
	var retVal = [];
	var AppearedCountMap = new Map();
	
	for([resType, concResTypeList] of convert1.concreteResTypeUsedForConverting){
		concResTypeList.forEach( function(concResType){
			if(!AppearedCountMap.has(concResType)){
				AppearedCountMap.set(concResType, 1);
			}else{
				AppearedCountMap.set(concResType, AppearedCountMap.get(concResType));
			}
			
		});
	}
	
	for([concResType, appearedCount] of AppearedCountMap){
		if(appearedCount == 1){
			retVal.push(concResType);
		}
	}
	
	return retVal;
}


//変換に使用する具体的資源のリストから配合率の候補の組み合わせを作成する
function createAllBlendingRatioCombinationOfConcreteRes(concreteResourceTypeList, maxVolume){
	var candidateList = genarateVolumeRatioList(maxVolume, concreteResourceTypeList.length);
	var retVal = [];
	
	var elem1;
	candidateList.forEach( function(candidate1) {
		elem1 = new Map();
		for(var i=0; i<concreteResourceTypeList.length; i++){
			elem1.set(concreteResourceTypeList[i], candidate1[i]);
		}
		retVal.push(elem1);
	});
	return retVal;
	
}
//トータルの配合量と使う'具体的な'資源の種類の個数から配合率の組み合わせを生成する
function genarateVolumeRatioList(totalVol, kindCount){
	var array1 = [];
	var ret_array = [];
	
	genarateVolumeRatioiList2(totalVol, array1, 1, kindCount, ret_array);
	
	return ret_array;
}
function genarateVolumeRatioiList2(rest, pre, currentDeep, maxDeep, returnArray1){

	if(currentDeep < maxDeep){
		for(var i=0; i<rest; i++){
			var array2 = pre.slice(0);
			array2.push(i);
			genarateVolumeRatioiList2(rest-i, array2, currentDeep+1, maxDeep, returnArray1);
		}
	}else{
		var array3 = pre.slice(0);
		array3.push(rest);
		returnArray1.push(array3);
	}
	
	return;

}

