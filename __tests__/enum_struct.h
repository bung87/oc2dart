typedef enum
{
    ACAttack=0,
    ACDefend,
    ACWillpower,
    ACErupt,
    ACMorale,
    ACMove,
}AbilityCode;
typedef enum{
    kTestUnitIDTypeAny=513,
    kTestUnitIDTypeFriendSelf,
    kTestUnitIDTypeEnemy,
    kTestUnitIDTypeUnitATK,
    kTestUnitIDTypeNone,
} kTestUnitIDType;
typedef struct
{
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
    BOOL isWeak;
} CharState;