

//GoogleAPIキー
var GoogleAPIKey = ''
var g_MapOpts;
var g_Map;
var deviceType = GetDeviceType();

//現在クリックしているマーカに対応する建物
var g_CurrentBuildingObject = null;

var dataLoadedFlg = false;
var resourceMaxSeq = 1;
var convertMaxSeq = 1;
var buildTypeInfoMaxSeq = 1;
var buildObjectMaxSeq = 1;


//テスト用
//Test1();
//Test2();
//Test3();

//タブ初期化
InitTab();
InitResourceList();
InitConvertList();
InitBuildInfoList();
InitManuallyConvertList();
InitToolList();
InitActionList();
InitUserInfo();
InitJpTermAndKanaYomiMap();
HiddenAllTab();



function OutputForDebug(){
	var elem1 = document.getElementById("forDebugP1");
	var elem2 = document.getElementById("forDebugP2");
	var elem3 = document.getElementById("forDebugP3");
	elem1.innerHTML = '';
	elem2.innerHTML = '';
	elem3.innerHTML = '';
	
	/*
	
	var dc1 = ExtractDataConstructFromMyXML(xmlMyStr1);
	var jsonStr1 = JSON.stringify(dc1);
	elem1.innerText = jsonStr1;
	
	convdObj1 = ShapingObjForJson(g_BuildingList);
	jsonStr1 = JSON.stringify(convdObj1);
	elem2.innerText = jsonStr1;
	
	var asmObj1 = AssembleObjFromJsonStr2(convdObj1, dc1);
	*/
	
	var totalVol = 6;
	var kindNum = 3;
	
	var combiList1 = genarateVolumeRatioList(totalVol, kindNum);
	var tyougou1;
	for(var i=0; i<combiList1.length; i++){
		tyougou1 = combiList1[i];
		for(var j=0; j<tyougou1.length; j++){
			if(j == 0){
				elem1.innerHTML += '[ ';
				elem1.innerHTML += tyougou1[0];
			}else{
				elem1.innerHTML += ', ';
				elem1.innerHTML += tyougou1[j];
				
			}
			
			if(j == tyougou1.length-1){
				elem1.innerHTML += ' ]'
				elem1.innerHTML += '<br>'
				
			}
		}
	}
	
	

	

}

function SettingTestData(){
	var lat;
	var lng;
	
	lat = 34.91638622116592;
	lat = parseFloat(lat.toPrecision(NUMBER_DIGIT_OF_PRECISION));
	lng = 135.8030598088685;
	lng = parseFloat(lng.toPrecision(NUMBER_DIGIT_OF_PRECISION));
	AddBuildingObject(BUILD_TYPE_PADDY_FIELD, lat, lng);
	
	lat = 34.91735394256235;
	lat = parseFloat(lat.toPrecision(NUMBER_DIGIT_OF_PRECISION));
	lng = 135.8068578168336;
	lng = parseFloat(lng.toPrecision(NUMBER_DIGIT_OF_PRECISION));
	AddBuildingObject(BUILD_TYPE_LUMBER_CAMP, lat, lng);
	
	lat = 34.917886;
	lat = parseFloat(lat.toPrecision(NUMBER_DIGIT_OF_PRECISION));
	lng = 135.806278;
	lng = parseFloat(lng.toPrecision(NUMBER_DIGIT_OF_PRECISION));
	AddBuildingObjectConstructionAlready(BUILD_TYPE_BARN, lat, lng);
	
	lat = 34.916738121171264;
	lat = parseFloat(lat.toPrecision(NUMBER_DIGIT_OF_PRECISION));
	lng = 135.8050768300477;
	lng = parseFloat(lng.toPrecision(NUMBER_DIGIT_OF_PRECISION));
	AddBuildingObjectConstructionAlready(BUILD_TYPE_HOUSE, lat, lng);
	
	OutputForDebug();
}



g_StepCount = 0;

//'1ステップ進める'ボタンを押したときの動作
function AdvanceOneStep(){
	var underConstructionBuildings;
	var underConvertingBuildings;
	var waitingForConversionBuildings;
	var appliedConversionList;

	g_StepCount++;
	var stepCountElem = document.getElementById("keikaStep1");
	stepCountElem.innerHTML = g_StepCount;
	
	//'建設中'の建物についての処理
	underConstructionBuildings = GetUnderConstructingBuildings(g_BuildingList);
	underConstructionBuildings.forEach( function(buildObj1){
		var buildInfo1 = GetBuildTypeInfoByBuildType(buildObj1.buildType);
		buildObj1.passedStepCount++;
		if(buildObj1.passedStepCount > buildInfo1.needStepForConstruction){
			buildObj1.status = BUILD_STS_KADOU_AND_HENKAN_TAIKI;
			buildObj1.passedStepCount = 0;
			buildObj1.convertedVolAtOneProcess = new Map();
			
			alert('建設タイプ:'+buildObj1.buildType+'の建設が完了しました');
		}
	});
	
	//'稼働中(変換中)'の建物についての処理
	underConvertingBuildings = GetKadouAndHenkan_TyuBuildings(g_BuildingList);
	underConvertingBuildings.forEach( function(buildObj1){
		var buildInfo1 = GetBuildTypeInfoByBuildType(buildObj1.buildType);
		buildObj1.passedStepCount++;
		if(buildObj1.passedStepCount > buildInfo1.needStepForConvert){
			buildObj1.status = BUILD_STS_KADOU_AND_HENKAN_TAIKI;
			buildObj1.passedStepCount = 0;
			buildObj1.produce();
			
			alert('建設タイプ:'+buildObj1.buildType+'での生産が完了しました');
		}
	});
	
	//'稼働中(変換待機)'の建物について処理
	waitingForConversionBuildings = GetKadouAndHenkanTaiki_TyuBuildings(g_BuildingList);
	appliedConversionList = GetListOfAppliedConversion(waitingForConversionBuildings);
	
	//変換順序にしたがってリストappliedConversionListをソート
	appliedConversionList.sort( function(a, b){
		if(a.convertOrder < b.convertOrder){
			return -1;
		}
		if(a.convertOrder > b.convertOrder){
			return 1;
		}
		return 0;
	});
	
	var conv1;
	var targetBuildObjList;
	//各変換について
	for(var i=0; i<appliedConversionList.length; i++){
		conv1 = appliedConversionList[i];
		//conv1を適用している建物リストを取得
		targetBuildObjList = GetBuildingsByAppliedConversionType(waitingForConversionBuildings, conv1.convertType);
		
		//targetBuildObjListを同一変換中での優先順位値に従ってソート
		targetBuildObjList.sort( function(a, b){
			if(a.convertOrderInSameConvert < b.convertOrderInSameConvert){
				return -1;
			}
			if(a.convertOrderInSameConvert > b.convertOrderInSameConvert){
				return 1;
			}
			return 0;
		});
		
		var consumeKohoList;
		var randomIdx;
		var amountToResVol;
		var consume1;
		var consumedOkFlg;
		var targetBuildObj1;
		for(var j=0; j<targetBuildObjList.length; j++){
			targetBuildObj1 = targetBuildObjList[j];
			consumeKohoList = [];
			
			if(isEnableConvert(conv1, consumeKohoList) == true){
				//消費候補からランダムで選択
				if(consumeKohoList.length >= 2){
					randomIdx = Math.round( Math.random() * (consumeKohoList.length-1) );
				}else{
					randomIdx = 0;
				}
				consume1 = consumeKohoList[randomIdx];
				
				//targetBuildObjの1変換での最大変換可能量を超えないまで消費
				while(!isConvertionVolumeExceedTheMaxConvertibleAmount(conv1, targetBuildObj1)){
					consumedOkFlg = targetBuildObj1.consume(consume1);
					if(consumedOkFlg == false){//消費中に資源が尽きたらbreak
						break;
					}
					
					//targetBuildObj1のステータスを更新
					if(targetBuildObj1.status == BUILD_STS_KADOU_AND_HENKAN_TAIKI){
						targetBuildObj1.status = BUILD_STS_KADOU_AND_HENKAN;
						targetBuildObj1.passedStepCount = 0;
					}
				}
				
			}else{//変換できなくなったら以降の建物での変換を止める
				break;
			}
		}
	}
	
	
}

//アクションの実行結果メッセージを表示
function OutputActionResult(message){
	var elem = document.getElementById("ActionResultMessageOnVariousOperationTab");
	if(elem.innerHTML != ''){
		elem.innerHTML += '<br>';
	}
	elem.innerHTML += message;
}

//アクションの実行結果メッセージをクリア
function ClearActionResult(){
	var elem = document.getElementById("ActionResultMessageOnVariousOperationTab");
	elem.innerHTML = '';
}

//各種動作タブのスタミナ表示のみ更新
function UpdateStaminaHyoji(){
	//スタミナ回復経過時間の表示をセット
	var span_CountRecoverySecond = document.getElementById("CountRecoverySecondOnVariousOperationTab");
	span_CountRecoverySecond.innerHTML = g_Count_RecoverySecond;
	if(g_Count_RecoverySecond <= 9){
		span_CountRecoverySecond.innerHTML = '0' + span_CountRecoverySecond.innerHTML;
	}
	
	//スタミナ値の表示をセット
	var progress1 = document.getElementById("StaminaOnVariousOperationTab");
	progress1.max = g_UserInfo.maxStamina;
	progress1.value = g_UserInfo.currentStamina;
	
	var span1 = document.getElementById("Span_StaminaValOnVariousOperationTab");
	span1.innerHTML = g_UserInfo.currentStamina + "/" + g_UserInfo.maxStamina;
	
}

//各種動作タブを選択したときの動作
function DisplayVariousOperationTab(){

	UpdateStaminaHyoji();

	//実行可能アクションリストを取得
	var actionList1 = GetEnableActionListWithNoNeedBuilding();
	
    var actionSelbox = document.getElementById("EnableActionOnVariousOperationTab");
 	
    //実行可能アクションのセレクトボックスをクリア
    while(actionSelbox.firstChild != null){ actionSelbox.removeChild(actionSelbox.firstChild); }
    
    var action;
    for(var i=0; i<actionList1.length; i++){
    	action = actionList1[i];
    	
        let op = document.createElement("option");
        op.value = action.actionType;
        op.text = ActionNameMap.get(action.actionType);        
        actionSelbox.appendChild(op);
    }
    
    var btn1 = document.getElementById("Btn_ExecuteActionOnVariousOperationTab");
    if(actionList1.length == 0){
    	btn1.disabled = true;
    }else{
    	btn1.disabled = false;
    }

}

function ExecuteActionOnVariousOperationTab(){

    var actionSelbox = document.getElementById("EnableActionOnVariousOperationTab");
    var actionType1 = parseInt(actionSelbox.options[actionSelbox.selectedIndex].value);
    var action1 = GetActionByActionType(actionType1);
    
    action1.work();
    
    DisplayVariousOperationTab();

}

//'変換を実行'ボタンを押したときの動作
function ExecuteManuallyConvert(){
	if(IsManuallyConvertPossible()){//手動変換可能だった場合
	
		//fromの資源量・工具量を減らす
    	for(var fromUnitListIdx=0; fromUnitListIdx<g_CurrentManuallyConvert.fromUnitList.length; fromUnitListIdx++){
    		unit1 = g_CurrentManuallyConvert.fromUnitList[fromUnitListIdx];

    		for(var typeListIdx=0; typeListIdx<unit1.typeList.length; typeListIdx++){
    			slider = document.getElementById('Slider_FromUnitIdx_'+fromUnitListIdx+'_TypeListIdx_'+typeListIdx);
    			
				if(unit1.unitDiv == UNIT_DIV_RESOURCE){
					var Res1 = GetResourceByResType(g_ResourceList, unit1.typeList[typeListIdx]);
					Res1.volume -= slider.value;
    			}else{
    				var Tool1 = GetToolByToolType(unit1.typeList[typeListIdx]);
					Tool1.volume -= slider.value;
    			}
    			
    		}
    	}
    	
    	//toの資源量・工具量を増やす
    	for(var toUnitListIdx=0; toUnitListIdx<g_CurrentManuallyConvert.toUnitList.length; toUnitListIdx++){
    		unit1 = g_CurrentManuallyConvert.toUnitList[toUnitListIdx];

			if(unit1.unitDiv == UNIT_DIV_RESOURCE){
				var Res1 = GetResourceByResType(g_ResourceList, unit1.typeList[0]);
				Res1.volume += unit1.volume;
			}else{
				var Tool1 = GetToolByToolType(unit1.typeList[0]);
				Tool1.volume += unit1.volume;
			}
    	}
    	
    	alert('変換が完了しました');
    	DisplayTab(TAB_NAME_MANUALLY_CONVERT);
		
	}
}

//手動変換タブで選択した変換が実行可能かどうか
function IsManuallyConvertPossible(){

    	for(var fromUnitListIdx=0; fromUnitListIdx<g_CurrentManuallyConvert.fromUnitList.length; fromUnitListIdx++){
    		unit1 = g_CurrentManuallyConvert.fromUnitList[fromUnitListIdx];
    		
    		var slider;
    		var totalVol = 0;
			var vol;
    		for(var typeListIdx=0; typeListIdx<unit1.typeList.length; typeListIdx++){
    			slider = document.getElementById('Slider_FromUnitIdx_'+fromUnitListIdx+'_TypeListIdx_'+typeListIdx);
    			
				if(unit1.unitDiv == UNIT_DIV_RESOURCE){
					var Res1 = GetResourceByResType(g_ResourceList, unit1.typeList[typeListIdx]);
					if(Res1.volume < slider.value){
						alert('資源量が足りません');
						return false;
					}
    				totalVol += parseInt(slider.value);
    			}else{
    				var Tool1 = GetToolByToolType(unit1.typeList[typeListIdx]);
    				if(Tool1.volume < slider.value){
    					alert('工具量が足りません');
    					return false;
    				}
    				totalVol += parseInt(slider.value);
    			}
    			
    		}
    		if(totalVol != unit1.volume){
    			alert('選択量と変換に必要な消費量が違っています: From'+(fromUnitListIdx+1));
    			return false;
    		}
    		
    	}
    	
    	return true;
}

function GoSelectMConvTypeTab(){
	HiddenAllTab();
	DisplayTab(TAB_NAME_SELECT_MANUALLY_CONVERT_TYPE);
	
}

function SelectOnSelectManuallyConvertTypeTab(){
	var radioList1 = document.getElementsByName( "searchResultManuallyConvertOnSelectManuallyConvertTypeTab");
	
	for(var i=0; i<radioList1.length; i++){
		if(radioList1[i].checked){
			g_CurrentManuallyConvert = GetManuallyConvertByManuallyConvertType(parseInt(radioList1[i].value));
		}
	}
	if(g_CurrentManuallyConvert == null){
		alert("適用する変換を選択してください");
		return;
	}
	
	HiddenAllTab();
	DisplayTab(TAB_NAME_MANUALLY_CONVERT);

}

function SearchOnSelectManuallyConvertTypeTab(){
	var MConvName1 = document.getElementById("ManuallyConvertTypeNameOnSelectManuallyConvertTypeTab").value;
	var FromResNm1 = document.getElementById("FromResNameOnSelectManuallyConvertTypeTab").value;
	var FromToolNm1 = document.getElementById("FromToolOnSelectManuallyConvertTypeTab").value;
	var ToResNm1 = document.getElementById("ToResNameOnSelectManuallyConvertTypeTab").value;
	var ToToolNm1 = document.getElementById("ToToolOnSelectManuallyConvertTypeTab").value;
	
	var searchResultMConvList = SearchManuallyConvert(MConvName1, FromResNm1, FromToolNm1, ToResNm1, ToToolNm1);
	
	DisplayManuallyConvertList(searchResultMConvList);

}

function DisplayManuallyConvertList(manuallyConvertList1){

	var manuallyConvertListTbl = document.getElementById("manuallyConvertListTableOnOnSelectManuallyConvertTypeTab");
	manuallyConvertListTbl.style.display = 'none';

    //表のすべての行の削除
    while(manuallyConvertListTbl.rows[0]){ manuallyConvertListTbl.deleteRow(0); }
	
	//ヘッダの作成
	setTHRow("manuallyConvertListTableOnOnSelectManuallyConvertTypeTab", 
	["", "変換名", "消費資源:量", "消費工具:量", "作成資源:量", "作成工具:量"], COLOR_GREEN_STR);
	
	//表(内容の作成)
	var unit1;
	for(var i=0; i<manuallyConvertList1.length; i++){
		MConv1 = manuallyConvertList1[i];
		var tr1 = manuallyConvertListTbl.insertRow(-1);
		
		var conv_radio_td = tr1.insertCell(-1);
		conv_radio_td.style.border = 'solid';
		
		//ラジオボタンを作成
		var radio1 = document.createElement('input');
		radio1.type = "radio";
		radio1.name =  "searchResultManuallyConvertOnSelectManuallyConvertTypeTab";
		radio1.value = MConv1.manuallyConvertType;
		
		conv_radio_td.appendChild(radio1);
		
		var conv_name_td = tr1.insertCell(-1);
		conv_name_td.style.border = 'solid';
		conv_name_td.innerHTML = M_HenkanNameMap.get(MConv1.manuallyConvertType);
		
		//消費資源・消費工具欄の表示を設定
		var conv_from_res_td = tr1.insertCell(-1);
		conv_from_res_td.style.border = 'solid';
		conv_from_res_td.innerHTML = '';
		
		var conv_from_tool_td = tr1.insertCell(-1);
		conv_from_tool_td.style.border = 'solid';
		conv_from_tool_td.innerHTML = '';
		
		for(var j=0; j<MConv1.fromUnitList.length; j++){
			unit1 = MConv1.fromUnitList[j];
			if(unit1.unitDiv == UNIT_DIV_RESOURCE){
				if(conv_from_res_td.innerHTML != ''){
					conv_from_res_td.innerHTML += '<br>';
				}
				conv_from_res_td.innerHTML += '{';
				for(var k=0; k<unit1.typeList.length; k++){
					if(k >= 1){
						conv_from_res_td.innerHTML += ', ';
					}
					conv_from_res_td.innerHTML += ResourceNameMap.get(unit1.typeList[k]);
				}
				conv_from_res_td.innerHTML += '}:';
				conv_from_res_td.innerHTML += unit1.volume;
			}else{
				if(conv_from_tool_td.innerHTML != ''){
					conv_from_tool_td.innerHTML += '<br>';
				}
				conv_from_tool_td.innerHTML += '{';
				for(var k=0; k<unit1.typeList.length; k++){
					if(k >= 1){
						conv_tool_tool_td.innerHTML += ', ';
					}
					conv_from_tool_td.innerHTML += ToolNameMap.get(unit1.typeList[k]);
				}
				conv_from_tool_td.innerHTML += '}:';
				conv_from_tool_td.innerHTML += unit1.volume;
			
			}
		}
		
		//作成資源・作成工具欄の表示を設定
		var conv_to_res_td = tr1.insertCell(-1);
		conv_to_res_td.style.border = 'solid';
		conv_to_res_td.innerHTML = '';
		
		var conv_to_tool_td = tr1.insertCell(-1);
		conv_to_tool_td.style.border = 'solid';
		conv_to_tool_td.innerHTML = '';
		
		for(var j=0; j<MConv1.toUnitList.length; j++){
			unit1 = MConv1.toUnitList[j];
			if(unit1.unitDiv == UNIT_DIV_RESOURCE){
				if(conv_to_res_td.innerHTML != ''){
					conv_to_res_td.innerHTML += '<br>';
				}
				conv_to_res_td.innerHTML += '{';
				for(var k=0; k<unit1.typeList.length; k++){
					if(k >= 1){
						conv_to_res_td.innerHTML += ', ';
					}
					conv_to_res_td.innerHTML += ResourceNameMap.get(unit1.typeList[k]);
				}
				conv_to_res_td.innerHTML += '}:';
				conv_to_res_td.innerHTML += unit1.volume;
			}else{
				if(conv_to_tool_td.innerHTML != ''){
					conv_to_tool_td.innerHTML += '<br>';
				}
				conv_to_tool_td.innerHTML += '{';
				for(var k=0; k<unit1.typeList.length; k++){
					if(k >= 1){
						conv_tool_tool_td.innerHTML += ', ';
					}
					conv_to_tool_td.innerHTML += ToolNameMap.get(unit1.typeList[k]);
				}
				conv_to_tool_td.innerHTML += '}:';
				conv_to_tool_td.innerHTML += unit1.volume;
			
			}
		}
	}
	
	manuallyConvertListTbl.style.display = 'block';

}

function SearchManuallyConvert(MConvName1, FromRes1, FromTool1, ToRes1, ToTool1){
	var searchResultMConvList = [];
	var unit1;
	var resIncludeFlg;
	var toolIncludeFlg;
	for(var i=0; i<g_ManuallyConvertList.length; i++){
		MConv1 = g_ManuallyConvertList[i];
		if(MConv1.lockedFlg == true ||  !checkManuallyConvertByCurrentBuilding(MConv1) ){
			continue;
		}
		
		//変換名の検索項目でフィルタ
		if(MConvName1 != "" &&
		   M_HenkanNameMap.get(MConv1.manuallyConvertType).indexOf(MConvName1) == -1){
		   	continue
		}
		
		//消費資源・消費工具の検索項目でフィルタ
		resIncludeFlg = false;
		toolIncludeFlg = false;
		for(var j=0; j<MConv1.fromUnitList.length; j++){
			unit1 = MConv1.fromUnitList[j];
			if(unit1.unitDiv == UNIT_DIV_RESOURCE && FromRes1 != ""){
				for(var k=0; k<unit1.typeList.length; k++){
					if(ResourceNameMap.get(unit1.typeList[k]).indexOf(FromRes1) != -1){
						resIncludeFlg = true;
						break;
					}
				}
			}else if(unit1.unitDiv == UNIT_DIV_TOOL && FromTool1 != ""){
				for(var k=0; k<unit1.typeList.length; k++){
					if(ToolNameMap.get(unit1.typeList[k]).indexOf(FromTool1) != -1){
						toolIncludeFlg = true;
						break;
					}
				}
			}
		}
		if(FromRes1 != "" && resIncludeFlg == false){
			continue;
		}
		if(FromTool1 != "" && toolIncludeFlg == false){
			continue;
		}
		
		//作成資源・作成工具の検索項目でフィルタ
		resIncludeFlg = false;
		toolIncludeFlg = false;
		for(var j2=0; j2<MConv1.toUnitList.length; j2++){
			unit1 = MConv1.toUnitList[j2];
			if(unit1.unitDiv == UNIT_DIV_RESOURCE && ToRes1 != ""){
				for(var k2=0; k2<unit1.typeList.length; k2++){
					if(ResourceNameMap.get(unit1.typeList[k2]).indexOf(ToRes1) != -1){
						resIncludeFlg = true;
						break;
					}
				}
			}else if(unit1.unitDiv == UNIT_DIV_TOOL && ToTool1 != ""){
				for(var k2=0; k2<unit1.typeList.length; k2++){
					if(ToolNameMap.get(unit1.typeList[k2]).indexOf(ToTool1) != -1){
						toolIncludeFlg = true;
						break;
					}
				}
			}
		}
		if(ToRes1 != "" && resIncludeFlg == false){
			continue;
		}
		if(ToTool1 != "" && toolIncludeFlg == false){
			continue;
		}
		
		searchResultMConvList.push(MConv1);
	}
	return searchResultMConvList;
}

function DisplaySelectManuallyConvertTab(){

	//オートコンプリートの手動変換候補リスト
	var keyword_MConvNameList = [];
	var keyword_FromResourceNameList = [];
	var keyword_FromToolList = [];
	var keyword_ToResourceNameList = [];
	var keyword_ToToolList = [];

	//'処理タイプ名'欄のオートコンプリート設定
	var MConv1;
	var val1;
	var keyword1;
	var unit1;
	keyword_MConvNameList = [];
	for(var i=0; i<g_ManuallyConvertList.length; i++){
		MConv1 = g_ManuallyConvertList[i];
		if(MConv1.lockedFlg == false && checkManuallyConvertByCurrentBuilding(MConv1)){
			keyword_MConvNameList.push(M_HenkanNameMap.get(MConv1.manuallyConvertType));
			
			for(var j=0; j<MConv1.toUnitList.length; j++){
				unit1 = MConv1.toUnitList[j];
				if(unit1.unitDiv == UNIT_DIV_RESOURCE){
					for(var k=0; k<unit1.typeList.length; k++){
						keyword1 = ResourceNameMap.get(unit1.typeList[k]);
						if(!keyword_ToResourceNameList.includes(keyword1)){
							keyword_ToResourceNameList.push(keyword1);
						}
					}
				}else if(unit1.unitDiv == UNIT_DIV_TOOL){
					for(var k=0; k<unit1.typeList.length; k++){
						keyword1 = ToolNameMap.get(unit1.typeList[k]);
						if(!keyword_ToToolList.includes(keyword1)){
							keyword_ToToolList.push(keyword1);
						}
					}
					
				}
			}
			
		}
	}	
	//デフォルト(未入力時)のオートコンプリートを設定する
	setDataList("Keyword_ManuallyConvertTypeNameOnSelectManuallyConvertTypeTab", keyword_MConvNameList);
	//入力時のオートコンプリートを設定する
	SetAutoCompleteOnInput("ManuallyConvertTypeNameOnSelectManuallyConvertTypeTab", keyword_MConvNameList, JpTermAndKanaYomiMap);
	
	//'消費資源名'欄のオートコンプリート設定
	var Res1
	for(var i2=0; i2<g_ResourceList.length; i2++){
		Res1 = g_ResourceList[i2];
		if(Res1.volume >= 1 && 
		   (Res1.parentResourceType == null || Res1.grainSize == RES_GRAIN_SIZE_CONCREATE) ){
			keyword_FromResourceNameList.push(ResourceNameMap.get(Res1.resourceType));
		}
	}
	setDataList("Keyword_FromResNameOnSelectManuallyConvertTypeTab", keyword_FromResourceNameList);
	SetAutoCompleteOnInput("FromResNameOnSelectManuallyConvertTypeTab", keyword_FromResourceNameList, JpTermAndKanaYomiMap);
	
	
	//'消費工具名'欄のオートコンプリート設定
	var Tool1;
	for(var i3=0; i3<g_ToolList.length; i3++){
		Tool1 = g_ToolList[i3];
		if(Tool1.volume >= 1){
			keyword_FromToolList.push(ToolNameMap.get(Tool1.toolType));
		}
	}
	setDataList("Keyword_FromToolOnSelectManuallyConvertTypeTab", keyword_FromToolList);
	SetAutoCompleteOnInput("FromToolOnSelectManuallyConvertTypeTab", keyword_FromToolList, JpTermAndKanaYomiMap);

	//'作成資源名'欄のオートコンプリート設定
	setDataList("Keyword_ToResNameOnSelectManuallyConvertTypeTab", keyword_ToResourceNameList);
	SetAutoCompleteOnInput("ToResNameOnSelectManuallyConvertTypeTab", keyword_ToResourceNameList, JpTermAndKanaYomiMap);
	
	
	//'作成工具名'欄のオートコンプリート設定
	setDataList("Keyword_ToToolOnSelectManuallyConvertTypeTab", keyword_ToToolList);
	SetAutoCompleteOnInput("ToToolOnSelectManuallyConvertTypeTab", keyword_ToToolList, JpTermAndKanaYomiMap);
	
}

function searchOnOwnedToolSelectionTab(){
	var toolDiv;
	var toolNm;
	
	var selbox = document.getElementById("toolDivOnOwnedToolSelectionTab");
	toolDiv = parseInt(selbox.options[selbox.selectedIndex].value);
	
	toolNm = document.getElementById("toolNameOnOwnedToolSelectionTab").value;
	
	var resultToolList = SearchToolList(toolDiv, toolNm);
	
	DisplayOwnedToolListTable(resultToolList);
}

function SearchToolList(toolDiv, toolName){

	var resultList = [];
	var Tool1;
	for(var i=0; i<g_ToolList.length; i++){
		Tool1 = g_ToolList[i];
		
		if(toolDiv != -1 &&
		   toolDiv != Tool1.toolDiv){
		   	continue;
		}
		
		if(toolName != "" &&
		   ToolNameMap.get(Tool1.toolType).indexOf(toolName) == -1){
		   	continue;
		}
		
		resultList.push(Tool1);
	}
	
	return resultList;	
}

//所持道具リスト一覧表を表示する
function DisplayOwnedToolListTable(toolList1){
	var toolListTbl = document.getElementById("toolListTableOnOwnedToolSelectionTab");
	toolListTbl.style.display = 'none';
	
    //表のすべての行の削除
    while(toolListTbl.rows[0]){ toolListTbl.deleteRow(0); }
	
	//ヘッダの作成
	setTHRow("toolListTableOnOwnedToolSelectionTab", 
	["道具名", "道具区分","総量", "現在の所持量", "個数指定", "操作"], COLOR_GREEN_STR);
	
	var Tool1;
	var current_having_vol;
	for(var i=0; i<toolList1.length; i++){
		Tool1 = toolList1[i];
		
		if(Tool1.volume >= 1){//総量が1以上のもののみ表示
			var tr1 = toolListTbl.insertRow(-1);
			
			var tool_name_td = tr1.insertCell(-1);
			tool_name_td.style.border = 'solid';
			tool_name_td.innerHTML = ToolNameMap.get(Tool1.toolType);
			
			var tool_div_td = tr1.insertCell(-1);
			tool_div_td.style.border = 'solid';
			tool_div_td.innerHTML = ToolDivNameMap.get(Tool1.toolDiv);
			
			var tool_vol_td = tr1.insertCell(-1);
			tool_vol_td.style.border = 'solid';
			tool_vol_td.innerHTML = Tool1.volume;
			
			var current_having_vol_td = tr1.insertCell(-1);
			current_having_vol_td.style.border = 'solid';
			
			if(g_UserInfo.havingToolVolMap.has(Tool1.toolType)){
				current_having_vol = g_UserInfo.havingToolVolMap.get(Tool1.toolType);
			}else{
				current_having_vol = 0;
			}			
			current_having_vol_td.innerHTML = current_having_vol;
			
			var kosu_td = tr1.insertCell(-1);
			kosu_td.style.border = 'solid';
			
			var textbox1 = document.createElement('input');
			textbox1.id = "textbox_toolType_"+Tool1.toolType;
			textbox1.type = 'text';
			textbox1.value = 0;
			textbox1.size = 2;
			
			var span = document.createElement('span');
			span.innerHTML = '個';
			
			kosu_td.appendChild(textbox1);
			kosu_td.appendChild(span);
			
			var sousa_td = tr1.insertCell(-1);
			sousa_td.style.border = 'solid';
			
			//持ち出しボタンを作成
	        var btn = document.createElement('button');
	        btn.type = 'button';
	        btn.value = Tool1.toolType;
	        btn.innerText = "持ち出し";
	        btn.style.width = "80px";
	        btn.style.marginTop = "5px";
	        btn.style.marginBottom = "5px";
	        btn.style.display = 'inline';

	        //各'持ち出し'ボタンをクリックしたときの動作をセット            
	        btn.onclick = function(){
	        	var toolType1 = parseInt(this.value);
	        	var textbox2 = document.getElementById("textbox_toolType_"+toolType1);
	        	var vol = parseInt(textbox2.value);
	        	if(isNaN(vol) == true || vol <= 0){
	        		alert("個数には正の値を設定してください");
	        		return;
				}
				
				var current_having_vol;
				if(g_UserInfo.havingToolVolMap.has(Tool1.toolType)){
					current_having_vol = g_UserInfo.havingToolVolMap.get(Tool1.toolType);
				}else{
					current_having_vol = 0;
				}
				
				var Tool2 = GetToolByToolType(toolType1);
				if(Tool2.volume < current_having_vol + vol){
					alert("持ち出し個数には総量を超えない値を設定してください");
					return;
				}
				
				if(!g_UserInfo.havingToolVolMap.has(toolType1)){
					g_UserInfo.havingToolVolMap.set(toolType1, vol);
				}else{
					g_UserInfo.havingToolVolMap.set(toolType1, current_having_vol+vol);
				}
				
				DisplayOwnedToolListTable(toolList1);

	        };
	        sousa_td.appendChild(btn);
	        
	        var br = document.createElement('br');
	        sousa_td.appendChild(br);
	        
	        //預けるボタンを作成
	        var btn2 = document.createElement('button');
	        btn2.type = 'button';
	        btn2.value = Tool1.toolType;
	        btn2.innerText = "預ける";
	        btn2.style.width = "80px";
	        btn2.style.marginTop = "5px";
	        btn2.style.marginBottom = "5px";
	        btn2.style.display = 'inline';

	        //各'預ける'ボタンをクリックしたときの動作をセット            
	        btn2.onclick = function(){
	        	var toolType1 = this.value;
	        	var textbox2 = document.getElementById("textbox_toolType_"+toolType1);
	        	var vol = parseInt(textbox2.value);
	        	if(isNaN(vol) == true || vol <= 0){
	        		alert("個数には正の値を設定してください");
	        		return;
				}
			
				var current_having_vol2;
				if(!g_UserInfo.havingToolVolMap.has(toolType1)){
					current_having_vol2 = 0;
				}else{
					current_having_vol2 = g_UserInfo.havingToolVolMap.get(toolType1);
				}
				if(current_having_vol2 < vol){
					alert("預ける個数には現在の所持量を超えない値を設定してください");
					return;
				}
				
				g_UserInfo.havingToolVolMap.set(toolType1, g_UserInfo.havingToolVolMap.get(toolType1)-vol);
				
				DisplayOwnedToolListTable(toolList1);

	        };
	        sousa_td.appendChild(btn2);	
			
			
		}
	}
	
	toolListTbl.style.display = 'block';
	
	
}

function DisplayOwnedToolListTab(){

	//道具区分のセレクトボックスを設定
    elem = document.getElementById("toolDivOnOwnedToolSelectionTab");
    //道具区分のセレクトボックスをクリア
    while(elem.firstChild != null){ elem.removeChild(elem.firstChild); }
    
    for([div, divNm] of ToolDivNameMap){
        let op = document.createElement("option");
        op.value = div;
        op.text = divNm;
        elem.appendChild(op);
    }
    var all_op = document.createElement("option");
    all_op.value = -1;
    all_op.text = "全て"
    elem.appendChild(all_op);
    
    
	DisplayOwnedToolListTable(g_ToolList);
}

// 手動変換/所有道具選択のタブの切り替え
function ChangeMConvTabOrOwnedToolSelectTab(){
	//今表示されているタブを取得
	var tabList =GetShowingTabNameList();
	
	var targetRadioElemList;
	var checkedTabNm;
	
	//今表示されているタブによって選択したラジオボタンの値を取得
	if(tabList.includes(TAB_NAME_MANUALLY_CONVERT)){
		targetRadioElemList = document.getElementsByName("radioSelectTabOnManuallyConvertTab");
		for(var i=0; i<targetRadioElemList.length; i++){
			if(targetRadioElemList[i].checked){
				checkedTabNm = targetRadioElemList[i].value;
			}
		}
	}else if(tabList.includes(TAB_NAME_OWNED_TOOL_SELECT)){
		targetRadioElemList = document.getElementsByName("radioSelectTabOnOwnedToolSelectionTab");
		for(var i=0; i<targetRadioElemList.length; i++){
			if(targetRadioElemList[i].checked){
				checkedTabNm = targetRadioElemList[i].value;
			}
		}	
	
	}
	

	//各タブのラジオボタンの値を更新
	var radioElemList = document.getElementsByName("radioSelectTabOnManuallyConvertTab");	
	for(var i=0; i<radioElemList.length; i++){
		if(radioElemList[i].value == checkedTabNm){
			radioElemList[i].checked = true;
		}
	}
	
	radioElemList = document.getElementsByName("radioSelectTabOnOwnedToolSelectionTab");	
	for(var i=0; i<radioElemList.length; i++){
		if(radioElemList[i].value == checkedTabNm){
			radioElemList[i].checked = true;
		}
	}
	
	HiddenAllTab();
	DisplayTab(checkedTabNm);
	
}

//現在表示中のタブリストを取得する
function GetShowingTabNameList(){
	var resultTabList = [];
	
	var elem;
	for(var i=0; i<AllTabNameList.length; i++){
		elem = document.getElementById(AllTabNameList[i]);
		if(elem.style.display != 'none'){
			resultTabList.push(AllTabNameList[i]);
		}
	}
	return resultTabList;
}

//手動変換タブを表示する
function DisplayManuallyConvertTab(){
	var buildObjectNameSpan = document.getElementById("BuildObjectNameOnManuallyConvertTab");
	buildObjectNameSpan.innerHTML = g_CurrentBuildingObject.name;
	
	var spanElem = document.getElementById("MConvTypeOnManuallyConverTab");
	
	if(g_CurrentManuallyConvert == null){
		spanElem.innerHTML = "未選択"
		
		var div = document.getElementById("ConsumptUnitOnManuallyConverTab");
		//手動変換の作成物・Fromリストの内容をクリア
    	while(div.firstChild != null){ div.removeChild(div.firstChild); }
    	
	}else{
		spanElem.innerHTML = M_HenkanNameMap.get(g_CurrentManuallyConvert.manuallyConvertType);
		
		var div = document.getElementById("ConsumptUnitOnManuallyConverTab");
		//手動変換の作成物・Fromリストの内容をクリア
    	while(div.firstChild != null){ div.removeChild(div.firstChild); }

		var unit1;
    	var br; 
    	
    	var span6 = document.createElement('span');
    	span6.style.color = COLOR_RED_STR;
    	span6.innerHTML = '作成物: ';
    	for(var i2=0; i2<g_CurrentManuallyConvert.toUnitList.length; i2++){
    		if(i2 >= 1){
    			span6.innerHTML += ', ';
    		}
    		unit1 = g_CurrentManuallyConvert.toUnitList[i2];
			if(unit1.unitDiv == UNIT_DIV_RESOURCE){
				span6.innerHTML += ResourceNameMap.get(unit1.typeList[0]);
				span6.innerHTML += ':'+unit1.volume;
			}else{
				span6.innerHTML += ToolNameMap.get(unit1.typeList[0]);
				span6.innerHTML += ':'+unit1.volume;
			}
    		
    	}
    	
    	br = document.createElement('br');
    	div.appendChild(span6);
    	div.appendChild(br);
    	
    	
    	var span7 = document.createElement('span');
    	span7.innerHTML = '消費物リスト';
    	br = document.createElement('br');
    	div.appendChild(span7);
    	div.appendChild(br);
    	
    	for(var i=0; i<g_CurrentManuallyConvert.fromUnitList.length; i++){
    		unit1 = g_CurrentManuallyConvert.fromUnitList[i];
    		
    		if(i >= 1){
    			br = document.createElement('br');
    			div.appendChild(br);
    		}
    		
    		var span2 = document.createElement('span');
    		span2.innerHTML = 'From'+(i+1);
    		span2.style.color = COLOR_BLUE_STR;
    		br = document.createElement('br');
    		
    		div.appendChild(span2);
    		div.appendChild(br);
    		
    		var span3 = document.createElement('span');
    		span3.innerHTML = '{';
    		for(var j=0; j<unit1.typeList.length; j++){
    			if(j >= 1){
    				span3.innerHTML += ', ';
    			}
    			if(unit1.unitDiv == UNIT_DIV_RESOURCE){
    				span3.innerHTML += ResourceNameMap.get(unit1.typeList[j]);
    			}else{
    				span3.innerHTML += ToolNameMap.get(unit1.typeList[j]);
    			}
    		}
    		span3.innerHTML += '}の中から';
    		span3.innerHTML += unit1.volume;
    		span3.innerHTML += 'コ';
    		br = document.createElement('br');
    		
    		div.appendChild(span3);
    		div.appendChild(br);
    		
    		var totalVal_span = document.createElement('span');
    		//総選択量の値のspanにFromUnitのIndexでIdを設定
    		totalVal_span.id = 'TotalValSpan_'+i;
    		totalVal_span.style.color = COLOR_GREEN_STR2;
    		totalVal_span.style.backgroundColor = COLOR_BLACK_STR;
    		totalVal_span.value = 'Slider_FromUnitIdx_'+i;
				var totalRangeValue = function(elem, target){
					return function(evt){
						var totalVal = 0;
						var sliders = document.getElementsByName(target.value);
						for(var k=0; k<sliders.length; k++){
							totalVal = totalVal + parseInt(sliders[k].value);
						}
						target.innerHTML = '現在の選択量:';
						target.innerHTML += totalVal;
					}
				}
    		
    		var chkBox;
    		for(var j2=0; j2<unit1.typeList.length; j2++){
    			if(j2 >= 1){
					br = document.createElement('br');
					div.appendChild(br);
				}
				
				
				var span4 = document.createElement('span');
				
				if(unit1.unitDiv == UNIT_DIV_RESOURCE){
					var Res1 = GetResourceByResType(g_ResourceList, unit1.typeList[j2]);
					
    				span4.innerHTML += ResourceNameMap.get(unit1.typeList[j2]);
    				span4.innerHTML += '(資源量:';
    				span4.innerHTML += Res1.volume;
    				span4.innerHTML +=')';
    				
    			}else{
    				var Tool1 = GetToolByToolType(unit1.typeList[j2]);
    				
    				span4.innerHTML += ToolNameMap.get(unit1.typeList[j2]);
    				span4.innerHTML += '(資源量:';
    				span4.innerHTML += Tool1.volume;
    				span4.innerHTML += ')';
    				
    			}
				
				
				
				var slider = document.createElement('input');
				//スライダーの表示位置を絶対位置で指定
				slider.style.position = 'absolute';
				slider.style.top = span4.style.top;
				slider.style.left = "300px";
				
				//スライダーにFromUnitのIndexで名前を設定
				slider.name = 'Slider_FromUnitIdx_'+i;
				
				//スライダーのIDはFromUnitのIndex, TypeListのIndexの順に指定して設定する
				slider.id = 'Slider_FromUnitIdx_'+i+'_TypeListIdx_'+j2;
				slider.type = 'range';
				slider.min = 0;
				if(unit1.typeList.length == 1){
					slider.value = unit1.volume;
					slider.disabled = true;
				}else{
					slider.value = 0;
					slider.disabled = false;
				}
				slider.max = unit1.volume;
				slider.step = 1.0;

				var span5 = document.createElement('span');
				//スライダーのvalue値の表示位置を絶対位置で指定
				span5.style.position = 'absolute';
				span5.style.top = span4.style.top;
				span5.style.left = "450px";
				
				span5.innerHTML = slider.value;
				var rangeValue = function(elem, target){
					return function(evt){
						target.innerHTML = elem.value;
					}
				}
				slider.addEventListener('input', rangeValue(slider, span5));
				slider.addEventListener('input', totalRangeValue(slider, totalVal_span));
				
				div.appendChild(span4);				
				div.appendChild(slider);
				div.appendChild(span5);
    		}
    		
	    	br = document.createElement('br');
	    	totalVal_span.innerHTML = '現在の選択量:0';
	    	div.appendChild(br);
	    	div.appendChild(totalVal_span);
    		
    	}
    	

    	
		
	}

}

//建物一覧を表示する
function DisplayBuildObjectListTable(buildObjectList1){
	
	var buildObjectListTbl = document.getElementById("buildObjectListTableOnBuildingListTab");
	buildObjectListTbl.style.display = 'none';

    //表のすべての行の削除
    while(buildObjectListTbl.rows[0]){ buildObjectListTbl.deleteRow(0); }
    
	//ヘッダの作成
	setTHRow("buildObjectListTableOnBuildingListTab", 
	["建物名", "建物タイプ", "ステータス", ""], COLOR_GREEN_STR);
	
    var buildObject1;
	for(var i=0; i<buildObjectList1.length; i++){
		buildObject1 = buildObjectList1[i];
		
		var tr1 = buildObjectListTbl.insertRow(-1);
		
		var buildObj_name_td = tr1.insertCell(-1);
		buildObj_name_td.style.border = 'solid';
		buildObj_name_td.innerHTML = buildObject1.name;
		
		var buildObj_type_td = tr1.insertCell(-1);
		buildObj_type_td.style.border = 'solid';
		buildObj_type_td.innerHTML = BuildObjectTypeNameMap.get(buildObject1.buildType);
		
		var buildObj_sts_td = tr1.insertCell(-1);
		buildObj_sts_td.style.border = 'solid';
		if( !IsBuildTypeForManuallyConversion(buildObject1.buildType) ){
			buildObj_sts_td.innerHTML = BuildObjectStsNameMap.get(buildObject1.status);
		}else{
			buildObj_sts_td.innerHTML = '-'
		}
		
		var buildObj_syousai_td = tr1.insertCell(-1);
		buildObj_syousai_td.style.border = 'solid';
		
		//'詳細'ボタンを生成
        var syousai_btn_id = "SyousaiBtn_BuildId_"+buildObject1.buildId;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.id = syousai_btn_id;
        btn.value = buildObject1.buildId;
        btn.innerText = "詳細";
        btn.style.width = "50px";
        btn.style.display = 'inline';

        //各'詳細'ボタンをクリックしたときの動作をセット            
        btn.onclick = function(){
			HiddenAllTab();
			var buildObj2 = GetBuildObjectById(this.value);
			DisplayBuildObjectDetail(buildObj2);
			
			DisplayTab(TAB_NAME_BUILDING_DETAIL_LIST);

        };
        buildObj_syousai_td.appendChild(btn);
		
		
		
	}
	
	buildObjectListTbl.style.display = 'block';
}

//建物の'詳細'タブを表示する
function DisplayBuildObjectDetail(buildObject1){

	var buildTypeInfo1 = GetBuildTypeInfoByBuildType(buildObject1.buildType);
	var form1 = document.getElementById("formOnBuildingDetailListTab");
	
	var imgElem = document.getElementById("buildTypeImageOnBuildingDetailListTab");
	imgElem.src = BuildTypeInfoImageMap.get(buildObject1.buildType);
	
	var nameElem = document.getElementById("BuildObjectNameOnBuildingDetailListTab");
	nameElem.value = buildObject1.name;

	
	var statusElem = document.getElementById("statusOnBuildingDetailListTab");
	if( !IsBuildTypeForManuallyConversion(buildObject1.buildType) ){
		statusElem.innerHTML = BuildObjectStsNameMap.get(buildObject1.status);

	}else{
		statusElem.innerHTML = '-';

	}
	
	//'稼働させる'・'稼働を停止する'ボタンに値をセット
	var toRunBtn = document.getElementById("ToRunBtnOnBuildingDetailListTab");
	toRunBtn.value = buildObject1.buildId;
	var stopOpeBtn = document.getElementById("stopOperationOnBuildingDetailListTab");
	stopOpeBtn.value = buildObject1.buildId;
	
	//建物タイプ・ステータスによって表示/非表示をセット
	if( IsBuildTypeForManuallyConversion(buildObject1.buildType) ){
		toRunBtn.style.display = 'none';
		stopOpeBtn.style.display = 'none';		
	}else if(buildObject1.status == BUILD_STS_KENSETU){
		toRunBtn.style.display = 'none';
		stopOpeBtn.style.display = 'none';
	}else if(buildObject1.status == BUILD_STS_KADOU_AND_HENKAN ||
			 buildObject1.status == BUILD_STS_KADOU_AND_HENKAN_TAIKI){
		toRunBtn.style.display = 'none';
		stopOpeBtn.style.display = 'inline';
	}else{
		toRunBtn.style.display = 'inline';
		stopOpeBtn.style.display = 'none';
	}
	
	//'稼働させる'ボタンの動作をセット
	toRunBtn.onclick = function(){
		var buildObj2 = GetBuildObjectById(this.value);
		buildObj2.startOperation();
		DisplayBuildObjectDetail(buildObj2);
	};
	
	//'稼働を停止する'ボタンの動作をセット
	stopOpeBtn.onclick = function(){
		var buildObj2 = GetBuildObjectById(this.value);
		buildObj2.stopOperation();
		DisplayBuildObjectDetail(buildObj2);
	}
	
	
	
	var typeElem = document.getElementById("buildTypeOnBuildingDetailListTab");
	typeElem.innerHTML = BuildObjectTypeNameMap.get(buildObject1.buildType);
	
	//'説明'・'説明を閉じる'ボタンに値をセット
    var btn = document.getElementById("OpenDescriptionBtnOnBuildingDetailListTab");
    btn.value = buildObject1.buildId;
    btn.style.display = 'inline';
    
    var btn2 = document.getElementById("CloseDescriptionBtnOnBuildingDetailListTab");
    btn2.value = buildObject1.buildId;
    btn2.style.display = 'none';

	//'説明'欄に値をセット
	var spanElem = document.getElementById("DescriptionOnBuildingDetailListTab");
	spanElem.innerHTML = buildTypeInfo1.description;
	spanElem.style.display = 'none';
    
    //'説明'ボタンを押したときの動作をセット
    btn.onclick = function(){
		var spanElem2 = document.getElementById("DescriptionOnBuildingDetailListTab");
		spanElem2.style.display = 'block';
		
		btn.style.display = 'none';
		btn2.style.display = 'inline';
	};
	
	//'説明を閉じる'ボタンを押したときの動作をセット
	btn2.onclick = function(){
		var spanElem = document.getElementById("DescriptionOnBuildingDetailListTab");
		spanElem.style.display = 'none';
	
		btn.style.display = 'inline';
		btn2.style.display = 'none';
	}
	
	var convertOrderInSameConvertElem = document.getElementById("convertOrderInSameConvertOnBuildingDetailListTab");
	convertOrderInSameConvertElem.value = buildObject1.convertOrderInSameConvert;
	
	var selbox_applyingConvertingType = form1.selBox_applyingConvertingTypeOnBuildingDetailListTab;
    //適用可能変換リストのセレクトボックスをクリア
    while(selbox_applyingConvertingType.firstChild != null){ selbox_applyingConvertingType.removeChild(selbox_applyingConvertingType.firstChild); }
    

	var convType1;
    for(var i=0; i<buildTypeInfo1.anableConvertList.length; i++){
    	convType1 = buildTypeInfo1.anableConvertList[i];
    	
        let op = document.createElement("option");
        op.value = convType1;
        op.text = HenkanNameMap.get(convType1);
        selbox_applyingConvertingType.appendChild(op);
        
        if(convType1 == buildObject1.applyingConvertingType){
			selbox_applyingConvertingType.selectedIndex = i;
        }
    }

    

	//'修正を適用'ボタンに値をセット
    var btn3 = document.getElementById("UpdateBuildObjectOnBuildingDetailListTab");
    btn3.value = buildObject1.buildId;

	//'修正を適用'ボタンを押したときの動作をセット    
	btn3.onclick = function(){
		var buildObj2 = GetBuildObjectById(this.value);		
		UpdateBuildObject(buildObj2);
	};


}
function UpdateBuildObject(buildObject1){
	var name1;
	var convertOrderInSameConvert1;
	var applyingConvertingType1;
	
	//入力のチェック
	name1 = document.getElementById("BuildObjectNameOnBuildingDetailListTab").value;
	if(name1 == ""){
		alert('建物名を設定してください');
		return;
	}
	
	if( !IsBuildTypeForManuallyConversion(buildObject1.buildType) ){
		convertOrderInSameConvert1 = document.getElementById("convertOrderInSameConvertOnBuildingDetailListTab").value;
		if(isNaN(convertOrderInSameConvert1) == true ||
		   convertOrderInSameConvert1 <= 0 ||
		   convertOrderInSameConvert1 > BOTTOM_PRIORITY_NUMBER){
		   		alert('同一変換中での優先順位には1～100の数値を入力してください');
		   		return;
		}
		
		var form1 = document.getElementById("formOnBuildingDetailListTab");
		var selbox1 = form1.selBox_applyingConvertingTypeOnBuildingDetailListTab;
		applyingConvertingType1 = selbox1.options[selbox1.selectedIndex].value;
	}
	
	buildObject1.name = name1;
	
	if( !IsBuildTypeForManuallyConversion(buildObject1.buildType) ){
		buildObject1.convertOrderInSameConvert = convertOrderInSameConvert1;
		buildObject1.applyingConvertingType = applyingConvertingType1;
	}
	alert('変更を適用しました');
}

//道具一覧タブの表示
function DisplayToolListTab(){
	//'道具名リスト'欄のオートコンプリート設定
	var Tool1;
	var keyword_ToolList = [];
	for(var i=0; i<g_ToolList.length; i++){
		Tool1 = g_ToolList[i];
		if(Tool1.volume >= 1){
			keyword_ToolList.push(ToolNameMap.get(Tool1.toolType));
		}
	}
	setDataList("Keyword_ToolNameOnToolListTab", keyword_ToolList);
	SetAutoCompleteOnInputOfMultipleKeyword("ToolNameOnToolListTab", keyword_ToolList, JpTermAndKanaYomiMap);
	
	FilterTool();
}

//道具一覧タブから[所持中の道具のみ/すべての道具]のラジオボタンを変更したときの動作
function ChangeFilterToolCondition(){
	FilterTool();
}

//道具一覧タブから'検索'ボタンを押したときの動作
function FilterTool(){
	var radioList = document.getElementsByName("radioFilterToolOnToolListTab");
	
	var checkedVal;
	for(var i=0; i<radioList.length; i++){
		if(radioList[i].checked){
			checkedVal = parseInt(radioList[i].value);
		}
	}
	
	var toolNames = document.getElementById("ToolNameOnToolListTab").value;
	var toolNameList = toolNames.trim().split(' ');
	
	var resultToolList = [];
	var Tool1;
	var searchTargetToolName;
	
	if(toolNames == ''){
		for(var j=0; j<g_ToolList.length; j++){
			Tool1 = g_ToolList[j];
			
			if(checkedVal == RADIO_VALUE_ONLY_HAVING &&
			   ( !g_UserInfo.havingToolVolMap.has(Tool1.toolType) || g_UserInfo.havingToolVolMap.get(Tool1.toolType) == 0 ) ){
			   	continue;
			}
			resultToolList.push(Tool1);
		}
		
	}else{
	LABEL_LOOP_G_TOOLLIST: for(var j=0; j<g_ToolList.length; j++){
			Tool1 = g_ToolList[j];
			
			if(checkedVal == RADIO_VALUE_ONLY_HAVING &&
			   ( !g_UserInfo.havingToolVolMap.has(Tool1.toolType) || g_UserInfo.havingToolVolMap.get(Tool1.toolType) == 0 ) ){
			   	continue;
			}
			
			for(var k=0; k<toolNameList.length; k++){
				searchTargetToolName = toolNameList[k];
				if(searchTargetToolName == '' ||
				   ToolNameMap.get(Tool1.toolType).indexOf(searchTargetToolName) != -1){
					resultToolList.push(Tool1);
					continue LABEL_LOOP_G_TOOLLIST;
				}
			}
		}
	}
	
	DisplayToolListTable(resultToolList);

}
//道具一覧テーブルを表示する
function DisplayToolListTable(toolList1){
	var dispToolList = [];
	
	var toolListTbl = document.getElementById("toolListTableOnToolListTab");
	toolListTbl.style.display = 'none';

    //表のすべての行の削除
    while(toolListTbl.rows[0]){ toolListTbl.deleteRow(0); }
    
    toolList1.forEach( function(tool1){//資源量が1以上のものが表示対象
    	if(tool1.volume >= 1){
    		dispToolList.push(tool1);
    	}
    });
    
	for(var i=0; i<dispToolList.length; i++){
		tool2 = dispToolList[i];
		
		var tr1 = toolListTbl.insertRow(-1);
		
		var tool_td = tr1.insertCell(-1);
		tool_td.style.border = 'solid';
		
		var span_main = document.createElement('span');
		span_main.innerHTML = ToolNameMap.get(tool2.toolType);
		span_main.innerHTML += ':';
		span_main.innerHTML += tool2.volume;
		span_main.innerHTML += '&nbsp;'
		
		tool_td.appendChild(span_main);
	}
	
	toolListTbl.style.display = 'block';
    

}

//建物建設タブの表示
function DisplayConstructionBuildingTab(){

}

//リソース一覧タブの表示
function DisplayResourceListTab(){	
	//'資源名リスト'欄のオートコンプリート設定
	var Res1;
	var keyword_ResList = [];
	for(var i=0; i<g_ResourceList.length; i++){
		Res1 = g_ResourceList[i];
		if(Res1.volume >= 1){
			keyword_ResList.push(ResourceNameMap.get(Res1.resourceType));
		}
	}
	setDataList("Keyword_ResourceNameOnResourceListTab", keyword_ResList);
	SetAutoCompleteOnInputOfMultipleKeyword("ResourceNameOnResourceListTab1", keyword_ResList, JpTermAndKanaYomiMap);
	

	FilterResource();
}

//リソース一覧タブから'検索'ボタンを押したときの動作
function FilterResource(){
	var resourceNames = document.getElementById("ResourceNameOnResourceListTab1").value;
	var resourceNameList = resourceNames.trim().split(' ');
	var Res1;
	var searchResult;
	
	if(resourceNames == ''){
		searchResult = g_ResourceList;
	}else{
		searchResult = [];
		var searchTargetResName;
LABEL_LOOP_G_RESLIST: for(var i=0; i<g_ResourceList.length; i++){
			Res1 = g_ResourceList[i];
			
			for(var k=0; k<resourceNameList.length; k++){
				searchTargetResName = resourceNameList[k];
				if(ResourceNameMap.get(Res1.resourceType).indexOf(searchTargetResName) != -1){
					searchResult.push(Res1);
					continue LABEL_LOOP_G_RESLIST;
				}
			}
			
			if(Res1.grainSize == RES_GRAIN_SIZE_ROUGH){
				concResTypeList = GetConcreteResTypeListByResType(Res1.resourceType);
				
				for(var k=0; k<resourceNameList.length; k++){
					searchTargetResName = resourceNameList[k];
					for(var j=0; j<concResTypeList.length; j++){
						if(ResourceNameMap.get(concResTypeList[j]).indexOf(searchTargetResName) != -1 ||
						   ResourceKanaNameMap.get(concResTypeList[j]).indexOf(searchTargetResName) != -1 ||
						   kanaToHira(ResourceKanaNameMap.get(concResTypeList[j])).indexOf(searchTargetResName) != -1){
							searchResult.push(Res1);
							continue LABEL_LOOP_G_RESLIST;
						}
					}
				}
			}
			
		}
	}
	
	DisplayResourceListTable(searchResult);
}

//リソース一覧表を表示する
function DisplayResourceListTable(resourceList){
	var dispResourceList = [];
	
	var resourceListTbl = document.getElementById("resourceListTableOnResourceListTab");
	resourceListTbl.style.display = 'none';

    //表のすべての行の削除
    while(resourceListTbl.rows[0]){ resourceListTbl.deleteRow(0); }
    
    resourceList.forEach( function(res1){//親の資源区分がないもので、資源量が1以上のものが表示対象
    	if(res1.parentResourceType == null &&
    	   CalcTotalResVolume(res1.resourceType) >= 1){
    		dispResourceList.push(res1);
    	}
    });
    
    var res2;
    var vol;
    var concResList;
	for(var i=0; i<dispResourceList.length; i++){
		res2 = dispResourceList[i];
		vol = CalcTotalResVolume(res2.resourceType);
		
		var tr1 = resourceListTbl.insertRow(-1);
		
		var res_td = tr1.insertCell(-1);
		res_td.id = 'td_In_resourceListTableOnResourceListTab_ResType'+res2.resourceType;
		res_td.style.border = 'solid';
		
		var span_main = document.createElement('span');
		span_main.innerHTML = ResourceNameMap.get(res2.resourceType);
		span_main.innerHTML += ':';
		span_main.innerHTML += vol;
		span_main.innerHTML += '&nbsp;'
		
		res_td.appendChild(span_main);
		
		var span_sub = null;
		var res3;
		var br;
		
		if(res2.grainSize == RES_GRAIN_SIZE_ROUGH){
		
			//'内訳'・'内訳を閉じる'ボタンを生成
            var utiwake_btn_id = "UtiwakeBtn_ResType"+res2.resourceType;
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.id = utiwake_btn_id;
            btn.value = res2.resourceType;
            btn.innerText = "内訳";
            btn.style.width = "50px";
            btn.style.display = 'inline';
            
            var utiwake_close_btn_id = "UtiwakeCloseBtn_ResType"+res2.resourceType;
            var btn2 = document.createElement('button');
            btn2.type = 'button';
            btn2.id = utiwake_close_btn_id;
            btn2.value = res2.resourceType;
            btn2.innerText = "内訳を閉じる";
            btn2.style.width = "100px";
            btn2.style.display = 'none';

            //各'内訳'ボタンをクリックしたときの動作をセット            
            btn.onclick = function(){
            	var res_td = document.getElementById("td_In_resourceListTableOnResourceListTab_ResType"+this.value);
            	
				span_sub = document.createElement('span');
				span_sub.id = 'Span_Sub_ResType'+this.value;
				
				br = document.createElement('br');
				span_sub.appendChild(br);
				
				concResList = GetConcreteResListByResType(this.value);
				for(var j=0; j<concResList.length; j++){
					res3 = concResList[j];
					if(res3.volume >= 1){
						span2 = document.createElement('span');
						span2.innerHTML = '&nbsp;&nbsp;'
						span2.innerHTML += ResourceNameMap.get(res3.resourceType);
						span2.innerHTML += ':';
						span2.innerHTML += res3.volume;
						
						br = document.createElement('br');
						
						span_sub.appendChild(span2);
						span_sub.appendChild(br);
					}

				}
				res_td.appendChild(span_sub);
				
				this.style.display = 'none';
				var utiwake_close_Btn = document.getElementById("UtiwakeCloseBtn_ResType"+this.value);
				utiwake_close_Btn.style.display = 'inline';
            };
            res_td.appendChild(btn);
            


            //各'内訳を閉じる'ボタンをクリックしたときの動作をセット            
            btn2.onclick = function(){
            	var res_td = document.getElementById("td_In_resourceListTableOnResourceListTab_ResType"+this.value);
            	var elem = document.getElementById("Span_Sub_ResType"+this.value);
            	
				elem.parentNode.removeChild(elem);
				this.style.display = 'none';
				
				var utiwake_Btn = document.getElementById("UtiwakeBtn_ResType"+this.value);
				utiwake_Btn.style.display = 'inline';
            };
            res_td.appendChild(btn2);
		

		}


    }
    
	resourceListTbl.style.display = 'block';

}

//変換一覧表を表示する
function DisplayConvertListTable(){
	var dispConvertList = [];
	var conv1, conv2;
	
	g_BuildTypeInfoList.forEach( function(buildTypeInfo1){
		if(buildTypeInfo1.lockedFlg == false){
			buildTypeInfo1.anableConvertList.forEach( function(convType1){
				conv1 = GetConvertByConvType(convType1);
				if(conv1.lockedFlg == false){
					dispConvertList.push(conv1);
				}
			});
		}
	});
	
	dispConvertList.sort( function(a, b){
		if(a.convertOrder < b.convertOrder){
			return -1;
		}
		if(a.convertOrder > b.convertOrder){
			return 1;
		}
		return 0;
	});
	
	var convertListTbl = document.getElementById("convertListTableOnConversionSettingsTab");
	convertListTbl.style.display = 'none';

    //表のすべての行の削除
    while(convertListTbl.rows[0]){ convertListTbl.deleteRow(0); }
	
	//ヘッダの作成
	setTHRow("convertListTableOnConversionSettingsTab", 
	["変換名", "消費資源", "消費する具体的資源の種類", "必要最小量", "生産資源と生産最小量", "変換順序変更"], COLOR_GREEN_STR);
	
	//表(内容の作成)
	for(var i=0; i<dispConvertList.length; i++){
		conv1 = dispConvertList[i];
		var tr1 = convertListTbl.insertRow(-1);
		//var rowSpan1 = getNumberOfKeyInMap(conv1.FromResVolInSmallestUnit).toString(10);
		
		var conv_title_td = tr1.insertCell(-1);
		conv_title_td.style.border = 'solid';
		conv_title_td.innerHTML = HenkanNameMap.get(conv1.convertType);
		
		var conv_from_res_td = tr1.insertCell(-1);
		conv_from_res_td.style.border = 'solid';
		conv_from_res_td.innerHTML = '';
		
		var conv_from_using_conc_res_td = tr1.insertCell(-1);
		conv_from_using_conc_res_td.style.border = 'solid';
		conv_from_using_conc_res_td.innerHTML = '';
		
		var conv_need_volume_td = tr1.insertCell(-1);
		conv_need_volume_td.style.border = 'solid';
		conv_need_volume_td.innerHTML = '';
		
		var using_conc_res_list;
		var default_conc_res_list;
		var Res1;
		for([resType1, vol1] of conv1.FromResVolInSmallestUnit){
			Res1 = GetResourceByResType(g_ResourceList, resType1);
			
			conv_from_res_td.innerHTML += ResourceNameMap.get(resType1);
			conv_from_res_td.innerHTML += '<br>';
			
			if(Res1.grainSize == RES_GRAIN_SIZE_ROUGH){
				default_conc_res_list = GetConcreteResTypeListByResType(resType1);
				using_conc_res_list = conv1.concreteResTypeUsedForConverting.get(resType1);
				default_conc_res_list.forEach( function(concResType1){
		            var check_id = "chkBox_ConvType_"+conv1.convertType+"_ResType"+concResType1;
		            var chkBox = document.createElement('input');
		            chkBox.type = 'checkbox';
		            chkBox.name = "chkBox";
		            chkBox.id = check_id;
		            chkBox.value = concResType1;
		            if(using_conc_res_list.includes(concResType1)){
		            	chkBox.checked = true;
		            }else{
		            	chkBox.checked = false;
		            }
		            chkBox.onchange = function(){
		                if(chkBox.checked == true){
		                	using_conc_res_list.push(concResType1);						
		                }else{
		                	if(using_conc_res_list.length == 1){
		                		alert('消費対象の具体的資源は1つ以上選択してください');
		                		chkBox.checked = true;
		                	}else{
								using_conc_res_list = using_conc_res_list.filter(function(a) { return a !== concResType1;} );
							}
		                }
		            }
		            var span_id = "span_ConvType_"+conv1.convertType+"_ResType"+concResType1;
		            var span = document.createElement('span');
		            span.innerHTML = ResourceNameMap.get(concResType1);
		            
		            conv_from_using_conc_res_td.appendChild(chkBox);
		            conv_from_using_conc_res_td.appendChild(span);

				});
			}else{
		            var span = document.createElement('span');
		            span.innerHTML = ResourceNameMap.get(resType1);
		            conv_from_using_conc_res_td.appendChild(span);
			}
	        var br = document.createElement('br');
			conv_from_using_conc_res_td.appendChild(br);
			
			conv_need_volume_td.innerHTML += vol1;
			conv_need_volume_td.innerHTML += '<br>';
		}
		
		var conv_to_res_td = tr1.insertCell(-1);
		conv_to_res_td.style.border = 'solid';
		conv_to_res_td.innerHTML = '';
		
		for([concResType2, vol2] of conv1.ToResVolInSmallestUnit){
			if(conv_to_res_td.innerHTML != ''){
				conv_to_res_td.innerHTML += ', ';
			}
			conv_to_res_td.innerHTML += ResourceNameMap.get(concResType2);
			conv_to_res_td.innerHTML += ':';
			conv_to_res_td.innerHTML += vol2;
			
		}
		
		var conv_change_convert_order_td = tr1.insertCell(-1);
		conv_change_convert_order_td.style.border = 'solid';
		conv_change_convert_order_td.innerHTML = '';
		
		if(i >= 1){//トップの行でない場合
			conv2 = dispConvertList[i-1];
			
		    var beOnOne_btn_id = "beOnOne_Btn_"+conv1.convertType;
	        var btn = document.createElement('button');
	        btn.type = 'button';
	        btn.id = beOnOne_btn_id;
	        btn.value = conv1.convertType;
	        btn.innerText = "一つ上に";
	        btn.style.width = "70px";

	        //各'一つ上に'ボタンをクリックしたときの動作をセット            
	        btn.onclick = function(){
	            swapConvertOrder(conv1, conv2);
	            DisplayConvertListTable();
	            return;    
	        };

	        
			
		    var toTheTop_btn_id = "toTheTop_Btn_"+conv1.convertType;
	        var btn2 = document.createElement('button');
	        btn2.type = 'button';
	        btn2.id = beOnOne_btn_id;
	        btn2.value = conv1.convertType;
	        btn2.innerText = "一番上に";
	        btn2.style.width = "70px";

	        //各'一番上に'ボタンをクリックしたときの動作をセット            
	        btn2.onclick = function(){
	        	var conv3;
	        	for(var j=i-1; j>=0; j--){
	        		conv3 = dispConvertList[j];
	        		swapConvertOrder(conv1, conv3);
	        	}
	            DisplayConvertListTable();
	            return;    
	        };
	        
	        conv_change_convert_order_td.appendChild(btn);
	        conv_change_convert_order_td.appendChild(btn2);
        }
        
        if(i < (dispConvertList.length-1)){//最後の行でない場合
			conv2 = dispConvertList[i+1];
			
		    var takeOneDown_btn_id = "takeOneDown_Btn_"+conv1.convertType;
	        var btn = document.createElement('button');
	        btn.type = 'button';
	        btn.id = takeOneDown_btn_id;
	        btn.value = conv1.convertType;
	        btn.innerText = "一つ下に";
	        btn.style.width = "70px";

	        //各'一つ下に'ボタンをクリックしたときの動作をセット            
	        btn.onclick = function(){
	            swapConvertOrder(conv1, conv2);
	            DisplayConvertListTable();
	            return;    
	        };
	        conv_change_convert_order_td.appendChild(btn);
        }
        
		
	
	}
	
	convertListTbl.style.display = 'block';

	
	
}

function swapConvertOrder(conv1, conv2){
	var temp1;
	temp1 = conv1.convertOrder;
	conv1.convertOrder = conv2.convertOrder;
	conv2.convertOrder = temp1;
}

//変換順序をデフォルトに再設定ボタンを押したときの動作
function ResetConvertOrder(){
	var conv1;
	for(var i=0; i<g_ConvertList.length; i++){
		conv1 = g_ConvertList[i];
		conv1.convertOrder = ConvertOrderDefaultMap.get(conv1.convertType);
	}	
	DisplayConvertListTable();

}

//convType1を適用している建物のリストを取得する
function GetBuildingsByAppliedConversionType(buildObjList1, convType1){
	var result1 = [];
	
	buildObjList1.forEach( function(buildObj1){
		if(buildObj1.applyingConvertingType == convType1){
			result1.push(buildObj1);
		}
	});
	return result1;	
}

//適用されている変換のリストを取得する
function GetListOfAppliedConversion(buildObjList1){
	var result1 = [];
	var resultConvTypeList = [];
	var conv1;
	
	buildObjList1.forEach( function(buildObj1){
		if(!resultConvTypeList.includes(buildObj1.applyingConvertingType)){
			resultConvTypeList.push(buildObj1.applyingConvertingType);
			
			conv1 = GetConvertByConvType(buildObj1.applyingConvertingType);
			result1.push(conv1);
		}
	});
	return result1;
}
//'稼働中(変換中)'の建物リストを取得する
function GetKadouAndHenkan_TyuBuildings(buildObjList1){
	var result = [];
	
	for(var i=0; i<buildObjList1.length; i++){
		if( !IsBuildTypeForManuallyConversion(buildObjList1[i].buildType) &&//手動変換用建物は自動変換の対象外
			buildObjList1[i].status == BUILD_STS_KADOU_AND_HENKAN){
			result.push(buildObjList1[i]);
		}
	}
	
	return result;
}


//'稼働中(変換待機)'の建物リストを取得する
function GetKadouAndHenkanTaiki_TyuBuildings(buildObjList1){
	var result = [];
	
	for(var i=0; i<buildObjList1.length; i++){
		if( !IsBuildTypeForManuallyConversion(buildObjList1[i].buildType) &&//手動変換用建物は自動変換の対象外
			buildObjList1[i].status == BUILD_STS_KADOU_AND_HENKAN_TAIKI){
			result.push(buildObjList1[i]);
		}
	}
	
	return result;
}

//建設中の建物リストを取得する
function GetUnderConstructingBuildings(buildObjList1){
	var result = [];
	
	for(var i=0; i<buildObjList1.length; i++){
		if(buildObjList1[i].status == BUILD_STS_KENSETU){
			result.push(buildObjList1[i]);
		}
	}
	
	return result;
}

function AddBuildingObject(buildType, latitude, longitude){
	var buildId = "BuildObject"+ buildObjectMaxSeq;
	var buildName = BuildObjectTypeNameMap.get(buildType)+"_BuildObject"+buildObjectMaxSeq;
	var buildingObject1 = new BuildObject(buildId, buildType, buildName, latitude, longitude);
	
	g_BuildingList.push(buildingObject1);
	buildObjectMaxSeq++;	
}

function AddBuildingObjectConstructionAlready(buildType, latitude, longitude){
	var buildId = "BuildObject"+ buildObjectMaxSeq;
	var buildName = BuildObjectTypeNameMap.get(buildType)+"_BuildObject"+buildObjectMaxSeq;
	var buildingObject1 = new BuildObjectConstructionAlready(buildId, buildType, buildName, latitude, longitude);
	
	g_BuildingList.push(buildingObject1);
	buildObjectMaxSeq++;	
}

function InitBuildInfoList(){
	var convertList;
	var anableMaxConvertVolListMapAtOneProcess;
	var description;
	var needResForConstruction;
	
	//建物情報:田んぼを追加
	convertList = [CONV_HENKAN1];
	needResForConstruction = new Map();
	anableMaxConvertVolMapAtOneProcess = new Map();
	anableMaxConvertVolMapAtOneProcess.set(RES_TYPE_RICE, 6);
	description = "米を生産する";
	AddBuildingTypeInfo(BUILD_TYPE_PADDY_FIELD, 2, convertList, anableMaxConvertVolMapAtOneProcess, 2, CONV_HENKAN1, needResForConstruction, false, description);
	
	//建物情報:製材所を追加
	convertList = [CONV_HENKAN2];
	needResForConstruction = new Map();
	anableMaxConvertVolMapAtOneProcess = new Map();
	anableMaxConvertVolMapAtOneProcess.set(RES_TYPE_WOODEN_BOARD, 12);
	description = "木を加工する";
	AddBuildingTypeInfo(BUILD_TYPE_LUMBER_CAMP, 3, convertList, anableMaxConvertVolMapAtOneProcess, 3, CONV_HENKAN2, needResForConstruction, false, description);
	
	//建物情報:納屋を追加
	convertList = [];
	needResForConstruction = new Map();
	anableMaxConvertVolMapAtOneProcess = new Map();
	description = "材料を加工・作成する";
	AddBuildingTypeInfo(BUILD_TYPE_BARN, 0, convertList, anableMaxConvertVolMapAtOneProcess, 3, -1, needResForConstruction, false, description);
	
	//建物情報:家を追加
	convertList = [];
	needResForConstruction = new Map();
	anableMaxConvertVolMapAtOneProcess = new Map();
	description = "材料を加工・作成する2";
	AddBuildingTypeInfo(BUILD_TYPE_HOUSE, 0, convertList, anableMaxConvertVolMapAtOneProcess, 3, -1, needResForConstruction, false, description);
	
}

function AddBuildingTypeInfo(buildType, needStepForConvert, anableConvertList,
 anableMaxConvertVolMapAtOneProcess, needStepForConstruction, defaultConvertType,
 needResForConstruction, lockedFlg, description){

	var buildingTypeInfo1 = new BuildingTypeInfo(buildType, needStepForConvert, anableConvertList,
	 anableMaxConvertVolMapAtOneProcess, needStepForConstruction,  defaultConvertType, needResForConstruction, lockedFlg,
	 description);
	g_BuildTypeInfoList.push(buildingTypeInfo1);
	buildTypeInfoMaxSeq++;
	
}

function InitResourceList(){
	//資源:水を追加
	AddResource(RES_TYPE_WATER, 5, RES_GRAIN_SIZE_CONCREATE, null);
	
	//資源:米を追加
	AddResource(RES_TYPE_RICE, 0, RES_GRAIN_SIZE_CONCREATE, null);	

	//資源:木を追加
	AddResource(RES_TYPE_WOOD, 0, RES_GRAIN_SIZE_ROUGH, null);
		
	//資源:木板を追加
	AddResource(RES_TYPE_WOODEN_BOARD, 0, RES_GRAIN_SIZE_CONCREATE, null);
	
	//資源:松を追加
	AddResource(RES_TYPE_PINE, 0, RES_GRAIN_SIZE_CONCREATE, RES_TYPE_WOOD);
	
	//資源:ナラを追加
	AddResource(RES_TYPE_OAK, 2, RES_GRAIN_SIZE_CONCREATE, RES_TYPE_WOOD);
	
	//資源:スギを追加
	AddResource(RES_TYPE_CEDAR, 2, RES_GRAIN_SIZE_CONCREATE, RES_TYPE_WOOD);
	
	//資源:米の種を追加
	AddResource(RES_TYPE_RICE_SEED, 3, RES_GRAIN_SIZE_CONCREATE, null);	
	
	//資源:石を追加
	AddResource(RES_TYPE_STONE, 0, RES_GRAIN_SIZE_ROUGH, null);
	
	//資源:黒曜石を追加
	AddResource(RES_TYPE_KOKUYOU_SEKI, 2, RES_GRAIN_SIZE_CONCREATE, RES_TYPE_STONE);
	
	//資源:サヌキガン(石)を追加
	AddResource(RES_TYPE_SANUKI_GAN, 1, RES_GRAIN_SIZE_CONCREATE, RES_TYPE_STONE);
	
	//資源:頁岩を追加
	AddResource(RES_TYPE_KETU_GAN, 0, RES_GRAIN_SIZE_CONCREATE, RES_TYPE_STONE);
	
	//資源:釘を追加
	AddResource(RES_TYPE_NAIL, 0, RES_GRAIN_SIZE_CONCREATE, null);
	
	//資源:木の箱を追加
	AddResource(RES_TYPE_WOODEN_BOX, 0, RES_GRAIN_SIZE_CONCREATE, null);
	
}

function AddResource(resourceType, volume, grainSize, parentResourceType){	
	var resource1 = new Resource(resourceType, volume, grainSize, parentResourceType);
	g_ResourceList.push(resource1);
	resourceMaxSeq++;
}

//変換リストを初期化
function InitConvertList(){
	var FromResVolInSmallestUnit;
	var ToResVolInSmallestUnit;
	
	//変換1を設定
	FromResVolInSmallestUnit = new Map();
	FromResVolInSmallestUnit.set(RES_TYPE_WATER, 2);
	FromResVolInSmallestUnit.set(RES_TYPE_RICE_SEED, 1);

	ToResVolInSmallestUnit = new Map();
	ToResVolInSmallestUnit.set(RES_TYPE_RICE, 1);

	AddConvert(CONV_HENKAN1, false, 1, FromResVolInSmallestUnit, ToResVolInSmallestUnit, false);
	
	//変換2を設定
	FromResVolInSmallestUnit = new Map();
	FromResVolInSmallestUnit.set(RES_TYPE_WOOD, 3);

	ToResVolInSmallestUnit = new Map();
	ToResVolInSmallestUnit.set(RES_TYPE_WOODEN_BOARD, 6);

	AddConvert(CONV_HENKAN2, false, 2, FromResVolInSmallestUnit, ToResVolInSmallestUnit, false);
}

function AddConvert(convertType, noConsumptFlg, convertOrder,
 FromResVolInSmallestUnit, ToResVolInSmallestUnit, lockedFlg){
 
 var convert1 = new Convert(convertType, noConsumptFlg,  convertOrder, FromResVolInSmallestUnit,
  ToResVolInSmallestUnit, lockedFlg);
  g_ConvertList.push(convert1);
 
  convertMaxSeq++;
}

//変換名、手動変換名、資源名、建物の種類の日本語とカナのマップを作成する
function InitJpTermAndKanaYomiMap(){
	for([key1, val1] of HenkanNameMap){
		if(!JpTermAndKanaYomiMap.has(val1)){
			JpTermAndKanaYomiMap.set(val1, HenkanKanaNameMap.get(key1));
		}
	}

	for([key2, val2] of M_HenkanNameMap){
		if(!JpTermAndKanaYomiMap.has(val2)){
			JpTermAndKanaYomiMap.set(val2, M_HenkanKanaNameMap.get(key2));
		}
	}

	for([key3, val3] of ResourceNameMap){
		if(!JpTermAndKanaYomiMap.has(val3)){
			JpTermAndKanaYomiMap.set(val3, ResourceKanaNameMap.get(key3));
		}
	}

	for([key4, val4] of BuildObjectTypeNameMap){
		if(!JpTermAndKanaYomiMap.has(val4)){
			JpTermAndKanaYomiMap.set(val4, BuildObjectKanaNameMap.get(key4));
		}
	}

	for([key5, val5] of ToolNameMap){
		if(!JpTermAndKanaYomiMap.has(val5)){
			JpTermAndKanaYomiMap.set(val5, ToolKanaNameMap.get(key5));
		}
	}
}

function InitTab(){
	HiddenAllTab();
	DisplayTab(TAB_NAME_SAVE_DATA_ETC);
}

function ChangeTabWhenNotMobile(){
	if(deviceType != 'smartPhone'){
		ChangeTab();
	}
}

function ChangeTab(){
	HiddenAllTab();
	
	//選択されたタブを取得
	var form1 = document.getElementById("form1");
	var selectedTabIdx = form1.tabPages.selectedIndex;
	var selectedTabNm = form1.tabPages.options[selectedTabIdx].value;

	DisplayTab(selectedTabNm);
}

//指定したタブを表示
function DisplayTab(tabNm){

	//タブごとの各種表示用処理
	if(tabNm == TAB_NAME_SAVE_DATA_ETC){
		var statusElem = document.getElementById("fileLoadStatus1_OnSaveDataEtcTab");
		if(dataLoadedFlg == true){
			statusElem.innerHTML = "ロード済み";
		}else{
			statusElem.innerHTML = "ロード未処理";
		}
	}else if(tabNm == TAB_NAME_CONVERSION_SETTING){
		DisplayConvertListTable();
	}else if(tabNm == TAB_NAME_RESOURCE_LIST){
		DisplayResourceListTab();
	}else if(tabNm == TAB_NAME_BUILDING_LIST){
		DisplayBuildObjectListTable(g_BuildingList);
	}else if(tabNm == TAB_NAME_MANUALLY_CONVERT){
		DisplayManuallyConvertTab();
	}else if(tabNm == TAB_NAME_SELECT_MANUALLY_CONVERT_TYPE){
		DisplaySelectManuallyConvertTab();
	}else if(tabNm == TAB_NAME_VARIOUS_OPE){
		DisplayVariousOperationTab();
	}else if(tabNm == TAB_NAME_OWNED_TOOL_SELECT){
		DisplayOwnedToolListTab()
	}else if(tabNm == TAB_NAME_TOOL_LIST){
		DisplayToolListTab();
	}else if(tabNm == TAB_NAME_CONSTRUCT_BUILDING){
		DisplayConstructionBuildingTab();
	}

	var tabElem1 = document.getElementById(tabNm);
	tabElem1.style.display = 'block';

}
//すべてのタブを非表示にする
function HiddenAllTab(){
	var tabElem1;
	for(var i=0; i<AllTabNameList.length; i++){
		tabElem1 = document.getElementById(AllTabNameList[i]);
		tabElem1.style.display = 'none';
	}
	
	
}

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
	//タブ初期化
	InitTab();
	
	InitUserInfo();
	SettingTestData();
	
  g_MapOpts = {
    zoom: DEFAULT_ZOOM,//ズームレベル
    center: new google.maps.LatLng(g_UserInfo.latitude, g_UserInfo.longitude)
  };
  g_Map = new google.maps.Map(document.getElementById("map"), g_MapOpts);
  
  for(var i=0; i<g_BuildingList.length; i++){
  	  var marker1 = new google.maps.Marker();
  	  marker1.setPosition(new google.maps.LatLng(g_BuildingList[i].latitude, g_BuildingList[i].longitude));
  	  marker1.setTitle(g_BuildingList[i].name);
  	  marker1.setMap(g_Map);
  	  
  	  marker1.addListener('click', function(){
		HiddenAllTab();
  	  	var buildObj1 = GetBuildObjectByPosition(this.position.lat(), this.position.lng());
		g_CurrentBuildingObject = buildObj1;
		
		if( !IsBuildTypeForManuallyConversion(buildObj1.buildType) ){		
			DisplayBuildObjectDetail(buildObj1);
			DisplayTab(TAB_NAME_BUILDING_DETAIL_LIST);
			
		}else{
			g_CurrentManuallyConvert = null;
		
			//各タブのラジオボタンの値を更新
			var radioElemList = document.getElementsByName("radioSelectTabOnManuallyConvertTab");	
			for(var i=0; i<radioElemList.length; i++){
				if(radioElemList[i].value == TAB_NAME_MANUALLY_CONVERT){
					radioElemList[i].checked = true;
				}
			}
			
			radioElemList = document.getElementsByName("radioSelectTabOnOwnedToolSelectionTab");	
			for(var i=0; i<radioElemList.length; i++){
				if(radioElemList[i].value == TAB_NAME_MANUALLY_CONVERT){
					radioElemList[i].checked = true;
				}
			}
		
			DisplayTab(TAB_NAME_MANUALLY_CONVERT);
		}
		
  	  });
  }
  
  	/*
  	//マップをクリックしたときの処理(デバッグ用)
    g_Map.addListener('click', function(e){
        var latSpan = document.getElementById("latDisp1");
        var lngSpan = document.getElementById("lngDisp1");
        
        latSpan.innerHTML = e.latLng.lat();
        lngSpan.innerHTML = e.latLng.lng();
    });
    */
  
  
}

//多角形描画テストコード
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


/*

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
	
	var elem3 = document.getElementById("myData1");
	var jsonStr2 = elem3.text;	
	elem2.innerHTML = jsonStr2;
	
	var dataContract1 = GetMyDataContractByName("JsonObj");
	var val2 = ConvertToObjFromJsonStrByDataContract(jsonStr2, dataContract1);

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
*/

//オートコンプリート設定テストコード
function Test2(){
  var arr1 = ["test1", "test2", "100", "abc", "abd", "def", "diff"];
  //オートコンプリート値を設定する
  for(var i=0;i<arr1.length;i++){
    let op = document.createElement("option");
    op.value = arr1[i];
    document.getElementById("forDebugKeywords").appendChild(op);
  }
}

function Test3(){

	var url = "sample01.txt";
	var request = createXMLHttpRequest();
	request.open("GET", url, true);
	request.send("");

}





var file = document.getElementById('selectFile1');
var result = document.getElementById('forDebugP1');
 
// File APIに対応しているか確認
if(window.File && window.FileReader && window.FileList && window.Blob) {
    function loadLocalCsv(e) {
        // ファイル情報を取得
        var fileData = e.target.files[0];
 
 		//ファイルが選択されていないときは処理を止める
 		if(typeof fileData == "undefined"){
 		   	alert('ファイルを選択してください');
 		   	return;
 		 }
 		 
        // JSON/TXTファイル以外は処理を止める
        if(!fileData.name.match('.json$') && !fileData.name.match('.txt$')) {
            alert('JSON/TXTファイルを選択してください');
            return;
        }
 
        // FileReaderオブジェクトを使ってファイル読み込み
        var reader = new FileReader();
        // ファイル読み込みに成功したときの処理
        reader.onload = function() {
            result.innerHTML = reader.result;
            
			var jsonStr2 = reader.result;	
			var dataContract1 = GetMyDataContractByName("JsonObj");
			var val2 = ConvertToObjFromJsonStrByDataContract(jsonStr2, dataContract1);
        }
        // ファイル読み込みを実行
        reader.readAsText(fileData, 'UTF-8');

        dataLoadedFlg = true;
		DisplayTab(TAB_NAME_SAVE_DATA_ETC);        
    }
    
    //file.addEventListener('change', loadLocalCsv, false);
    file.onchange = function(e){
    	loadLocalCsv(e);
    	

    };
 
} else {
    file.style.display = 'none';
    result.innerHTML = 'File APIに対応したブラウザでご確認ください';
}

