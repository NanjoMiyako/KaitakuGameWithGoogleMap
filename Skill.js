//Skillのコンストラクタ等

//クラスのコンストラクタ関係
//Skillのコンストラクタ
function Skill(skillType, targetActionListToUnlock, targetMConvListToUnlock, 
 targetBuildTypeListToUnlock, description,
 acquisitionEffectFunc, needLevelMapToAcquire, needExpMapToAcquire,
 needSkillListToAcquire){
 this.skillType = skillType;
 this.targetActionListToUnlock = targetActionListToUnlock;
 this.targetMConvListToUnlock = targetMConvListToUnlock;
 this.targetBuildTypeListToUnlock = targetBuildTypeListToUnlock;
 this.description = description;
 
 if(acquisitionEffectFunc != null){
 	this.acquisitionEffectFunc = acquisitionEffectFunc;
 }
 
 this.needLevelMapToAcquire = needLevelMapToAcquire;
 this.needExpMapToAcquire = needExpMapToAcquire;
 this.needSkillListToAcquire = needSkillListToAcquire;
 
}

Skill.prototype.checkToAcquire = function(UserInfo1){
	return checkToAcquireFunc(UserInfo1, this);
};

function checkToAcquireFunc(UserInfo1, skill1){

	var crLevel;
	for([needCategory, needLevel] of skill1.needLevelMapToAcquire){
		crLevel = UserInfo1.levelByCategory.get(needCategory);
		if(crLevel < needLevel){
			return false;
		}
	}
	
	var crExp;
	for([needCategory2, needExp] of skill1.needExpMapToAcquire){
		crExp = UserInfo1.havingExpMap.get(needCategory2);
		if(crExp < needExp){
			return false;
		}
	}
	
	var crSkill = UserInfo1.skillList;
	for(var i=0; i<skill1.needSkillListToAcquire.length; i++){
		if(!crSkill1.includes(skill1.needSkillListToAcquire[i])){
			return false;
		}
	}
	
	return true;
	
}