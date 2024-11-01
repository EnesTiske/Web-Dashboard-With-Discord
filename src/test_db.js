import mysql from 'mysql2';

// MySQL bağlantısını oluştur
const connection = mysql.createConnection({
    host: 'localhost',  // Genellikle localhost
    user: 'lindatiske',       // MySQL kullanıcı adın (örneğin cPanel üzerinden oluşturduğun kullanıcı)
    password: 'amkTerosu31',  // MySQL şifren
    database: 'Main_1'  // cPanel üzerinden oluşturduğun veritabanı adı
});

// Bağlantıyı kontrol et
connection.connect((err) => {
    if (err) {
        console.error('Veritabanına bağlanırken hata oluştu:', err.stack);
        return;
    }
    console.log('Veritabanına başarıyla bağlandı!');
});



// Tüm boost değerlerini ve türlerini listeleme fonksiyonu
function listAllBoosts(callback) {
    connection.query('SELECT wonGiveawayNames FROM user_profiles', (err, results) => {
        if (err) {
            callback(err);
            return;
        }
        callback(null, results);
    });
}

// Fonksiyonu çağır ve boost değerlerini türleriyle yazdır
listAllBoosts((err, wonGiveawayNames) => {
    if (err) {
        console.error('Boost değerlerini alırken hata oluştu:', err);
    } else {
        console.log('Tüm Boost Değerleri ve Türleri:');
        wonGiveawayNames.forEach(row => {
            const boostValue = row.wonGiveawayNames;
            const type = typeof boostValue === 'number' ? 'int' : 'string';
            console.log(`Value: ${boostValue}, Type: ${type}`);
        });
    }
    
    // Bağlantıyı kapat
    connection.end((err) => {
        if (err) {
            console.error('Bağlantıyı kapatırken hata oluştu:', err);
        } else {
            console.log('Bağlantı kapatıldı.');
        }
    });
});







/*

// Kontrol etmek istediğiniz ID
const idToCheck = '781534515776454707';

// Kullanıcının tüm bilgilerini sorgulama
const query = 'SELECT * FROM user_profiles WHERE id = ?';

connection.query(query, [idToCheck], (err, results) => {
    if (err) {
        console.error('Veri sorgulanırken hata oluştu:', err.stack);
        return;
    }

    if (results.length > 0) {
        const user = results[0];
        console.log('Kullanıcı Bilgileri:', user);
    } else {
        console.log(`ID: ${idToCheck} bulunamadı.`);
    }

    // Bağlantıyı kapatın
    connection.end();
});

*/








/*

const createTableQuery = `
CREATE TABLE IF NOT EXISTS user_profiles (
  id VARCHAR(255) PRIMARY KEY,
  public BOOLEAN,
  level INT,
  requiredXp BIGINT,
  xp INT,
  totalXp INT,
  balance INT,
  subsMonth INT,
  totalSubsMonth INT,
  canEarnFromPhoto BOOLEAN,
  canEarnFromMessage BOOLEAN,
  canEarnFromAdReaction BOOLEAN,
  canEarnFromEvent BOOLEAN,
  wonGiveawayNames JSON,
  customEmotes JSON,
  totalCallMin INT,
  achievements JSON,
  publicAchievements BOOLEAN,
  boost INT,
  spentMoney INT,
  boostEndDate DATE,
  totalEventMin INT,
  giveawayEntry INT,
  totalGiveawayEntry INT,
  totalGiveawayAmount INT,
  totalWonGiveawayAmount INT,
  totalTextMessageAmount INT,
  totalImageMessageAmount INT,
  totalVideoMessageAmount INT,
  totalEmoteMessageAmount INT,
  totalAddReaction INT,
  totalEventAmount INT,
  activityStreak INT,
  quip VARCHAR(255),
  monthlyXp JSON,
  monthlyCallMin JSON,
  monthlyEventMin JSON,
  monthlyGiveawayAmount JSON,
  monthlyWonGiveawayAmount JSON,
  monthlyTextMessageAmount JSON,
  monthlyImageMessageAmount JSON,
  monthlyVideoMessageAmount JSON,
  monthlyEmoteMessageAmount JSON,
  monthlyAddReaction JSON,
  monthlyEventAmount JSON,
  backgroundColor VARCHAR(7),
  progressBarColor VARCHAR(7)
)`;

connection.query(createTableQuery, (err, results) => {
    if (err) {
        console.error('Tablo oluşturulurken hata oluştu:', err.stack);
        return;
    }
    console.log('Tablo başarıyla oluşturuldu:', results);
});


const newUser = {
    id: '111',
    public: true,
    level: 1,
    requiredXp: 100,
    xp: 0,
    totalXp: 0,
    balance: 0,
    subsMonth: 0,
    totalSubsMonth: 0,
    canEarnFromPhoto: true,
    canEarnFromMessage: true,
    canEarnFromAdReaction: true,
    canEarnFromEvent: true,
    totalCallMin: 0,
    publicAchievements: true,
    boost: 1,
    boostEndDate: null,
    totalEventMin: 0,
    totalGiveawayAmount: 0,
    totalWonGiveawayAmount: 0,
    totalTextMessageAmount: 0,
    totalImageMessageAmount: 0,
    totalVideoMessageAmount: 1,
    totalEmoteMessageAmount: 0,
    totalAddReaction: 0,
    totalEventAmount: 0,
    activityStreak: 0,
    quip: 'kim bu - 1',
    backgroundColor: '#000000',
    progressBarColor: '#bc2424',
    monthlyXp: JSON.stringify(Array(30).fill(0)),
    monthlyCallMin: JSON.stringify(Array(30).fill(0)),
    monthlyEventMin: JSON.stringify(Array(30).fill(0)),
    monthlyGiveawayAmount: JSON.stringify(Array(30).fill(0)),
    monthlyWonGiveawayAmount: JSON.stringify(Array(30).fill(0)),
    monthlyTextMessageAmount: JSON.stringify(Array(30).fill(0)),
    monthlyImageMessageAmount: JSON.stringify(Array(30).fill(0)),
    monthlyVideoMessageAmount: JSON.stringify(Array(30).fill(0)),
    monthlyEmoteMessageAmount: JSON.stringify(Array(30).fill(0)),
    monthlyAddReaction: JSON.stringify(Array(30).fill(0)),
    monthlyEventAmount: JSON.stringify(Array(30).fill(0))
  };
  
  const insertUserQuery = `
  INSERT INTO user_profiles SET ?`;
  
  connection.query(insertUserQuery, newUser, (err, results) => {
    if (err) {
      console.error('Kullanıcı eklenirken hata oluştu:', err.stack);
      return;
    }
    console.log('Yeni kullanıcı başarıyla eklendi:', results);
  });



*/






















/*




const query = 'SELECT * FROM user_profiles';

connection.query(query, (err, results) => {
    if (err) {
        console.error('Verileri alırken hata oluştu:', err.stack);
        return;
    }
    console.log('Veriler:', results);
});
*/






















// const idToCheck = '781534515776454707'; // Kontrol etmek istediğiniz ID

// const query2 = 'SELECT level, quip FROM user_profiles WHERE id = ?';

// connection.query(query2, [idToCheck], (err, results) => {
//     if (err) {
//         console.error('Veri sorgulanırken hata oluştu:', err.stack);
//         return;
//     }

//     if (results.length > 0) {
//         const user = results[0];
//         console.log(`ID: ${idToCheck} mevcut. Level: ${user.level}, Quip: ${user.quip}`);
//     } else {
//         console.log(`ID: ${idToCheck} bulunamadı.`);
//     }
// });

// // Bağlantıyı kapatın
// connection.end();




























// const query3 = 'SELECT id, level, quip FROM user_profiles';

// connection.query(query3, (err, results) => {
//     if (err) {
//         console.error('Veri sorgulanırken hata oluştu:', err.stack);
//         return;
//     }

//     // Verileri bir değişkene atayın
//     const usersData = results;

//     // Verileri konsola yazdırın
//     console.log('Kullanıcı Verileri:', usersData);
// });

// // Bağlantıyı kapatın
// connection.end();





