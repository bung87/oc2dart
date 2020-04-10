class SkillComponet{
  List<Magic> magicList;
  Hero _hero;
  static dynamic skillsWithHero(Hero hero,{ lv: int } ){}
  static double magicHitPercentWithMagic(Magic magic,{ unitATK: Unit ,unitDEF: Unit } ){}
  List<Hero> learnNewMagicWithLv(int lv ){}
  List<Hero> effectFromUnit(Unit unit,{ magic: Magic } ){}
  effectNoObjectByMagic(Magic magic ){}
  List<Magic> magicsEnableByAI() {}
}
