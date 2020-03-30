#import <Foundation/Foundation.h>
#import "constant.h"
#define VARARRAY_MAX 5000

@class Magic;
@class Sundries;
@class Equipment;
@class Shop;
@class Team;
@class AbilityMethods;
@class Hero;
@class Terrian;
@class InfoComponent;
@interface DataCache : NSObject
{
    NSMutableArray* magics;
    NSMutableArray* weapons;
    NSMutableArray* armors;
    NSMutableArray* assists;
    NSMutableArray* sundries;
    NSMutableArray* heros;
    NSMutableArray* shops;
    NSMutableArray* teams;
    NSMutableArray* unitInfos;
    BOOL* varArray;
    NSDictionary* terrainMagicsDic;
    NSDictionary* terrainBattleDic;
    NSDictionary* terrainMoveDic;
    NSDictionary* magicMusicDic;
    int currentSDrama;
    int currentRDrama;
    int nextSDrama;
    int nextRDrama;
    NSMutableArray* battlePlayerUnits;
    NSMutableArray* unitsForceUnbattle;
    NSMutableArray* unitsExit;
    int maxBattlePlayerNum;
    NSString* placeName;
    NSString* eventName;
    NSString* BGMName;
    int chapterIndex;
    NSDictionary* constantDictionary;
    NSDictionary* unitSAnimDic;
}

@property (nonatomic,readonly) NSMutableArray* magics;
@property (nonatomic,readonly) NSMutableArray* sundries;
@property (nonatomic,readonly) NSMutableArray* heros;
@property (nonatomic,readonly) NSMutableArray* weapons;
@property (nonatomic,readonly) NSMutableArray* armors;
@property (nonatomic,readonly) NSMutableArray* assists;
@property (nonatomic,readonly) NSMutableArray* shops;
@property (nonatomic,readonly) NSMutableArray* teams;
@property (nonatomic,readonly) NSMutableArray* unitInfos;
@property (nonatomic,readonly) NSMutableArray* battlePlayerUnits;
@property (nonatomic,readonly) NSMutableArray* unitsExit;
@property (nonatomic,readonly) NSMutableArray* unitsForceUnbattle;
@property (nonatomic,readonly) NSDictionary* constantDictionary;
@property (nonatomic,readonly) NSDictionary* magicMusicDic;
@property (nonatomic,readonly) NSDictionary* unitSAnimDic;
@property (nonatomic,readwrite) int currentSDrama;
@property (nonatomic,readwrite)int currentRDrama;
@property (nonatomic,readwrite)int nextSDrama;
@property (nonatomic,readwrite)int nextRDrama;
@property (nonatomic,readwrite)int chapterIndex;
@property (nonatomic,readwrite) int maxBattlePlayerNum;
@property (nonatomic,retain)     NSString* placeName;
@property (nonatomic,retain)     NSString* eventName;
@property (nonatomic,retain) NSString* BGMName;
+ (DataCache *)sharedDataCache;
+(void)purgeSharedDataCache;
-(void) addDatasWithFileName:(NSString*)fileName;
-(void)addNewGameDatas;
-(void)saveAutoSaveDatasWith:(NSDictionary*)dramaLayerDic saveType:(BOOL)isRSave;
-(void)saveBattleGameDatasWithFileName:(NSString*)filename;
-(void)saveCouncilGamDatasWith:(NSDictionary*)dramaLayerDic fileName:(NSString*)fileName;
-(Magic*) magicWithNum:(int)num;
-(Equipment*) equipmentWithNum:(int)num;
-(Equipment*) weaponWithNum:(int)num;
-(Equipment*) armorWithNum:(int)num;
-(Equipment*) assistWithNum:(int)num;
-(Sundries*) sundryWithNum:(int)num;
-(Hero*) heroWithNum:(int)num;
-(Shop*) currentShop;
-(Team*) teamWithNum:(int)num;
-(InfoComponent*)unitInfoWithNum:(int)num;
-(NSArray*)allPlayerUnits;
-(NSArray*)magicEnableWithTerrainNum:(TileType)num;
-(BOOL)isEnableMagic:(MagicTypeCode)magicType terrain:(TileType)terrainNum;
-(int)moveConsumeWithTeam:(TeamTypeCode)teamNum terrain:(TileType)terrainNum;
-(int)buffValueWithTeam:(TeamTypeCode)teamNum terrain:(TileType)terrainNum;
-(NSMutableArray*)numsOfAllSAnim;
-(void)initLocalVariable;
-(void)setVarWith:(BOOL)value num:(int)num;
-(BOOL)varValueWith:(int)num;
-(void)clearUnitInfoParent;
@end