#import <Foundation/Foundation.h>
#import "cocos2d.h"
#import "Unit.h"
@class Hero;
@class Magic;
@interface SkillComponet : CCNode {
    NSMutableArray* magicList;
    Hero* hero_;
}
@property (nonatomic,retain) NSMutableArray* magicList;

+(id) skillsWithHero:(Hero*)hero level:(int)lv;
+(float) magicHitPercentWithMagic:(Magic*)magic fromUnit:(Unit*)unitATK to:(Unit*)unitDEF;
-(NSArray*)learnNewMagicWithLv:(int)lv;
-(NSArray*) effectFromUnit:(Unit*)unit byMagic:(Magic*)magic;
-(void) effectNoObjectByMagic:(Magic*)magic;
-(NSArray*)magicsEnableByAI;

@end
