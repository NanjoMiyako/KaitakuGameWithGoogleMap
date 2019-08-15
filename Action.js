//Actionのコンストラクタ等

//全Actionのリスト(表示時には実行可能なもののみ表示するようにする)
var g_ActionList = [];
var ActionMaxSeq = 1;

//クラスのコンストラクタ関係
//Actionのコンストラクタ
//actionDiv='取得'の時、targetCandidateResTypeList:取得候補リソース , targetVol:取得基本量
//acitonDiv='取得確率変更'の時、targetCandidateResTypeList:取得確率変更対象リソース , targetVol:確率変動量(±n%単位で指定)
function Action(actionType, noNeedBuildingFlg, needBuildingType,
 needToolList, actionDiv, targetCandidateResTypeList, targetVol, 
 triggerProbability,  needStamina,
 triggerTime, duration, lockedFlg, actionFunc,
 checkCanWorkFunc){
	this.actionType = actionType;
	this.noNeedBuildingFlg = noNeedBuildingFlg;
	
	if(noNeedBuildingFlg == true){
		this.needBuildingType = [];
	}else{
		this.needBuildingType = needBuildingType;
	}
	
	this.needToolList = needToolList;
	this.actionDiv = actionDiv;
	this.targetCandidateResTypeList = targetCandidateResTypeList;
	this.targetVol = targetVol;
	this.triggerProbability = triggerProbability;
	this.needStamina = needStamina;
	this.triggerTime = triggerTime;
	this.duration = duration;//持続時間は秒単位で設定
	this.lockedFlg = lockedFlg;
	
	if(actionFunc != null){
		this.work = actionFunc;
	}else{
		this.work = DefaultActionFunc;
	}
	
	if(checkCanWorkFunc != null){
		this.check = checkCanWorkFunc;
	}else{
		this.check = DefaultCheckCanWorkFunc;
	}
}

//アクションが発動中かどうか
Action.prototype.isActivated = function(){
	var currentDt = new Date();
	var triggerEndTimeDt1;
	if(this.triggerTime != null &&
	   this.triggerTime != ""){
	   triggerEndTimeDt1 = getDateFromDateTimeStr(this.triggerTime);
	   triggerEndTimeDt1.setSeconds(triggerEndTimeDt1.getSeconds() + this.duration);
	   
	   if(currentDt.getTime() <= triggerEndTimeDt1.getTime()){
	   		return true;
	   }else{
	   		this.triggerTime = "";//発動期間外だった場合は発動時刻をクリアする
	   }
	   
	}
	return false;	
}
function GetActionByActionType(actionType){
	for(var i=0; i<g_ActionList.length; i++){
		if(g_ActionList[i].actionType == actionType){
			return g_ActionList[i];
		}
	}
	return null;
}

function GetEnableActionListWithNoNeedBuilding(){
	var resultActionList = [];
	
	var action1;
	for(var i=0; i<g_ActionList.length; i++){
		action1 = g_ActionList[i];
		if(action1.check()){
			resultActionList.push(action1);
		}
	}
	
	return resultActionList;

}

function DefaultActionFunc(){
	var message;
	
	ClearActionResult();
	message = ActionNameMap.get(this.actionType) + "を実行しました";
	OutputActionResult(message);
	
	if(this.actionDiv == ACT_DIV_ACQUIRE){
		var getVolMap = new Map();
		var getVol = this.targetVol + Math.round( Math.random() * (ACT_ACQUIRE_GOSA-1));
		
		//取得候補をランダムに作成
		var randomNum;
		var oneKindPercentage = MAX_PERCENTAGE / this.targetCandidateResTypeList.length;
		var randomIdx;
		for(var i=0; i<getVol; i++){
			if(this.targetCandidateResTypeList.length >= 2){
				randomNum = Math.round( Math.random() * (MAX_PERCENTAGE-1) );
				for(randomIdx=0; randomIdx<this.targetCandidateResTypeList.length; randomIdx++){
					if(randomNum <= (oneKindPercentage * (randomIdx + 1)) ){
						break;
					}
				}
			}else{
				randomIdx = 0;
			}

			if( !getVolMap.has(this.targetCandidateResTypeList[randomIdx]) ){
				getVolMap.set(this.targetCandidateResTypeList[randomIdx], 0);
			}
			getVolMap.set(this.targetCandidateResTypeList[randomIdx], getVolMap.get(this.targetCandidateResTypeList[randomIdx])+1);
		}
		
		var Res1;
		for([resType1, vol1] of getVolMap){
			Res1 = GetResourceByResType(g_ResourceList, resType1);
			Res1.volume += vol1;
			
			message = ResourceNameMap.get(resType1) + "を" + vol1 + "手に入れた";
			OutputActionResult(message);
		}


	}else if(this.actionDiv == ACT_DIV_ACQUISITION_PROBABILITY_CHANGE){
		
	}
	
	this.triggerTime = makeCurrentDateTimeStr();
	g_UserInfo.currentStamina -= this.needStamina;
	
	return false;
}

function DefaultCheckCanWorkFunc(){
	if(this.lockedFlg){
		return false;
	}
	
	if(this.noNeedBuildingFlg == false){
		return false;
	}
	
	//すでに発動中かどうか
	var currentDt = new Date();
	var triggerEndTimeDt1;
	if(this.triggerTime != null &&
	   this.triggerTime != ""){
	   triggerEndTimeDt1 = getDateFromDateTimeStr(this.triggerTime);
	   triggerEndTimeDt1.setSeconds(triggerEndTimeDt1.getSeconds() + this.duration);
	   
	   if(currentDt.getTime() <= triggerEndTimeDt1.getTime()){
	   		return false;
	   }
	   
	}
	
	if(g_UserInfo.currentStamina < this.needStamina){
		return false;
	}	

	return true;
}

function InitActionList(){

	//アクション:石の採取を追加
	AddAction(ACT_TYPE_GET_STONE, true, [], [], 
	ACT_DIV_ACQUIRE, [RES_TYPE_KOKUYOU_SEKI, RES_TYPE_SANUKI_GAN, RES_TYPE_KETU_GAN], 3, 100, 3,
	"", 0, 
	false, null, null);
	
	//アクション:木の枝の採取を追加
	AddAction(ACT_TYPE_GET_BRANCH, true, [], [], 
	ACT_DIV_ACQUIRE, [RES_TYPE_PINE, RES_TYPE_OAK, RES_TYPE_CEDAR], 4, 100, 2,
	"", 0, 
	false, null, null);
	
	//アクション:水の採取を追加
	AddAction(ACT_TYPE_GET_WATER, true, [], [], 
	ACT_DIV_ACQUIRE, [RES_TYPE_WATER], 7, 100, 3,
	"", 0, 
	false, null, null);
}

function AddAction(actionType, noNeedBuildingFlg, needBuildingType,
 needToolList, actionDiv, targetCandidateResTypeList, targetVol, 
 triggerProbability,  needStamina,
 triggerTime, duration, lockedFlg, actionFunc,
 checkCanWorkFunc){
 
 var action1 = new Action(actionType, noNeedBuildingFlg, needBuildingType,
 needToolList, actionDiv, targetCandidateResTypeList, targetVol, 
 triggerProbability,  needStamina,
 triggerTime, duration, lockedFlg, actionFunc,
 checkCanWorkFunc);
 
 g_ActionList.push(action1);
 ActionMaxSeq++;
 
}