class DataCache{
  List<Magic> _magics;
  List<Magic> get magics => _magics;
  List<Sundries> _sundries;
  List<Sundries> get sundries => _sundries;
  List<Hero> _heros;
  List<Hero> get heros => _heros;
  List<dynamic> _weapons;
  List<dynamic> get weapons => _weapons;
  List<dynamic> _armors;
  List<dynamic> get armors => _armors;
  List<dynamic> _assists;
  List<dynamic> get assists => _assists;
  List<Shop> _shops;
  List<Shop> get shops => _shops;
  List<Team> _teams;
  List<Team> get teams => _teams;
  List<dynamic> _unitInfos;
  List<dynamic> get unitInfos => _unitInfos;
  List<dynamic> _battlePlayerUnits;
  List<dynamic> get battlePlayerUnits => _battlePlayerUnits;
  List<dynamic> _unitsExit;
  List<dynamic> get unitsExit => _unitsExit;
  List<dynamic> _unitsForceUnbattle;
  List<dynamic> get unitsForceUnbattle => _unitsForceUnbattle;
  Map _constantDictionary;
  Map get constantDictionary => _constantDictionary;
  Map _magicMusicDic;
  Map get magicMusicDic => _magicMusicDic;
  Map _unitSAnimDic;
  Map get unitSAnimDic => _unitSAnimDic;
  int currentSDrama;
  int currentRDrama;
  int nextSDrama;
  int nextRDrama;
  int chapterIndex;
  int maxBattlePlayerNum;
  String placeName;
  String eventName;
  String BGMName;
  static final DataCache _singleton= DataCache._internal();
  factory DataCache() {return _singleton;}
  DataCache._internal() {}
  static purgeSharedDataCache() {}
  addDatasWithFileName(String fileName ){}
  addNewGameDatas() {}
  saveAutoSaveDatasWith(Map dramaLayerDic,{ isRSave: bool } ){}
  saveBattleGameDatasWithFileName(String filename ){}
  saveCouncilGamDatasWith(Map dramaLayerDic,{ fileName: String } ){}
  Magic magicWithNum(int id ){}
  Equipment equipmentWithNum(int id ){}
  Equipment weaponWithNum(int id ){}
  Equipment armorWithNum(int id ){}
  Equipment assistWithNum(int id ){}
  Sundries sundryWithNum(int id ){}
  Hero heroWithNum(int id ){}
  Shop currentShop() {}
  Team teamWithNum(int id ){}
  InfoComponent unitInfoWithNum(int id ){}
  List<dynamic> allPlayerUnits() {}
  List<Magic> magicEnableWithTerrainNum(TileType id ){}
  bool isEnableMagic(MagicTypeCode magicType,{ terrainNum: TileType } ){}
  int moveConsumeWithTeam(TeamTypeCode teamNum,{ terrainNum: TileType } ){}
  int buffValueWithTeam(TeamTypeCode teamNum,{ terrainNum: TileType } ){}
  List<dynamic> numsOfAllSAnim() {}
  initLocalVariable() {}
  setVarWith(bool value,{ id: int } ){}
  bool varValueWith(int id ){}
  clearUnitInfoParent() {}
}
