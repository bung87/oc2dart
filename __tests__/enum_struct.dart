enum AbilityCode {
  ACAttack,
  ACDefend,
  ACWillpower,
  ACErupt,
  ACMorale,
  ACMove,
}
class kTestUnitIDType {
  static const kTestUnitIDTypeAny = 513;
  static const kTestUnitIDTypeFriendSelf = 514;
  static const kTestUnitIDTypeEnemy = 515;
  static const kTestUnitIDTypeUnitATK = 516;
  static const kTestUnitIDTypeNone = 517;
}
class CharState {
  int stop;
  int chaos;
  int poison;
  int silent;
  int buffAttack;
  int buffDefend;
  int buffWillpower;
  int buffErupt;
  int buffMorale;
  int buffMove;
  int buffAll;
  bool isWeak;
}
