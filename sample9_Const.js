//各種定数
//色
const COLOR_RED_STR = "#ff0000";
const COLOR_GREEN_STR = "#00ff00";
const COLOR_GREEN_STR2 = "#00e600";
const COLOR_BLUE_STR = "#0000ff";
const COLOR_BLACK_STR = "#000000";

//型を表す文字列
const PROP_TYPE_MAP_STR = "[object Map]";
const PROP_TYPE_STRING_STR = "[object String]";
const PROP_TYPE_INT_STR = "[object Number]";
const PROP_TYPE_ARRAY_STR = "[object Array]";
const PROP_TYPE_OBJECT_STR = "[object Object]";

//タブ名
const TAB_NAME_SAVE_DATA_ETC = "tab_SaveDataEtc";
const TAB_NAME_BUILDING_LIST = "tab_BuildingList";
const TAB_NAME_VARIOUS_OPE = "tab_VariousOperation";
const TAB_NAME_CONVERSION_SETTING = "tab_ConversionSettings";
const TAB_NAME_RESOURCE_LIST ="tab_ResourceList";
const TAB_NAME_CONSTRUCT_BUILDING = "tab_ConstructBuilding";
const TAB_NAME_BUILDING_DETAIL_LIST = "tab_BuildingDetailList";//各建物の詳細タブ(hidden)
const TAB_NAME_MANUALLY_CONVERT = "tab_ManuallyConvert"; //手動変換タブ(hidden)
const TAB_NAME_SELECT_MANUALLY_CONVERT_TYPE = "tab_SelectManuallyConvertType";//手動変換タイプ選択タブ(hidden)
const TAB_NAME_OWNED_TOOL_SELECT ="tab_OwnedToolSelection";//所有道具選択タブ(hidden)
const TAB_NAME_TOOL_LIST = "tab_ToolList";

//各タブ名のリスト
const AllTabNameList = [
TAB_NAME_SAVE_DATA_ETC,
TAB_NAME_BUILDING_LIST,
TAB_NAME_VARIOUS_OPE,
TAB_NAME_CONVERSION_SETTING,
TAB_NAME_RESOURCE_LIST,
TAB_NAME_BUILDING_DETAIL_LIST,
TAB_NAME_MANUALLY_CONVERT,
TAB_NAME_SELECT_MANUALLY_CONVERT_TYPE,
TAB_NAME_OWNED_TOOL_SELECT,
TAB_NAME_TOOL_LIST
];

//道具一覧タブのラジオボタンの値に対応する定数
const RADIO_VALUE_ONLY_HAVING = 1;//所持中の道具のみ
const RADIO_VALUE_ALL_TOOL = 2;//すべての道具

//設定できる優先順位の最大値
const BOTTOM_PRIORITY_NUMBER = 100;

//建物区分(0以上の値)
const BUILD_TYPE_PADDY_FIELD = 0;//田んぼ
const BUILD_TYPE_LUMBER_CAMP = 1;//製材所
const BUILD_TYPE_BARN = 2;		 //納屋
const BUILD_TYPE_HOUSE = 3;		 //家

//建物のステータス
const BUILD_STS_KENSETU = 0;				//建設中
const BUILD_STS_KADOU_AND_HENKAN = 1;		//稼働中(変換中)
const BUILD_STS_KADOU_AND_HENKAN_TAIKI = 2;	//稼働中(変換待機中、稼働しているが、リソース不足で変換実行できなかったとき)
const BUILD_STS_KADOU_TEISHI = 3;			//稼働停止中

//カウントする時間経過(ミリ秒)
const TIMEOUT_INTERVAL = 1000;
//1スタミナが回復するための時間(秒)
const ONE_STAMINA_RECOVERY_SECOND = 60;


//資源の種類
const RES_TYPE_WATER = 0;//水
const RES_TYPE_RICE = 1;//米
const RES_TYPE_WOOD = 2;//木(大まか)
const RES_TYPE_WOODEN_BOARD = 3;//木の板
const RES_TYPE_PINE = 4;//松
const RES_TYPE_OAK = 5;//ナラ
const RES_TYPE_CEDAR = 6;//スギ
const RES_TYPE_RICE_SEED = 7;//コメの種
const RES_TYPE_STONE = 8; //石(大まか)
const RES_TYPE_KOKUYOU_SEKI = 9; //黒曜石(コクヨウセキ)
const RES_TYPE_SANUKI_GAN = 10;  //サヌキガン(石)
const RES_TYPE_KETU_GAN = 11;	 //頁岩(ケツガン,石)
const RES_TYPE_NAIL = 12;		 //釘(クギ)
const RES_TYPE_WOODEN_BOX = 13;  //木の箱

//資源の粒度区分(具体的/大まか, 具体的な資源に対して大まかな資源は1つのみとする)
const RES_GRAIN_SIZE_CONCREATE = 0; //具体的な資源(コイ、サケ等)
const RES_GRAIN_SIZE_ROUGH = 1;     //大まかな資源(魚等)

//Actionの区分(取得・取得確率変更・その他)
const ACT_DIV_ACQUIRE = 0;//取得
const ACT_DIV_ACQUISITION_PROBABILITY_CHANGE = 1;//取得確率変更
const ACT_DIV_OTHER = 2;//その他

//取得アクション時の取得量の誤差量
const ACT_ACQUIRE_GOSA = 2;

//100分率の最大値
const MAX_PERCENTAGE =  100;

//自動変換の種類(具体・大まかな資源から具体的な資源のみ生成することにする)
const CONV_HENKAN1 = 0; //(水:2, 米の種:1 -> 米:1)
const CONV_HENKAN2 = 1; //(木:3 -> 木の板:6)

//手動変換の種類
const M_CONV_HENKAN1 = 0; //{黒曜石, 讃岐岩, 頁岩}:1, {杉,ナラ,松}:1 -> 石ハンマー:1
const M_CONV_HENKAN2 = 1; //石ハンマー:1, 釘:4, 木の板:5 -> 箱:1
const M_CONV_HENKAN3 = 3; //米:2 -> おにぎり:1

//Unitの区分
const UNIT_DIV_RESOURCE = 0; //資源
const UNIT_DIV_TOOL = 1;     //道具

//道具の種類
const TOOL_TYPE_ST_HAMMER = 0;	//石ハンマー
const TOOL_TYPE_ONIGIRI = 1;	//おにぎり
	
//レベル・スキルのカテゴリ
const CATEGORY_GENERAL = 0;  //総合
const CATEGORY_FARMING = 1;  //農耕
const CATEGORY_GATHERING = 2;//採集

//デフォルトのスタミナ値・最大所持可能量・初期位置・初期ズーム量
const DEFAULT_MAX_STAMINA = 100;
const DEFAULT_MAX_VOLUME_OF_HAVING = 30;
const DEFAULT_LATITUDE = 34.9171779940618;
const DEFAULT_LONGITUDE = 135.80503391470347;
const DEFAULT_ZOOM = 16;

//緯度・経度関係の定数
const NUMBER_DIGIT_OF_PRECISION = 6.0;
const PI = 3.14159265359;
const TIKYU_HANKEI = 6378150.0;
const TIKYU_ENSYU = 2 * PI * TIKYU_HANKEI;
const TIKYU_ONE_DO_METER = TIKYU_ENSYU / 360.0;//緯度1度の距離
const LATITUDE_PER_METER = 1.0/TIKYU_ONE_DO_METER; //一メートルの距離当たりの緯度

//アクションの種類
const ACT_TYPE_GET_STONE = 0;  //石の採取
const ACT_TYPE_GET_BRANCH = 1; //木の枝の採取
const ACT_TYPE_GET_WATER = 2;  //水の採取

//道具の区分
const TOOL_DIV_KOUGU = 0;//工具
const TOOL_DIV_FOOD  = 1;//食糧

//手動変換の区分
const MCONV_DIV_KOUSAKU = 0;//工作
const MCONV_DIV_COOKING = 1;//料理


const ActionNameMap = new Map()
	.set(ACT_TYPE_GET_STONE, "石の採取")
	.set(ACT_TYPE_GET_BRANCH, "木の枝の採取")
	.set(ACT_TYPE_GET_WATER, "水の採取");

const ActionKanaNameMap = new Map()
	.set(ACT_TYPE_GET_STONE, "イシノサイシュ")
	.set(ACT_TYPE_GET_BRANCH, "キノエダノサイシュ")
	.set(ACT_TYPE_GET_WATER, "ミズノサイシュ");

var HenkanNameMap = new Map()
	.set(CONV_HENKAN1, "変換1(米の生産)")
	.set(CONV_HENKAN2, "変換2(木の加工)");
	
const HenkanKanaNameMap = new Map()
	.set(CONV_HENKAN1, "ヘンカン1(コメノセイサン)")
	.set(CONV_HENKAN2, "ヘンカン2(キノカコウ)");
	
const M_HenkanNameMap = new Map()
	.set(M_CONV_HENKAN1, "手動変換1(石ハンマーの作成)")
	.set(M_CONV_HENKAN2, "手動変換2(箱の作成)")
	.set(M_CONV_HENKAN3, "手動変換3(おにぎりを作る)");

const M_HenkanKanaNameMap = new Map()
	.set(M_CONV_HENKAN1, "シュドウヘンカン1(イシハンマーのサクセイ)")
	.set(M_CONV_HENKAN2, "シュドウヘンカン2(ハコノサクセイ)")
	.set(M_CONV_HENKAN3, "シュドウヘンカン3(オニギリヲツクル)");

//道具名
const ToolNameMap = new Map()
	.set(TOOL_TYPE_ST_HAMMER, "石ハンマー")
	.set(TOOL_TYPE_ONIGIRI, "おにぎり");
	
const ToolKanaNameMap = new Map()
	.set(TOOL_TYPE_ST_HAMMER, "イシハンマー")
	.set(TOOL_TYPE_ONIGIRI, "オニギリ");

//道具区分名
const ToolDivNameMap = new Map()
	.set(TOOL_DIV_KOUGU, "工具")
	.set(TOOL_DIV_FOOD, "食糧");
	

//資源名
const ResourceNameMap = new Map()
	.set(RES_TYPE_WATER, "水")
	.set(RES_TYPE_RICE, "米")
	.set(RES_TYPE_WOOD, "木")
	.set(RES_TYPE_WOODEN_BOARD, "木の板")
	.set(RES_TYPE_PINE, "松") 
	.set(RES_TYPE_OAK, "ナラ")
	.set(RES_TYPE_CEDAR, "スギ")
	.set(RES_TYPE_RICE_SEED, "米の種")
	.set(RES_TYPE_STONE, "石")
	.set(RES_TYPE_KOKUYOU_SEKI, "黒曜石")
	.set(RES_TYPE_SANUKI_GAN, "サヌキガン(石)")
	.set(RES_TYPE_KETU_GAN, "頁岩")
	.set(RES_TYPE_NAIL, "釘")
	.set(RES_TYPE_WOODEN_BOX, "木の箱");

	
const ResourceKanaNameMap = new Map()
	.set(RES_TYPE_WATER, "ミズ")
	.set(RES_TYPE_RICE, "コメ")
	.set(RES_TYPE_WOOD, "キ")
	.set(RES_TYPE_WOODEN_BOARD, "キノイタ")
	.set(RES_TYPE_PINE, "マツ") 
	.set(RES_TYPE_OAK, "ナラ")
	.set(RES_TYPE_CEDAR, "スギ")
	.set(RES_TYPE_RICE_SEED, "コメノタネ")
	.set(RES_TYPE_STONE, "イシ")
	.set(RES_TYPE_KOKUYOU_SEKI, "コクヨウセキ")
	.set(RES_TYPE_SANUKI_GAN, "サヌキガン(イシ)")
	.set(RES_TYPE_KETU_GAN, "ケツガン")
	.set(RES_TYPE_NAIL, "クギ")
	.set(RES_TYPE_WOODEN_BOX, "キノハコ");

const ConvertOrderDefaultMap = new Map()
	.set(CONV_HENKAN1, 1)
	.set(CONV_HENKAN2, 2);

const BuildObjectTypeNameMap = new Map()
	.set(BUILD_TYPE_PADDY_FIELD, "田んぼ")
	.set(BUILD_TYPE_LUMBER_CAMP, "製材所")
	.set(BUILD_TYPE_BARN, "納屋")
	.set(BUILD_TYPE_HOUSE, "家");
	
const BuildObjectKanaNameMap = new Map()
	.set(BUILD_TYPE_PADDY_FIELD, "タンボ")
	.set(BUILD_TYPE_LUMBER_CAMP, "セイザイショ")
	.set(BUILD_TYPE_BARN, "ナヤ")
	.set(BUILD_TYPE_HOUSE, "イエ");
	
const BuildObjectStsNameMap = new Map()
	.set(BUILD_STS_KENSETU, "建設中")
	.set(BUILD_STS_KADOU_AND_HENKAN, "稼働中(変換中)")
	.set(BUILD_STS_KADOU_AND_HENKAN_TAIKI, "稼働中(変換待機)")
	.set(BUILD_STS_KADOU_TEISHI, "稼働停止中");
	
const BuildTypeInfoImageMap = new Map()
	.set(BUILD_TYPE_PADDY_FIELD, "img1_tanbo.png")
	.set(BUILD_TYPE_LUMBER_CAMP, "img2_seizaisyo.png")
	.set(BUILD_TYPE_BARN, "img3_barn.png");

var JpTermAndKanaYomiMap = new Map();

