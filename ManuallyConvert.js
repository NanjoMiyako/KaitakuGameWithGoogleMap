//ManuallyConvert(主に納屋での変換)のコンストラクタ等

//全手動変換リスト(表示時には開放されている(lockedFlg=false)のもののみ表示するようにする)
var g_ManuallyConvertList = [];
var g_CurrentManuallyConvert = null;

//クラスのコンストラクタ関係
//ManuallyConvertのコンストラクタ
function ManuallyConvert(manuallyConvertType, fromUnitList, toUnitList, lockedFlg, convertDiv){
	this.manuallyConvertType = manuallyConvertType//手動変換ID
	this.fromUnitList = fromUnitList;
	this.toUnitList = toUnitList;
	this.lockedFlg = lockedFlg;
	this.convertDiv = convertDiv;
}

//変換IDから手動変換を取得する
function GetManuallyConvertByManuallyConvertType(manuallyConvertType){
	for(var i=0; i<g_ManuallyConvertList.length; i++){
		if(g_ManuallyConvertList[i].manuallyConvertType == manuallyConvertType){
			return g_ManuallyConvertList[i];
		}
	}
	return null;
}

//現在の選択しているマーカに対応する手動変換かどうか判定するメソッド
function checkManuallyConvertByCurrentBuilding(manuallyConvert1){
	if(g_CurrentBuildingObject.buildType == BUILD_TYPE_BARN){//納屋の場合'工作'区分の手動変換のみ
		if(manuallyConvert1.convertDiv != MCONV_DIV_KOUSAKU){
			return false;
		}
	}else if(g_CurrentBuildingObject.buildType == BUILD_TYPE_HOUSE){//家の場合'料理'区分の手動変換のみ
		if(manuallyConvert1.convertDiv != MCONV_DIV_COOKING){
			return false;
		}
	}
	
	return true;

}

function InitManuallyConvertList(){
	var unitDiv;
	var typeList;
	var Vol;
	var unit1;
	var unit2;
	var unit3;
	
	var toUnitList;
	var fromUnitList;
	
	var manuallyConv1;
	
	//fromUnitListをセット(手動変換1)
	fromUnitList = [];
	unit1 = new Unit(UNIT_DIV_RESOURCE,[RES_TYPE_KOKUYOU_SEKI, RES_TYPE_SANUKI_GAN, RES_TYPE_KETU_GAN], 1);
	unit2 = new Unit(UNIT_DIV_RESOURCE, [RES_TYPE_PINE, RES_TYPE_OAK, RES_TYPE_CEDAR], 1);
	fromUnitList.push(unit1);
	fromUnitList.push(unit2);
	
	//toUnitListをセット(手動変換1)
	toUnitList = [];
	unit1 = new Unit(UNIT_DIV_TOOL, [TOOL_TYPE_ST_HAMMER], 1);
	toUnitList.push(unit1);
	
	//手動変換1を追加
	manuallyConv1 = new ManuallyConvert(M_CONV_HENKAN1, fromUnitList, toUnitList, false, MCONV_DIV_KOUSAKU);
	g_ManuallyConvertList.push(manuallyConv1);
	
	//fromUnitListをセット(手動変換2)
	fromUnitList = [];
	unit1 = new Unit(UNIT_DIV_TOOL, [TOOL_TYPE_ST_HAMMER], 1);
	unit2 = new Unit(UNIT_DIV_RESOURCE, [RES_TYPE_NAIL], 4);
	unit3 = new Unit(UNIT_DIV_RESOURCE, [RES_TYPE_WOODEN_BOARD], 5);
	fromUnitList.push(unit1);
	fromUnitList.push(unit2);
	fromUnitList.push(unit3);
	
	//toUnitListをセット(手動変換2)
	toUnitList = [];
	unit1 = new Unit(UNIT_DIV_RESOURCE, [RES_TYPE_WOODEN_BOX], 1);
	toUnitList.push(unit1);
	
	//手動変換2を追加
	manuallyConv1 = new ManuallyConvert(M_CONV_HENKAN2, fromUnitList, toUnitList, false, MCONV_DIV_KOUSAKU);
	g_ManuallyConvertList.push(manuallyConv1);
	
	//fromUnitListをセット(手動変換3)
	fromUnitList = [];
	unit1 = new Unit(UNIT_DIV_RESOURCE, [RES_TYPE_RICE], 2);
	fromUnitList.push(unit1);
	
	//toUnitListをセット(手動変換3)
	toUnitList = [];
	unit1 = new Unit(UNIT_DIV_TOOL, [TOOL_TYPE_ONIGIRI], 1)
	toUnitList.push(unit1);
	
	//手動変換3を追加
	manuallyConv1 = new ManuallyConvert(M_CONV_HENKAN3, fromUnitList, toUnitList, false, MCONV_DIV_COOKING);
	g_ManuallyConvertList.push(manuallyConv1);	
	
	

}