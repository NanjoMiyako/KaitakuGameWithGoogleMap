//Toolのコンストラクタ等

//全道具リスト(表示時には現在の量が1以上のもののみ表示するようにする)
var g_ToolList = [];

var toolMaxSeq;

//クラスのコンストラクタ関係
//Toolのコンストラクタ
function Tool(toolType, volume, toolDiv, recoveryStaminaVol){
	this.toolType = toolType;
	this.volume = volume;
	this.toolDiv = toolDiv;
	
	if(toolDiv == TOOL_DIV_FOOD){
		this.recoveryStaminaVol = recoveryStaminaVol;
	}else{
		this.recoveryStaminaVol = 0;
	}
}

function InitToolList(){
	//道具:石ハンマーを追加
	AddTool(TOOL_TYPE_ST_HAMMER, 1, TOOL_DIV_KOUGU, 0);
	
	//道具:おにぎりを追加
	AddTool(TOOL_TYPE_ONIGIRI, 1, TOOL_DIV_FOOD, 10);
	
}

function AddTool(toolType, volume, toolDiv, recoveryStaminaVol){
	var tool1 = new Tool(toolType, volume, toolDiv, recoveryStaminaVol);
	g_ToolList.push(tool1);
	toolMaxSeq++;
}

function GetToolByToolType(toolType){
	for(var i=0; i<g_ToolList.length; i++){
		if(g_ToolList[i].toolType == toolType){
			return g_ToolList[i];
		}
	}
	return null;
}
