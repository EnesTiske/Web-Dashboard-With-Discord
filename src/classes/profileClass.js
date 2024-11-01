import fs from 'fs';

const config = JSON.parse(fs.readFileSync('src/config/config.json', 'utf8'));

export class Profiles {
    constructor(user) {
        this.id = user.id
        this.public = true
        this.level = 1
        this.requiredXp = config.levelUpXp
        this.xp = 0
        this.totalXp = 0
        this.balance = 0
        this.subsMonth = 0
        this.totalSubsMonth = 0
        this.canEarnFromPhoto = true
        this.canEarnFromMessage = true
        this.canEarnFromAdReaction = true
        this.canEarnFromEvent = true
        this.wonGiveawayNames = []
        this.customEmotes = []
        this.totalCallMin = 0
        this.achievements = []
        this.publicAchievements = true
        this.boost = 1
        this.boostEndDate = null
        this.totalEventMin = 0
        this.totalGiveawayAmount = 0
        this.totalWonGiveawayAmount = 0
        this.totalTextMessageAmount = 0
        this.totalImageMessageAmount = 0
        this.totalVideoMessageAmount = 0
        this.totalEmoteMessageAmount = 0
        this.totalAddReaction = 0
        this.totalEventAmount = 0
        this.activityStreak = 0
        this.subsMonth =0
        this.quip = "Please fill here with /quip command"
        // Leaderboard
        this.monthlyXp = new Array(30).fill(0)
        this.monthlyCallMin = new Array(30).fill(0)
        this.monthlyEventMin = new Array(30).fill(0)
        this.monthlyGiveawayAmount = new Array(30).fill(0)
        this.monthlyWonGiveawayAmount = new Array(30).fill(0)
        this.monthlyTextMessageAmount = new Array(30).fill(0)
        this.monthlyImageMessageAmount = new Array(30).fill(0)
        this.monthlyVideoMessageAmount = new Array(30).fill(0)
        this.monthlyEmoteMessageAmount = new Array(30).fill(0)
        this.monthlyAddReaction = new Array(30).fill(0)
        this.monthlyEventAmount = new Array(30).fill(0)
        this.backgroundColor = "#000000";
        this.progressBarColor = "#7289da";
    }
}
export default Profiles