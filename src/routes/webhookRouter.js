import express from 'express';
import Stripe from 'stripe';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import client from '../botSetup.js';
import { EmbedBuilder } from 'discord.js';
import mysql from 'mysql2/promise';

const MySQLUser = 'lindatiske2';
const MySQLPassword = 'amkTerosu32';
const MySQLDatabase = 'Main_1';

const pool = mysql.createPool({
  host: 'localhost',
  user: MySQLUser,
  password: MySQLPassword,
  database: MySQLDatabase,
  waitForConnections: true,
  connectionLimit: 10, // Havuzdaki maksimum bağlantı sayısı
  queueLimit: 0 // Bekleme kuyruğundaki maksimum talep sayısı (0 = sınırsız)
});


dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const usersFilePath = path.join('src/data/users.json');
const subsPath = path.join('src/data/subs.json');
const level_rolesPath = path.join("src/data/level_role.json")
const config = JSON.parse(fs.readFileSync(path.join('src/config/config.json'), 'utf-8'));

async function reloadProfilesOnServer() {
  try {
    const response = await fetch('https://nexusVault.net/reload-profiles', {
      method: 'POST',
      headers: {
        'API-Key': process.env.API_KEY
      }
    });
    const data = await response.text();
    console.log(data);
  } catch (error) {
    console.error('Error reloading profiles on server:', error);
  }
}

// Use bodyParser to parse the incoming webhook payload
router.post('/', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  let users;
  try {
    users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
  } catch (readError) {
    console.error('Error reading users file:', readError);
    users = [];
  }
  // Handle the event
  switch (event.type) {

    case "customer.subscription.created":
      try {
        const subInvoice = event.data.object;
        let subCustomer = subInvoice.customer;
        var user = users.find(u => u.stripeCustomerId === subCustomer);

        //if user have subscription cancel it
        try {
          if (user.subscriptionId !== "") {
            const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
            if (subscription) {

              const subscriptionToDel = await stripe.subscriptions.update(user.subscriptionId, { cancel_at_period_end: true });
            }
          }
        } catch (error) {
          console.error(error)
        }

        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

      } catch (error) {
        console.error('Error in customer.subscription.created :', error);
      }
      break;

    case 'invoice.payment_succeeded':
      try {
        var subs = JSON.parse(fs.readFileSync(subsPath, 'utf-8'));
        const invoice = event.data.object;
        let customer = invoice.customer;
        var user = users.find(u => u.stripeCustomerId === customer);
        let profile = await findSQL(user.discordId);

        //boost the user
        if (user.subscriptionId !== invoice.subscription) {
          var boostAmount = parseInt((invoice.lines.data[0].amount / 1000) * 2);
          if (boostAmount > 11) {
            boostAmount = 11;
          }
          profile.boost += boostAmount;
        }


        //add the user to the subs.json
        const sub = subs.find(sub => sub.id === invoice.lines.data[0].plan.id);

        if (sub && !sub.users.includes(user.discordId)) {
          const guild = await client.guilds.fetch(process.env.GUILD_ID)
          const member = await guild.members.fetch(profile.id)
          try {
            const role = await guild.roles.fetch(sub.role)
            await member.roles.add(role)
          } catch (error) {
            console.log("Error when adding users in webhook " + error)
          }
          sub.users.push(user.discordId);
          fs.writeFileSync(subsPath, JSON.stringify(subs, null, 2));
        }
        if (user.subscriptionStatus === "active") {
          var inSubs = []
          for (const currentSub of subs) {
            if (currentSub.users.includes(user.discordId)) {
              inSubs.push(currentSub)
            }
          }
          if (inSubs.length > 0) {
            const sortedSubs = inSubs.sort((a, b) => b.giveawayEntry - a.giveawayEntry)
            profile.totalGiveawayEntry = sortedSubs[0].giveawayEntry
            if (profile.giveawayEntry > profile.totalGiveawayEntry) {
              profile.giveawayEntry = profile.totalGiveawayEntry
            }
          }
        } else {
          profile.totalGiveawayEntry = sub.giveawayEntry
        }
        user.subscriptionStatus = 'active';


        //add users xp
        addTodayXp(profile, 100);
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        user.subscriptionId = subscription.id;
        user.subscriptionStatus = 'active';
        profile.maxCustomEmotes = 5;
        profile.spentMoney += invoice.lines.data[0].amount / 100;

        //send dm to the user 
        const dcUser = await client.users.fetch(user.discordId);
        const embed = new EmbedBuilder()
          .setTitle('Subscription Payment')
          .setDescription(`Your subscription payment is succeded!\n**Name:**${invoice.customer_name}\n**Email:**${invoice.customer_email}\n**Price:**${invoice.subtotal / 100}\$`)
          .setColor('#00FF00')
          .setTimestamp()
          .setFooter({ text: 'If there is any wrong information please write an admin' });

        dcUser.send({ embeds: [embed] });
        profile.balance += invoice.amount_paid / 100;

        await updateProfile(profile);

        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
        console.log(`Payment succeeded for invoice ${invoice.id}`);

      } catch (error) {
        console.error('Error in invoice.payment_succeeded:', error);
      }

      break;

    case "payment_intent.succeeded":
      try {
        const paymentInvoice = event.data.object;
        //only go inside if its one time payment
        if (!paymentInvoice.invoice) {

          let paymentCustomer = paymentInvoice.customer;
          var user = users.find(u => u.stripeCustomerId === paymentCustomer);
          let paymentProfile = await findSQL(user.discordId);
          //add xp
          addTodayXp(paymentProfile, 100);
          const productType = paymentInvoice.metadata.product_type;
          const amount = parseInt(paymentInvoice.metadata.amount);

          //add balance or boost according to what user buy
          if (productType === 'balance') {
            paymentProfile.balance += amount;
          } else if (productType === 'boost') {
            paymentProfile.boost += amount;
            setTimeout(() => {
              paymentProfile.boost -= amount;
              updateProfile(paymentProfile);
            }, 2 * 24 * 60 * 60 * 1000);
          }
          paymentProfile.subMonth++;
          paymentProfile.spentMoney += paymentInvoice.amount / 100;

          // send dm to the user
          const embed = new EmbedBuilder()
            .setTitle('Payment')
            .setDescription(`Your payment is succeded!`)
            .setColor('#00FF00');
          const dcUser = await client.users.fetch(user.discordId);
          dcUser.send({ embeds: [embed] });
          await updateProfile(paymentProfile);
          fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
          console.log(`Payment succeeded for invoice ${paymentProfile.id}`);
        }
      } catch (error) {
        console.error('Error in payment_intent.succeeded:', error);
      }
      break;


    case 'invoice.payment_failed':
      try {

        const subs = JSON.parse(fs.readFileSync(subsPath, 'utf-8'));
        const failedInvoice = event.data.object;
        const failedSubscription = await stripe.subscriptions.retrieve(failedInvoice.subscription);
        const failedCustomer = failedSubscription.customer;
        const user = users.find(u => u.stripeCustomerId === failedCustomer);

        //remove the user from subs.json
        const sub = subs.find(sub => sub.id === failedInvoice.lines.data[0].plan.id);
        const profile = await findSQL(user.discordId);
        const isInSub = sub.users.includes(user.discordId)
        if (sub && isInSub) {
          const guild = await client.guilds.fetch(process.env.GUILD_ID)
          const member = await guild.members.fetch(profile.id)
          // decrease the users boost
          let boostAmount = parseInt((failedInvoice.total / 1000) * 2);
          if (boostAmount > 11) {
            boostAmount = 11;
          }
          //reset the sub streak

          profile.boost -= boostAmount;

          profile.customEmotes = []
          var inSubs = []
          for (const currentSub of subs) {
            if (currentSub.users.includes(user.discordId)) {
              inSubs.push(currentSub)
            }
          }

          if (inSubs.length > 0) {
            const sortedSubs = inSubs.sort((a, b) => b.giveawayEntry - a.giveawayEntry)
            profile.totalGiveawayEntry = sortedSubs[0].giveawayEntry
            if (profile.giveawayEntry > profile.totalGiveawayEntry) {
              profile.giveawayEntry = profile.totalGiveawayEntry
            }
          } else {
            profile.totalGiveawayEntry = 0
          }

          if (inSubs.length === 0) {
            user.subscriptionId = "";
            user.subscriptionStatus = 'inactive';

            profile.subMonth = 0;
            profile.maxCustomEmotes = 0;

            //delete the users emote
            for (const emote of profile.customEmotes) {
              try {
                const guild = await client.guilds.fetch(process.env.GUILD_ID)
                const dcEmoji = await guild.emojis.fetch(emote.id)
                await dcEmoji.delete();
              } catch (error) {
                console.error(error)
              }
            }
          }
          try {
            const role = await guild.roles.fetch(sub.role)
            await member.roles.remove(role)
          } catch (error) {
            console.log("Error when adding users in webhook " + error)
          }
          try {
            const dcUser = await client.users.fetch(user.discordId);
            const embed = new EmbedBuilder()
              .setTitle('Subscription Payment')
              .setDescription(`Your subscription payment has failed!\n**Name:**${failedInvoice.customer_name}\n**Email:**${failedInvoice.customer_email}\n**Price:**${failedInvoice.subtotal / 100}\$`)
              .setColor('#FF0000')
              .setTimestamp()
              .setFooter({ text: 'If there is any wrong information please write an admin' });

            dcUser.send({ embeds: [embed] });
          } catch (fetchError) {
            console.error('Error fetching Discord user:', fetchError);
          }
          sub.users = sub.users.filter(u => u !== user.discordId);
          fs.writeFileSync(subsPath, JSON.stringify(subs, null, 2));
        }

        await updateProfile(profile);
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
        console.log(`Payment failed for invoice ${failedInvoice.id}`);
      } catch (error) {
        console.error('Error in invoice.payment_failed:', error);
      }

      break;

    case 'customer.subscription.deleted':
      try {
        const subs = JSON.parse(fs.readFileSync(subsPath, 'utf-8'));
        const subscriptionDeleted = event.data.object;
        const deletedCustomer = subscriptionDeleted.customer;
        const deletedUser = users.find(u => u.stripeCustomerId === deletedCustomer);

        //go inside if user exists
        if (deletedUser) {
          var boostAmount = (subscriptionDeleted.plan.amount / 10) * 2;
          if (boostAmount > 11) {
            boostAmount = 11;
          }
          const sub = subs.find(sub => sub.id === subscriptionDeleted.plan.id);
          let profile = await findSQL(deletedUser.discordId);
          if (sub) {
            const guild = await client.guilds.fetch(process.env.GUILD_ID)
            const member = await guild.members.fetch(profile.id)
            try {
              const role = await guild.roles.fetch(sub.role)
              await member.roles.remove(role)
            } catch (error) {
              console.log("Error when removing role webhook " + error)
            }

            sub.users = sub.users.filter(u => u !== deletedUser.discordId);
            fs.writeFileSync(subsPath, JSON.stringify(subs, null, 2));
          }
          profile.boost -= boostAmount;
          if (profile.boost === undefined || profile.boost < 1 || profile.boost === null) {
            profile.boost = 1;
          }

          var inSubs = []
          for (const currentSub of subs) {
            if (currentSub.users.includes(deletedUser.discordId)) {
              inSubs.push(currentSub)
            }
          }

          if (inSubs.length > 0) {
            const sortedSubs = inSubs.sort((a, b) => b.giveawayEntry - a.giveawayEntry)
            profile.totalGiveawayEntry = sortedSubs[0].giveawayEntry
            if (profile.giveawayEntry > profile.totalGiveawayEntry) {
              profile.giveawayEntry = profile.totalGiveawayEntry
            }
            deletedUser.subscriptionId = sortedSubs[0].id
          } else {
            profile.totalGiveawayEntry = 0
          }

          if (inSubs.length === 0) {
            deletedUser.subscriptionId = "";
            deletedUser.subscriptionStatus = 'inactive';

            profile.subMonth = 0;
            profile.maxCustomEmotes = 0;

            //delete the users emote
            for (const emote of profile.customEmotes) {
              try {
                const guild = await client.guilds.fetch(process.env.GUILD_ID)
                const dcEmoji = await guild.emojis.fetch(emote.id)
                await dcEmoji.delete();
              } catch (error) {
                console.error(error)
              }
            }
            profile.customEmotes = []
          }

          const dcUser = await client.users.fetch(deletedUser.discordId);
          const embed = new EmbedBuilder()
            .setTitle('Subscription deleted')
            .setDescription(`Your subscription is deleted!`)
            .setColor('#FF0000');

          dcUser.send({ embeds: [embed] });
          for (const emote of profile.customEmotes) {
            try {
              const guild = await client.guilds.fetch(process.env.GUILD_ID)
              const dcEmoji = await guild.emojis.fetch(emote.id)
              await dcEmoji.delete();
            } catch (error) {
              console.error(error)
            }

          }
          await updateProfile(profile);
          fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
        }
        console.log(`Subscription ${subscriptionDeleted.id} deleted`);
      } catch (error) {
        console.error('Error in customer.subscription.deleted:', error);
      }

      break;

    case "customer.deleted":
      try {
        const customerDeleted = event.data.object;
        const deletedCustomerId = users.find(u => u.stripeCustomerId === customerDeleted.id);
        if (deletedCustomerId) {
          let profile = await findSQL(deletedCustomerId.discordId);
          users = users.filter(u => u.stripeCustomerId !== customerDeleted.id);
          profile.boost = 1;

          profile.maxCustomEmotes = 0;
          profile.subMonth = 0;
          for (const emote of profile.customEmotes) {
            try {
              const guild = await client.guilds.fetch(process.env.GUILD_ID)
              const dcEmoji = await guild.emojis.fetch(emote.id)
              await dcEmoji.delete();
            } catch (error) {
              console.error(error)
            }
          }

          await updateProfile(profile);
          fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
        }
        console.log(`Customer ${customerDeleted.id} deleted`);

      } catch (error) {
        console.error('Error in customer.deleted:', error);
      }

      break;
    case 'checkout.session.expired':
      const expiredSession = event.data.object;
      console.log('Checkout session expired:', expiredSession);
      break;

    case "price.created":
      try {
        const price = event.data.object;
        if (price.type === "recurring") {
          const product = await stripe.products.retrieve(price.product);
          var subs = JSON.parse(fs.readFileSync(subsPath, 'utf-8'));
          if (subs.find(sub => sub.id === price.id)) {
            return;
          }
          subs.push(
            {
              id: price.id,
              name: product.name,
              roleId: "",
              giveawayEntry: 0,
              users: []
            }
          );
          fs.writeFileSync(subsPath, JSON.stringify(subs, null, 2));
          console.log(`Product ${price.id} created`);
        }

      } catch (error) {
        console.error('Error in product.created:', error);
      }
      break;

    // Add more cases to handle other events
    default:
    //console.log(`Unhandled event type ${event.type}`);
  }

  await reloadProfilesOnServer()

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).end();
});
async function addTodayXp(profile, xp) {
  let connection;
  try {
    connection = await pool.getConnection();

    if (!profile) {
      throw new Error('Profile not found');
    }

    if (profile.level === 50) {
      profile.xp = profile.requiredXp;
      return;
    }

    profile.totalXp += xp;
    profile.xp += xp;
    profile.monthlyXp[0] += xp;

    let controlLevelUp = true;
    while (controlLevelUp) {
      controlLevelUp = false;
      if (profile.xp >= profile.requiredXp) {
        await LevelUp(profile); // Implement LevelUp function
        if (profile.level !== 50) {
          controlLevelUp = true;
        }
      }
    }

    await updateProfile(profile); // Kullanıcı profilini güncelle

  } catch (error) {
    console.error('Error in addTodayXp:', error);
  } finally {
    if (connection) connection.release(); // Release connection back to the pool
  }
}
async function LevelUp(profile) {
  if (profile.level === 50) {
    profile.xp = profile.requiredXp
    return
  }
  profile.xp -= profile.requiredXp
  profile.level += 1
  profile.requiredXp = config.levelUpXp * profile.level
  profile.balance += profile.level * 10
  profile.balance += profile.level * 10
  const level_roles = await readFileFunc(level_rolesPath)
  for (const level_role of level_roles) {
    if (profile.level === level_role.level) {
      const guild = await client.guilds.fetch(process.env.GUILD_ID)
      const role = await guild.roles.fetch(level_role.role)
      const member = await guild.members.fetch(profile.id);
      await member.roles.add(role)

    }
  }
}
async function readFileFunc(path) {
  try {
    var data = fs.readFileSync(path, "utf8")
    return JSON.parse(data)
  } catch (err) {
    console.error(err)
  }
}
async function updateProfile(profile) {
  const connection = await pool.getConnection();

  try {
    // Güncellenmiş verileri SQL sorgusuna uygun formata dönüştür
    const fields = [
      'public',
      'level',
      'requiredXp',
      'xp',
      'totalXp',
      'balance',
      'subsMonth',
      'totalSubsMonth',
      'canEarnFromPhoto',
      'canEarnFromMessage',
      'canEarnFromAdReaction',
      'canEarnFromEvent',
      'wonGiveawayNames',
      'customEmotes',
      'totalCallMin',
      'achievements',
      'publicAchievements',
      'boost',
      'spentMoney',
      'boostEndDate',
      'totalEventMin',
      'giveawayEntry',
      'totalGiveawayEntry',
      'totalGiveawayAmount',
      'totalWonGiveawayAmount',
      'totalTextMessageAmount',
      'totalImageMessageAmount',
      'totalVideoMessageAmount',
      'totalEmoteMessageAmount',
      'totalAddReaction',
      'totalEventAmount',
      'activityStreak',
      'quip',
      'monthlyXp',
      'monthlyCallMin',
      'monthlyEventMin',
      'monthlyGiveawayAmount',
      'monthlyWonGiveawayAmount',
      'monthlyTextMessageAmount',
      'monthlyImageMessageAmount',
      'monthlyVideoMessageAmount',
      'monthlyEmoteMessageAmount',
      'monthlyAddReaction',
      'monthlyEventAmount',
      'backgroundColor',
      'progressBarColor'
    ];

    // Güncellenmiş verileri bir diziye dönüştür
    const values = fields.map(field => {
      if (Array.isArray(profile[field]) || typeof profile[field] === 'object' && profile[field] !== null) {
        return JSON.stringify(profile[field]);
      }
      return profile[field];
    });

    // SQL sorgusu
    const sql = `UPDATE user_profiles SET ${fields.map(field => `${field} = ?`).join(', ')} WHERE id = ?`;

    // ID'yi sorguya ekle
    values.push(profile.id);

    // SQL sorgusunu çalıştır
    await connection.query(sql, values);

  } catch (error) {
    console.error('Error updating profile:', error);
  } finally {
    // Bağlantıyı serbest bırak
    connection.release();
  }
}
async function findSQL(userId) {
  let connection = null;
  try {
    connection = await pool.getConnection();

    const [rows] = await connection.query(`
          SELECT * FROM user_profiles
          WHERE id = ?`, [userId]
    );

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error finding profile:', error);
    throw new Error('Error finding profile');
  } finally {
    if (connection) {
      // Bağlantıyı havuza geri bırak
      connection.release();
    }
  }
}
export default router;