//UserInfoのコンストラクタ等
//ユーザー情報(1個だけ)
var g_UserInfo;

//スタミナ回復計算用経過時間
var g_Count_RecoverySecond = 0;

//クラスのコンストラクタ関係
//UserInfoのコンストラクタ
function UserInfo(levelByCategory, skillList, havingToolVolMap,
 havingExpMap, maxVolumeOfHaving, maxStamina, currentStamina,
 latitude, longitude){
	this.levelByCategory = levelByCategory;
	this.skillList = skillList;
	this.havingToolVolMap = havingToolVolMap;
	this.havingExpMap = havingExpMap;
	this.maxVolumeOfHaving = maxVolumeOfHaving;
	this.maxStamina = maxStamina;
	this.currentStamina = currentStamina;
	this.latitude = latitude;
	this.longitude = longitude;
}

//道具を食べる
UserInfo.prototype.eat = function Eating(toolType){
	var prev_vol = this.havingToolVolMap.get(toolType);
	if(prev_vol-1 >= 1){
		this.havingToolVolMap.set(toolType, prev_vol-1);
	}else{
		this.havingToolVolMap.delete(toolType);
	}
	
	var Tool1 = GetToolByToolType(toolType);
	Tool1.volume -= 1;
	g_UserInfo.recovery(Tool1.recoveryStaminaVol);
}

//スタミナを回復
UserInfo.prototype.recovery = function RecoveryStamina(recoveryVol){
	if(this.currentStamina + recoveryVol > this.maxStamina){
		this.currentStamina = this.maxStamina;
	}else{
		this.currentStamina += recoveryVol;
	}
	
}

function InitUserInfo(){
	var levelByCategory = new Map()
	.set(CATEGORY_GENERAL, 1)
	.set(CATEGORY_FARMING, 1)
	.set(CATEGORY_GATHERING, 1);
	
	var skillList = [];
	var havingToolVolMap = new Map();
	var havingExpMap = new Map()
	.set(CATEGORY_GENERAL, 0)
	.set(CATEGORY_FARMING, 0)
	.set(CATEGORY_GATHERING, 0);
	var maxVolumeOfHaving = DEFAULT_MAX_VOLUME_OF_HAVING;
	var maxStamina = DEFAULT_MAX_STAMINA;
	var currentStamina = DEFAULT_MAX_STAMINA;
	var latitude = DEFAULT_LATITUDE;
	var longitude = DEFAULT_LONGITUDE;
	
	g_UserInfo = new UserInfo(levelByCategory, skillList, havingToolVolMap,
	 havingExpMap, maxVolumeOfHaving, maxStamina, currentStamina,
	 latitude, longitude);
	 
	 g_Count_RecoverySecond = 0;	 
	//時間経過のスタミナ回復をセット
	setTimeout("CountRecoverySecond()", TIMEOUT_INTERVAL); 
}


//時間経過のスタミナ回復カウントメソッド
function CountRecoverySecond(){
	g_Count_RecoverySecond++;
	if(g_Count_RecoverySecond >= ONE_STAMINA_RECOVERY_SECOND){
		g_UserInfo.recovery(1);
		g_Count_RecoverySecond = 0;
	}

	//現在のタブが'各種動作'タブの場合はスタミナ表示を更新
	var currentTabList = GetShowingTabNameList();
	if(currentTabList.includes(TAB_NAME_VARIOUS_OPE)){
		if(g_Count_RecoverySecond == 0){
			DisplayVariousOperationTab();
		}else{
			UpdateStaminaHyoji();
		}
	}
	
	//setTimeout("CountRecoverySecond()", TIMEOUT_INTERVAL);
	

}