
//#region ---------|           -         |---------

//#region ---------| Import and Commands |---------

//#region -- Import --
import puppeteer from 'puppeteer';
import https from 'https';
import {
    REST,
    Routes,
    SlashCommandBuilder,
    EmbedBuilder,
    userMention,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ChannelType,
    StringSelectMenuOptionBuilder,
    StringSelectMenuBuilder,
    AttachmentBuilder,
    PermissionFlagsBits,
    Attachment,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Guild,
    GuildChannel,
    embedLength,
    PermissionsBitField,
} from 'discord.js';
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.js';
import client from './botSetup.js';
import stripeRouter from './routes/stripeRouter.js';
import fs, { copyFileSync, read, write } from 'fs';
import { promises as fsPromises } from "fs"
import session from 'express-session';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { Chart, LinearScale, LogarithmicScale, BarController, BarElement, CategoryScale, registerables, elements } from 'chart.js';
import Stripe from 'stripe';
import { Profiles } from './classes/profileClass.js';
import colorName from "color-name"
import webhookRouter from './routes/webhookRouter.js';
import fetch from 'node-fetch';
//  import { createCanvas } from 'canvas';

import mysql from 'mysql2/promise';



const MySQLUser = 'lindatiske';
const MySQLPassword = 'amkTerosu31';
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

// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: MySQLUser,
//     password: MySQLPassword,
//     database: MySQLDatabase,
//     waitForConnections: true
// });

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

const repeatingMessagesPath = path.join('src/data/repeatingMessages.json');
const subsPath = path.join('src/data/subs.json');
const configPath = "src/config/config.json"
const giveawayPath = path.join('src/data/giveaway.json');
const shopPath = path.join('src/data/shop.json');
const blacklistPath = path.join('src/data/blacklist.json');
const achievementPath = path.join('src/data/achievements.json');
const usersPath = path.join('src/data/users.json');
const currencyHistoryPath = path.join('src/data/currencyHistory.json');
const channelIdPath = path.join('src/data/channelId.json');
const level_rolesPath = path.join("src/data/level_role.json")
const coinUrl = 'https://i.gifer.com/Fw3P.gif';

import { Achievement } from './classes/achievementsClass.js';

const achievements = await readFileFunc(achievementPath);

var jsonData = await GetValues();
var config = SetValues(jsonData)
dotenv.config();

const TOKEN = process.env.TOKEN;
const ClientID = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
let stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

//#endregion

//#region -- Commands --

const commands = [

    //#region -- REPEATING MESSAGES --

    new SlashCommandBuilder()
        .setName('create-repeating-message')
        .setDescription('Create a new repeating message')
        .setDefaultMemberPermissions(0)
        .addChannelOption(option =>
            option.setName('channel')
                .addChannelTypes(ChannelType.GuildText)
                .setDescription('The channel you want the message to be sent to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message you want to repeat')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('day')
                .setDescription('The interval in days')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('hour')
                .setDescription('The hour of the day')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('minute')
                .setDescription('The minute of the hour')
                .setRequired(true))
    ,
    new SlashCommandBuilder()
        .setName('delete-repeating-message')
        .setDescription('Delete a repeating message')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Select a repeating message')
                .setRequired(true)
                .setAutocomplete(true))
    ,
    new SlashCommandBuilder()
        .setName('repeating-messages-list')
        .setDescription('Lists all repeating messages')
        .setDefaultMemberPermissions(0)
    ,
    new SlashCommandBuilder()
        .setName('repeating-message-info')
        .setDescription('Provides detailed information about a specific repeating message')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Select a repeating message')
                .setRequired(true)
                .setAutocomplete(true))
    ,
    new SlashCommandBuilder()
        .setName('change-repeating-message')
        .setDescription('Change the message of a specific repeating message')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('old-message')
                .setDescription('Select a repeating message')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName('new-message')
                .setDescription('The new message for the repeating message.')
                .setRequired(true))
    ,
    new SlashCommandBuilder()
        .setName('change-repeating-message-time')
        .setDescription('Change the time of a specific repeating message')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Select a repeating message')
                .setRequired(true)
                .setAutocomplete(true))
        .addIntegerOption(option =>
            option.setName('day')
                .setDescription('The interval in days')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('hour')
                .setDescription('The hour of the day')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('minute')
                .setDescription('The minute of the hour')
                .setRequired(true))
    ,
    new SlashCommandBuilder()
        .setName('change-repeating-message-channel')
        .setDescription('Change the channel of a specific repeating message')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Select a repeating message')
                .setRequired(true)
                .setAutocomplete(true))
        .addChannelOption(option =>
            option.setName('channel')
                .addChannelTypes(ChannelType.GuildText)
                .setDescription('The Discord channel where the message will be sent.')
                .setRequired(true))
    ,
    //#endregion

    //#region -- SUBS --

    new SlashCommandBuilder()
        .setName('create-subs')
        .setDescription('Create a new subscription')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the subscription')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('The id of the subscription (stripe id of the product exm: price_1J4J4dLZ6Zc3)')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role of the subscription')
                .setRequired(true))
    ,
    new SlashCommandBuilder()
        .setName('delete-subs')
        .setDescription('Delete a subscription')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('subs')
                .setDescription('Select a subscription')
                .setRequired(true)
                .setAutocomplete(true))
    ,
    new SlashCommandBuilder()
        .setName('subs-list')
        .setDescription('Lists all subscriptions')
        .setDefaultMemberPermissions(0)
    ,
    new SlashCommandBuilder()
        .setName('subs-info')
        .setDescription('Provides detailed information about a specific subscription')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('subs')
                .setDescription('Select a subscription')
                .setRequired(true)
                .setAutocomplete(true))
    ,
    new SlashCommandBuilder()
        .setName('change-subs-name')
        .setDescription('Change the name of a specific subscription')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('subs')
                .setDescription('Select a subscription')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The new name for the subscription.')
                .setRequired(true))
    ,
    new SlashCommandBuilder()
        .setName('change-subs-id')
        .setDescription('Change the id of a specific subscription')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('subs')
                .setDescription('Select a subscription')
                .setRequired(true)
                .setAutocomplete(true))
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('The new id for the subscription. (stripe id of the product exm: price_1J4J4dLZ6Zc3)')
                .setRequired(true))
    ,
    new SlashCommandBuilder()
        .setName('change-subs-role')
        .setDescription('Change the role of a specific subscription')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('subs')
                .setDescription('Select a subscription')
                .setRequired(true)
                .setAutocomplete(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The new role for the subscription.')
                .setRequired(true))
    ,
    new SlashCommandBuilder()
        .setName('add-subs-user')
        .setDescription('Add a user to a specific subscription')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('subs')
                .setDescription('Select a subscription')
                .setRequired(true)
                .setAutocomplete(true))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Select a user')
                .setRequired(true))
    ,
    new SlashCommandBuilder()
        .setName('remove-subs-user')
        .setDescription('Remove a user from a specific subscription')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('subs')
                .setDescription('Select a subscription to remove a user from')
                .setRequired(true)
                .setAutocomplete(true))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Select a user')
                .setRequired(true))
    ,
    new SlashCommandBuilder()
        .setName("change-sub-entry")
        .setDescription("Change a subs giveaway entry amount")
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName("sub")
                .setDescription("Choose the sub")
                .setAutocomplete(true)
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("entry")
                .setDescription("Entry amount")
                .setRequired(true)
        )
    ,

    //#endregion

    //#region -- PROFILE --

    new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Shows the profile of a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to see the profile of')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('my-profile')
        .setDescription('Shows your profile'),

    new SlashCommandBuilder()
        .setName("set-progress-bar-color")
        .setDescription("Set your progress bar color")
        .addStringOption(option =>
            option.setName('color')
                .setDescription('The color you want to set to progress bar')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('set-profile-background')
        .setDescription('Set your profile background')
        .addStringOption(option =>
            option.setName('color')
                .setDescription('The color you want to set to background')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('quip')
        .setDescription('Set your profile quip')
        .addStringOption(option =>
            option.setName('quip')
                .setDescription('The quip you want to set')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName("private-profile")
        .setDescription("Set your profile to  private"),

    new SlashCommandBuilder()
        .setName("unprivate-profile")
        .setDescription("Set your profile to public"),


    //#endregion

    //#region -- SET CONFIG --

    new SlashCommandBuilder()
        .setName('set-config')
        .setDescription('Set the configuration for the bot')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('variable-name')
                .setDescription('The name of the variable you want to change')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName('variable-value')
                .setDescription('The value you want to set the variable to')
                .setRequired(true))
    ,
    new SlashCommandBuilder()
        .setName('set-stripe')
        .setDescription('Set the Stripe value for the bot')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('variable-name')
                .setDescription('The Stripe variable you want to set')
                .setRequired(true)
                .addChoices(
                    { name: 'STRIPE_PUBLISHABLE_KEY', value: 'STRIPE_PUBLISHABLE_KEY' },
                    { name: 'STRIPE_SECRET_KEY', value: 'STRIPE_SECRET_KEY' },
                    { name: 'STRIPE_WEBHOOK_SECRET', value: 'STRIPE_WEBHOOK_SECRET' }
                ))
        .addStringOption(option =>
            option.setName('variable-value')
                .setDescription('The value you want to set the variable to')
                .setRequired(true))
    ,

    //#endregion

    //#region -- LEVEL XP --
    new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Shows leaderboard")
        .addStringOption(option =>
            option.setName("day")
                .setDescription("Choose your day scope for listing")
                .setRequired(true)
                .addChoices(
                    { name: "All time", value: "All" },
                    { name: "7", value: "7" },
                    { name: "14", value: "14" },
                    { name: "30", value: "30" }
                ))
        .addStringOption(option =>
            option.setName("type")
                .setDescription("Choose your type for listing")
                .setRequired(true)
                .addChoices(
                    { name: "XP", value: "Xp" },
                    { name: "Event", value: "EventMin" },
                    { name: "Call", value: "CallMin" },
                    { name: "Giveaway", value: "GiveawayAmount" },
                    { name: "Won Giveaway", value: "WonGiveawayAmount" },
                    { name: "Text Message", value: "TextMessageAmount" },
                    { name: "Image Message", value: "ImageMessageAmount" },
                    { name: "Video Message", value: "VideoMessageAmount" },
                    { name: "Emote Message", value: "EmoteMessageAmount" },
                    { name: "Level", value: "level" },
                    { name: "Boosters", value: "booster" },
                    { name: "Sub", value: "longestSub" }

                )),


    new SlashCommandBuilder()
        .setName("add-xp")
        .setDescription("Add xp to an user")
        .setDefaultMemberPermissions(0)
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user you want to add xp")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("xp-amount")
                .setDescription("Xp you want to add")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("add-level-role")
        .setDescription("Set a role for a level")
        .setDefaultMemberPermissions(0)
        .addRoleOption(option =>
            option.setName("role")
                .setDescription("Role you want to set")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("level")
                .setDescription("Level of the role you want")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("remove-level-role")
        .setDescription("Remove a level-role")
        .setDefaultMemberPermissions(0)
        .addIntegerOption(option =>
            option.setName("level")
                .setDescription("Level of the role you want remove")
                .setRequired(true)
                .setAutocomplete(true)
        ),
    //#endregion

    //#region -- GIVEAWAYS --
    new SlashCommandBuilder()
        .setName('giveaways-info')
        .setDescription('Provides detailed information about a specific giveaway')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('giveaways')
                .setDescription('Select a giveaway')
                .setRequired(true)
                .setAutocomplete(true)),
    new SlashCommandBuilder()
        .setName('giveaways-delete')
        .setDescription('Deletes a specific giveaway')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('giveaways')
                .setDescription('Select a giveaway')
                .setRequired(true)
                .setAutocomplete(true))
    ,
    new SlashCommandBuilder()
        .setName('giveaways-list')
        .setDescription('Lists all active giveaways')
        .setDefaultMemberPermissions(0)
    ,
    new SlashCommandBuilder()
        .setName('change-giveaways-name')
        .setDescription('Change the name of a specific giveaway')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('giveaways')
                .setDescription('Select a giveaway')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The new name for the giveaway.')
                .setRequired(true))
    ,
    new SlashCommandBuilder()
        .setName('change-giveaways-description')
        .setDescription('Change the description of a specific giveaway')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('giveaways')
                .setDescription('Select a giveaway')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('The new description for the giveaway.')
                .setRequired(true))
    ,
    new SlashCommandBuilder()
        .setName('change-giveaways-date')
        .setDescription('Change the date of a specific giveaway')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('giveaways')
                .setDescription('Select a giveaway')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName('date')
                .setDescription('The closing date for the giveaway entries in YYYY-MM-DD format.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('time')
                .setDescription('The closing time for the giveaway entries in HH:MM format (24-hour clock).')
                .setRequired(true))
    ,
    new SlashCommandBuilder()
        .setName('change-giveaways-winneramount')
        .setDescription('Change the number of winners for a specific giveaway')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('giveaways')
                .setDescription('Select a giveaway')
                .setRequired(true)
                .setAutocomplete(true))
        .addIntegerOption(option =>
            option.setName('winner-amount')
                .setDescription('Specifies the number of winners for this giveaway.')
                .setRequired(true))
    ,
    new SlashCommandBuilder()
        .setName('change-giveaways-channel')
        .setDescription('Change the channel of a specific giveaway')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('giveaways')
                .setDescription('Select a giveaway')
                .setRequired(true)
                .setAutocomplete(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The Discord channel where the giveaway will be announced.')
                .addChannelTypes(0)
                .setRequired(true))
    ,
    new SlashCommandBuilder()
        .setName('add-winner-user')
        .setDescription('Add a user as a winner to a specific giveaway')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('giveaways')
                .setDescription('Select a giveaway')
                .setRequired(true)
                .setAutocomplete(true))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Select a user')
                .setRequired(true))
    ,
    new SlashCommandBuilder()
        .setName('remove-winner-user')
        .setDescription('Remove a user from a specific giveaway')
        .addStringOption(option =>
            option.setName('giveaways')
                .setDescription('Select a giveaway to remove a user from')
                .setRequired(true)
                .setAutocomplete(true))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Select a user')
                .setRequired(true))
    ,
    new SlashCommandBuilder()
        .setName('create-giveaway')
        .setDescription('Initiates a new giveaway event.')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('giveaway-name')
                .setDescription('The unique name for the giveaway.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('giveaway-description')
                .setDescription('A brief description of what the giveaway is for.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('cost')
                .setDescription('The cost of the giveaway')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Select a role')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('winner-amount')
                .setDescription('Specifies the number of winners for this giveaway.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('date')
                .setDescription('The closing date for the giveaway entries in YYYY-MM-DD format.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('time')
                .setDescription('The closing time for the giveaway entries in HH:MM format (24-hour clock). Please use UTC time.')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The Discord channel where the giveaway will be announced.')
                .addChannelTypes(0)
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('min-level')
                .setDescription('The minimum level required to enter the giveaway.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('winner-message')
                .setDescription('The message that will be sent to the winners.')
                .setRequired(true))
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('The image of the giveaway'))

    ,
    //#endregion

    //#region -- CURRRENCY --
    new SlashCommandBuilder()
        .setName('reward')
        .setDescription('Give an user a reward')
        .setDefaultMemberPermissions(0)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to give the reward to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The amount of the reward')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the reward')),

    new SlashCommandBuilder()
        .setName("add-item")
        .setDescription("Add an item to the shop")
        .setDefaultMemberPermissions(0)
        .addSubcommand(subcommand =>
            subcommand.setName("code")
                .setDescription("Add a code item")
                .addStringOption(option =>
                    option.setName("name")
                        .setDescription("The name of the item")
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName("price")
                        .setDescription("The price of the item")
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName("description")
                        .setDescription("The description of the item")
                        .setRequired(true))
                .addAttachmentOption(option =>
                    option.setName("image")
                        .setDescription("The image of the item")),
        )
        .addSubcommand(subcommand =>
            subcommand.setName("role")
                .setDescription("Add a role item")
                .addStringOption(option =>
                    option.setName("name")
                        .setDescription("The name of the item")
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName("price")
                        .setDescription("The price of the item")
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName("description")
                        .setDescription("The description of the item")
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName("role")
                        .setDescription("The role you want to add to the shop")
                        .setRequired(true))
                .addAttachmentOption(option =>
                    option.setName("image")
                        .setDescription("The image of the item"))
        )
        .addSubcommand(subcommand =>
            subcommand.setName("other")
                .setDescription("Add a other type of item")
                .addStringOption(option =>
                    option.setName("name")
                        .setDescription("The name of the item")
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName("price")
                        .setDescription("The price of the item")
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName("description")
                        .setDescription("The description of the item")
                        .setRequired(true))
                .addAttachmentOption(option =>
                    option.setName("image")
                        .setDescription("The image of the item"))
        ),

    new SlashCommandBuilder()
        .setName("remove-item")
        .setDescription("Remove an item from the shop")
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName("item")
                .setDescription("The name of the item")
                .setRequired(true)
                .setAutocomplete(true)),

    new SlashCommandBuilder()
        .setName("shop1")
        .setDescription("Shows the shop"),

    new SlashCommandBuilder()
        .setName("buy")
        .setDescription("Buy an item from the shop")
        .addStringOption(option =>
            option.setName("item")
                .setDescription("The item index you want to buy")
                .setRequired(true)
                .setAutocomplete(true)),

    new SlashCommandBuilder()
        .setName("change-item-price")
        .setDescription("Change the price of an item in the shop")
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName("item")
                .setDescription("The name of the item")
                .setRequired(true)
                .setAutocomplete(true))
        .addIntegerOption(option =>
            option.setName("price")
                .setDescription("The new price of the item")
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName("change-item-description")
        .setDescription("Change the description of an item in the shop")
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName("item")
                .setDescription("The name of the item")
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName("description")
                .setDescription("The new description of the item")
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName("change-item-name")
        .setDescription("Change the name of an item in the shop")
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName("item")
                .setDescription("The name of the item")
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName("name")
                .setDescription("The new name of the item")
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Shows your balance"),

    new SlashCommandBuilder()
        .setName("currency")
        .setDescription("Shows the currency of a user")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user you want to see the currency of")
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName("currency-history")
        .setDescription("Shows the currency history")
        .setDefaultMemberPermissions(0)
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user you want to see the currency history of")
                .setRequired(true)),


    //#endregion

    //#region --BLACKLİST--

    new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription("Shows blacklisted words"),

    new SlashCommandBuilder()
        .setName('add-blacklist')
        .setDescription("Add a word to blacklist")
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('word')
                .setDescription('The word you want to add to blacklist')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('remove-blacklist')
        .setDescription("Remove a word from blacklist")
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('word')
                .setDescription('The word you want to remove from blacklist')
                .setRequired(true)
                .setAutocomplete(true)),


    //#endregion

    //#region --ACHİVEMENT--

    new SlashCommandBuilder()
        .setName('view-achievement')
        .setDescription('Shows the achievements of a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to see the achievements of')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('achievement')
        .setDescription('Shows your achievements'),

    new SlashCommandBuilder()
        .setName('achievement-list')
        .setDescription('Lists all achievements'),

    new SlashCommandBuilder()
        .setName("private-achievement")
        .setDescription("Set your achievement to  private"),

    new SlashCommandBuilder()
        .setName("unprivate-achievement")
        .setDescription("Set your achievement to public"),

    new SlashCommandBuilder()
        .setName("achievement-info")
        .setDescription("Shows the information of an achievement")
        .addStringOption(option =>
            option.setName('achievement')
                .setDescription('The achievement you want to see the information of')
                .setRequired(true)
                .setAutocomplete(true)),

    //#endregion

    //#region --CUSTOM EMOTES--

    new SlashCommandBuilder()
        .setName('add-emote')
        .setDescription('Add a custom emote to the server')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the new emote')
                .setRequired(true))
        .addAttachmentOption(option =>
            option.setName('file')
                .setDescription('The emote file')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('delete-emote')
        .setDescription('Delete a custom emote from the server')
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the emote you want to delete')
                .setRequired(true)
                .setAutocomplete(true)),

    //#endregion

    //#region --HELP--

    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows the help menu'),

    //#endregion

]

//#region -- SET COMMANDS --

const rest = new REST({ version: '10' }).setToken(TOKEN);

try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(ClientID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
} catch (error) {
    console.error(error);
}

//#endregion

//#endregion

//#endregion

//#region ---------|    Express Server   |---------

//#region Express Server


const options = {
    key: fs.readFileSync('/home/rqx3du584dnt/ssl/key.pem'), // Replace with your private key file
    cert: fs.readFileSync('/home/rqx3du584dnt/ssl/cert.pem'), // Replace with your certificate file
    //ca: fs.readFileSync('/home/rqx3du584dnt/ssl/certs/group.crt')
};

const app = express();
app.use("/webhook", webhookRouter);
app.use(bodyParser.json({ limit: '10mb' }));
const port = process.env.PORT || 8723;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: process.env.SECRET, // Replace with a strong secret
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true, httpOnly: true, sameSite: "lax" } // Set secure to true if using HTTPS
}));

app.use('/logout', (req, res) => {
    res.redirect('/');
    req.session.destroy();
});


app.get('/', async (req, res) => {

    const guild = await client.guilds.fetch(guildId);
    const guildInfo = await GetGuildInfo(guild)

    let member = null;
    let userIsAdmin = false;
    if (member !== undefined) {
        try {
            member = await guild.members.fetch(req.session.user.id);
            userIsAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator)
        } catch (error) {
        }
    }

    res.render('index', { user: req.session.user || null, userIsAdmin: userIsAdmin, guildInfo: guildInfo });
});

// Serve static files (for serving the HTML file)ˆ
app.use(express.static(path.join(__dirname, 'public')));
app.use('/icons', express.static(path.join(__dirname, 'icons')));

app.use('/api/auth/discord', authRouter);
app.use('/api/stripe', stripeRouter);

app.post('/reload-profiles', (req, res) => {
    const apiKey = req.headers['api-key'];

    if (apiKey !== process.env.API_KEY) {
        return res.status(403).send('Forbidden');
    }

    try {
        console.log('Reloading profiles... !!!');
        // profiles = JSON.parse(fs.readFileSync(profilesPath, 'utf-8'));
        res.status(200).send('Profiles reloaded successfully.');
    } catch (error) {
        console.error('Error reloading profiles:', error);
        res.status(500).send('Internal Server Error.');
    }
});


//#endregion

//#region AUTHENTICATION

const isAuthenticated = async (req, res, next) => {
    if (req.session.user === undefined) {
        res.status(401).send('Unauthorized');
        return;
    }
    const guild = await client.guilds.fetch(guildId);
    const member = await guild.members.fetch(req.session.user.id);
    try {
        const userIsAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator)
        if (userIsAdmin) {
            next();
        } else {
            res.status(403).send('Forbidden');
        }
    } catch (error) {
        res.status(401).send('Unauthorized');
    }
};

//#endregion

//#region PROFILE

app.get('/profile', async (req, res) => {

    if (req.session.user) {

        const userDc = await client.users.fetch(req.session.user.id);
        const guild = await client.guilds.fetch(guildId);
        const guildInfo = await GetGuildInfo(guild);

        controlAndCreateProfile(userDc)

        const data = await showProfile(null, userDc)
        if (data === undefined || data === null) {
            res.redirect('/');
            return;
        }

        let member = null;
        let userIsAdmin = false;
        if (member !== undefined) {
            try {
                member = await guild.members.fetch(req.session.user.id);
                userIsAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator)
                
            } catch (error) {
                console.log(error)
                console.log(2)
            }
        }

        
        
        
        
        
        
        
        let allUsers = [];
        
        let connection = null;
        try {
            connection = await pool.getConnection();
        
            const [rows] = await connection.execute('SELECT id FROM user_profiles');
        
            const userIds = rows.map(row => row.id);
        
            const fetchedMembers = await guild.members.fetch({ user: userIds });
        
            allUsers = await Promise.all(rows.map(user => {
                const member = fetchedMembers.get(user.id);
                const fetchedUser = client.users.cache.get(user.id);

                if (!member || !fetchedUser) return null;
        
                
                return {
                    id: user.id,
                    name: fetchedUser.username,
                };
            }));
        

            allUsers = allUsers.filter(user => user !== null);
        
        } catch (error) {
            
            console.error('Error fetching profiles:', error);
            res.status(500).send('Internal Server Error.');
            return;
        } finally {
            
            if (connection) {
                connection.release();
            }
            
        }
    
        
        




        res.render('userProfile', { user: req.session.user || null, data: data, allUsers: allUsers, userIsAdmin: userIsAdmin, guildInfo: guildInfo });
    } else {
        res.redirect('/api/auth/discord/login');
    }
});


app.get('/profile/:id', async (req, res) => {
    const userId = req.params.id;

    if (req.session.user) {

        if (userId === req.session.user.id) {
            res.redirect('/profile');
            return;
        }
        if (userId === client.user.id) {
            res.redirect('/');
            return;
        }
        if (userId === null || userId === undefined) {
            return;
        }

        const userDc = await client.users.fetch(userId)
        const guild = await client.guilds.fetch(guildId);
        const guildInfo = await GetGuildInfo(guild)

        controlAndCreateProfile(userDc)

        const data = await showProfile(null, userDc)
        if (data === undefined || data === null) {
            res.redirect('/');
            return;
        }

        let member = null;
        let userIsAdmin = false;
        if (member !== undefined) {
            try {
                member = await guild.members.fetch(req.session.user.id);
                userIsAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator)
            } catch (error) {
                res.redirect('/');
                return;
            }
        }
        
        
        let allUsers = [];
        
        let connection = null;
        try {
            connection = await pool.getConnection();
        
            const [rows] = await connection.execute('SELECT id FROM user_profiles');
        
            
            const userIds = rows.map(row => row.id);
        
            
            const fetchedUsers = await Promise.all(userIds.map(userId => client.users.fetch(userId).catch(err => {
                console.error(`Failed to fetch user ${userId}:`, err);
                return null; 
            })));
        
            
            allUsers = fetchedUsers
                .filter(userDc => userDc !== null) 
                .map(userDc => ({
                    id: userDc.id,
                    name: userDc.username,
                }));
        
        } catch (error) {
            console.error('Error fetching profiles:', error);
            res.status(500).send('Internal Server Error.');
            return;
        } finally {
            if (connection) {
                connection.release();
            }
        }





        if (!userIsAdmin && data.public == 0) {
            res.redirect('/profile');
            return;
        }
        if (data === undefined || data === null) {
            res.redirect('/profile');
            return;
        }

        res.render('userProfile', { user: req.session.user || null, data: data, allUsers: allUsers, userIsAdmin: userIsAdmin, guildInfo: guildInfo });
    } else {
        res.redirect('/api/auth/discord/login');
    }
});


app.post(
    '/profile-submit-form',
    isAuthenticated,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let {
            functionName,
            id,
            xp,
            action,
            quip,
            color
        } = req.body;

        const user = await client.users.fetch(id);
        var profile = await controlAndCreateProfile(user)

        xp = parseInt(xp);

        if (functionName == 'xp') {
            if (action == 'remove') {
                xp = -xp;
            }
            console.log(xp);
            await addTodayXp(profile, xp);
        }

        else if (functionName === 'coin') {
            let coin = parseInt(xp);
            if (action === 'remove') {
                coin = -coin;
            }
            await Reward(user, coin, null, null);
        }

        else if (functionName === 'quip') {
            profile.quip = quip;
            await updateProfile(profile);
        }

        else if (functionName === 'barColor') {
            profile.progressBarColor = color;
            await updateProfile(profile);
        }

        else if (functionName === 'backgroundColor') {
            profile.backgroundColor = color;
            await updateProfile(profile);
        }

        res.json({ data: req.body });
    }
);



//#endregion

//#region LEADERBOARD

app.get('/leaderboard', async (req, res) => {
    if (!req.session.user) {
        res.redirect('/api/auth/discord/login');
        return
    }

    let connection = null;
    try {
        connection = await pool.getConnection();

        // Kullanıcıları veritabanından al
        const [rows] = await connection.query(`
            SELECT id, level, xp, totalXp, subsMonth, totalCallMin, totalEventMin, 
                totalGiveawayAmount, totalWonGiveawayAmount, totalTextMessageAmount, 
                totalImageMessageAmount, totalVideoMessageAmount, totalEmoteMessageAmount, 
                totalAddReaction, totalEventAmount, monthlyXp, monthlyCallMin, 
                monthlyEventMin, monthlyGiveawayAmount, monthlyWonGiveawayAmount, 
                monthlyTextMessageAmount, monthlyImageMessageAmount, 
                monthlyVideoMessageAmount, monthlyEmoteMessageAmount, 
                monthlyAddReaction, monthlyEventAmount
            FROM user_profiles
            ORDER BY totalXp DESC
            LIMIT 500
        `);



        // Kullanıcı ID'lerini al
        const userIds = rows.map(user => user.id);

        // Discord üyelerini ve bilgilerini al
        const guild = await client.guilds.fetch(guildId);
        const guildInfo = await GetGuildInfo(guild);
        let member = null;
        let userIsAdmin = false;

        try {
            member = await guild.members.fetch(req.session.user.id);
            console.log(member.permissions)
            userIsAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator)
        } catch (error) {
            console.error("Error fetching member:", error);
        }

        // Kullanıcıların Discord bilgilerini al
        const fetchedMembers = await guild.members.fetch({ user: userIds });
        const allUsers = await Promise.all(rows.map(async user => {
            const member = fetchedMembers.get(user.id);
            const fetchedUser = client.users.cache.get(user.id);
            if (!fetchedUser) return null;

            return {
                id: fetchedUser.id,
                name: fetchedUser.username,
                iconURL: fetchedUser.displayAvatarURL({ format: 'png', dynamic: true }),
                level: user.level,
                xp: user.xp,
                totalXp: user.totalXp,
                subsMonth: user.subsMonth,
                totalCallMin: user.totalCallMin,
                totalEventMin: user.totalEventMin,
                totalGiveawayAmount: user.totalGiveawayAmount,
                totalWonGiveawayAmount: user.totalWonGiveawayAmount,
                totalTextMessageAmount: user.totalTextMessageAmount,
                totalImageMessageAmount: user.totalImageMessageAmount,
                totalVideoMessageAmount: user.totalVideoMessageAmount,
                totalEmoteMessageAmount: user.totalEmoteMessageAmount,
                totalAddReaction: user.totalAddReaction,
                totalEventAmount: user.totalEventAmount,
                monthlyXp: JSON.parse(user.monthlyXp),
                monthlyCallMin: JSON.parse(user.monthlyCallMin),
                monthlyEventMin: JSON.parse(user.monthlyEventMin),
                monthlyGiveawayAmount: JSON.parse(user.monthlyGiveawayAmount),
                monthlyWonGiveawayAmount: JSON.parse(user.monthlyWonGiveawayAmount),
                monthlyTextMessageAmount: JSON.parse(user.monthlyTextMessageAmount),
                monthlyImageMessageAmount: JSON.parse(user.monthlyImageMessageAmount),
                monthlyVideoMessageAmount: JSON.parse(user.monthlyVideoMessageAmount),
                monthlyEmoteMessageAmount: JSON.parse(user.monthlyEmoteMessageAmount),
                monthlyAddReaction: JSON.parse(user.monthlyAddReaction),
                monthlyEventAmount: JSON.parse(user.monthlyEventAmount),
                boostTime: member ? member.premiumSince : 0
            };
        }));

        // Null olanları filtrele
        const filteredLeaderboard = allUsers.filter(user => user !== null);
        filteredLeaderboard.sort((a, b) => b.totalXp - a.totalXp);

        // Render işlemi
        res.render('leaderboard', {
            user: req.session.user || null,
            leaderboard: filteredLeaderboard,
            userIsAdmin: userIsAdmin,
            guildInfo: guildInfo
        });

        if (connection) {
            // Bağlantıyı havuza geri bırak
            connection.release();
        }
    } catch (parseErr) {
        console.error('Internal Server Error:', parseErr);
        res.status(500).send('Internal Server Error');
    }

});

//#endregion

//#region CURRRENCY

app.get("/currency", async (req, res) => {
    //const session_id = req.session.sessionId;
    if (!req.session.user) {
        res.redirect('/api/auth/discord/login');
        return
    }

    const shopData = await readFileFunc(shopPath);
    const guild = await client.guilds.fetch(guildId);
    const guildInfo = await GetGuildInfo(guild)

    let member = null;
    let userIsAdmin = false;
    if (member !== undefined) {
        try {
            member = await guild.members.fetch(req.session.user.id);
            userIsAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator)
        } catch (error) {
        }
    }
    const roles = await guild.roles.fetch();
    const rolesInfo = roles.map(role => {
        return {
            id: role.id,
            name: role.name
        }
    })

    res.render('currency', { user: req.session.user || null, shopData: shopData, rolesInfo: rolesInfo, userIsAdmin: userIsAdmin, guildInfo: guildInfo });
});

app.post(
    '/currency-submit-form',
    isAuthenticated,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let {
            type,
            name,
            price,
            description,
            code,
            role,
            image,
            id,
            functionName,
            userIsAdmin,
        } = req.body;

        if (!userIsAdmin) {
            return
        }

        const prefix = "data:image/png;base64,";

        if (image !== null && image.startsWith(prefix)) {
            if (image.startsWith(prefix)) {
                image = image.substring(prefix.length);
            }
        }

        if (functionName == 'editItem') {
            await editItem(null, id, name, price, description, image, type, role, code);
        }

        if (functionName == 'deleteItem') {
            await RemoveItem(null, id);
        }

        if (functionName == 'createItem') {
            await AddItem(null, name, price, description, image, type, role, code);
        }



        res.json({ data: req.body });
    }
);

//#endregion

//#region EMOTES

app.get("/emotes", async (req, res) => {

    if (!req.session.user) {
        res.redirect('/api/auth/discord/login');
        return
    }





    let connection = null;
    try {
        connection = await pool.getConnection();

        // Kullanıcıların emojilerini veritabanından al
        const [rows] = await connection.query(`
            SELECT id, customEmotes
            FROM user_profiles
        `);

        // Kullanıcıların emojilerini ayrıştır
        const usersEmotes = [];

        for (const row of rows) {
            const userId = row.id;
            let customEmotes = row.customEmotes;


            // Eğer customEmotes boş değilse işlemleri yap
            if (customEmotes && customEmotes.length > 2) {

                customEmotes = JSON.parse(customEmotes);
                for (const emote of customEmotes) {
                    usersEmotes.push({
                        userId: userId,
                        emoteName: emote.name,
                        emoteId: emote.id,
                        emoteCreatedDate: emote.createdDate,
                        emoteDate: emote.Date
                    });
                }
            }
        }


        // Emojileri kullanıcılarla eşle
        const result = await Promise.all(usersEmotes.map(async emoteData => {
            const user = await client.users.fetch(emoteData.userId);
            return {
                user: user,
                emoteName: emoteData.emoteName,
                emoteId: emoteData.emoteId,
                emoteCreatedDate: emoteData.emoteCreatedDate,
                emoteDate: emoteData.emoteDate
            };
        }));

        // 'result' değişkeni artık kullanıcılarla eşleştirilmiş emojileri içerir


        // Guild ve kullanıcı bilgilerini al
        const guild = await client.guilds.fetch(guildId);
        const guildInfo = await GetGuildInfo(guild);
        let member = null;
        let userIsAdmin = false;

        try {
            member = await guild.members.fetch(req.session.user.id);
            userIsAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator)
        } catch (error) {
            console.error("Error fetching member:", error);
        }

        console.log(result);

        // Render işlemi
        res.render('emotes', {
            user: req.session.user || null,
            userIsAdmin: userIsAdmin,
            usersEmotes: result,
            guildInfo: guildInfo
        });

    } catch (error) {
        console.error('Internal Server Error:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        // Bağlantıyı kapat
        if (connection) {
            // Bağlantıyı havuza geri bırak
            connection.release();
        }
    }





});

app.post(
    '/emote-submit-form',
    isAuthenticated,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            functionName,
            emoteId,
            emoteName,
            emoteDate,
            emoteCreatedDate,
            emoteFile,
            user,
        } = req.body;

        console.log(req.body);

        if (functionName == 'deleteEmote') {
            await deleteEmote(null, emoteId, user);
        } else if (functionName == 'editEmote') {
            await editEmote(null, emoteId, emoteName, emoteCreatedDate, emoteDate, user);
        }

        res.json({ data: req.body });
    }
);

//#endregion

//#region PAYMENTS
/*
app.get("/payments", async (req, res) => {
    //const session_id = req.session.sessionId;
    if (!req.session.user) {
        res.redirect('/api/auth/discord/login');
        return
    }
    const users = await readFileFunc(usersPath);
    const customer = users.find(user => user.discordId === req.session.user.id);
    const subscriptionList = await stripe.subscriptions.list({ customer: customer.stripeCustomerId }); // kullacının sub
    const products = await stripe.products.list({ expand: ['data.default_price'], limit: 100 }); // satıcının sub

    const guild = await client.guilds.fetch(guildId);
    const guildInfo = await GetGuildInfo(guild)

    let member = null;
    let userIsAdmin = false;
    if (member !== undefined) {
        try {
            member = await guild.members.fetch(req.session.user.id);
            userIsAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator)
        } catch (error) {
        }
    }

    var subs = [];
    var oneTimes = [];
    products.data.forEach(product => {
        if (product.default_price) {
            const price = product.default_price;
            if (price.type === 'recurring') {
                subs.push(product);
            } else if (price.type === 'one_time') {
                oneTimes.push(product);
            }
        } else {
        }
    });

    subs = subs.sort((a, b) => b.default_price.unit_amount - a.default_price.unit_amount);
    oneTimes = oneTimes.sort((a, b) => b.default_price.unit_amount - a.default_price.unit_amount);


    res.render('payments', { user: req.session.user || null, key: process.env.STRIPE_PUBLISHABLE_KEY, subsData: subs, productData: oneTimes, userSubs: subscriptionList.data, userIsAdmin: userIsAdmin, guildInfo: guildInfo });
});
*/

app.get("/payments", async (req, res) => {
    if (!req.session.user) {
        res.redirect('/api/auth/discord/login');
        return;
    }

    try {
        const users = await readFileFunc(usersPath);
        const customer = users.find(user => user.discordId === req.session.user.id);
        const subscriptionList = await stripe.subscriptions.list({ customer: customer.stripeCustomerId }); // kullanıcının subscription'ları
        const products = await stripe.products.list({ expand: ['data.default_price'], limit: 100 }); // satıcının ürünleri

        const guild = await client.guilds.fetch(guildId);
        const guildInfo = await GetGuildInfo(guild);

        let member = null;
        let userIsAdmin = false;

        try {
            member = await guild.members.fetch(req.session.user.id);
            userIsAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);
        } catch (error) {
            // Eğer üye bilgilerini alırken hata oluşursa, bunu loglayabilirsiniz (isteğe bağlı)
            console.error('Error fetching member:', error);
        }

        var subs = [];
        var oneTimes = [];
        products.data.forEach(product => {
            if (product.default_price) {
                const price = product.default_price;
                if (price.type === 'recurring') {
                    subs.push(product);
                } else if (price.type === 'one_time') {
                    oneTimes.push(product);
                }
            }
        });

        subs = subs.sort((a, b) => b.default_price.unit_amount - a.default_price.unit_amount);
        oneTimes = oneTimes.sort((a, b) => b.default_price.unit_amount - a.default_price.unit_amount);

        res.render('payments', {
            user: req.session.user || null,
            key: process.env.STRIPE_PUBLISHABLE_KEY,
            subsData: subs,
            productData: oneTimes,
            userSubs: subscriptionList.data,
            userIsAdmin: userIsAdmin,
            guildInfo: guildInfo
        });
    } catch (error) {
        console.error('Error in /payments route:', error);
        res.redirect("/"); // Hata durumunda ana sayfaya yönlendir
    }
});


app.post("/delete-subscription", async (req, res) => {

    const discordId = req.session.user.id;
    const users = await readFileFunc(usersPath);
    const customer = await users.find(user => user.discordId === discordId);
    const subscription = await stripe.subscriptions.update(customer.subscriptionId, { cancel_at_period_end: true });

    res.json(subscription);
})


//#endregion

//#region HISTORY

app.get("/history/payments", async (req, res) => {

    if (!req.session.user) {
        res.redirect('/api/auth/discord/login');
        return
    }

    const guild = await client.guilds.fetch(guildId);
    const guildInfo = await GetGuildInfo(guild)
    let member = null;
    let userIsAdmin = false;
    if (member !== undefined) {
        try {
            member = await guild.members.fetch(req.session.user.id);
            userIsAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator)
        } catch (error) {
        }
    }

    if (!userIsAdmin) {
        return;
    }

    const payments = await stripe.charges.list({
        limit: 1000,
    });
    const users = await readFileFunc(usersPath);


    let historyData = []

    for (let i = 0; i < payments.data.length; i++) {
        const element = payments.data[i];

        const userId = await users.find(user => user.stripeCustomerId === element.customer);
        const discordUser = userId ? await client.users.fetch(userId.discordId) : null;

        historyData.push({
            id: element.id,
            amount: element.amount,
            receipt_number: element.receipt_number,
            receipt_url: element.receipt_url,
            invoice: element.invoice,
            customer: element.customer,
            user: discordUser ? discordUser : null,
            created: element.created
        });
    }

    res.render('paymentsHistory', { user: req.session.user || null, historyData: historyData, userIsAdmin: userIsAdmin, guildInfo: guildInfo });
})

//#endregion

//#region GIVEAWAY

app.get("/giveaway", (req, res) => {

    if (!req.session.user) {
        res.redirect('/api/auth/discord/login');
        return
    }

    fs.readFile(giveawayPath, 'utf8', async (err, data) => {
        if (err) {
            console.error('Error reading giveaway.json:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        try {
            let giveaways = JSON.parse(data);
            giveaways.forEach(giveaway => {
                delete giveaway.winnerUser;
                delete giveaway.costPayed;
            });
            const guild = await client.guilds.fetch(guildId);
            const guildInfo = await GetGuildInfo(guild)
            let member = null;
            let userIsAdmin = false;
            if (member !== undefined) {
                try {
                    member = await guild.members.fetch(req.session.user.id);
                    userIsAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator)
                } catch (error) {
                }
            }
            const roles = await guild.roles.fetch();
            const channels = await guild.channels.fetch();
            const textChannels = channels.filter(channel => channel.type === ChannelType.GuildText);
            const channelInfo = textChannels.map(channel => {
                return {
                    id: channel.id,
                    name: channel.name
                }
            });
            const rolesInfo = roles.map(role => {
                return {
                    id: role.id,
                    name: role.name
                }
            }
            );
            res.render("giveaway", { user: req.session.user || null, rolesInfo, channelInfo, giveaways: giveaways, userIsAdmin: userIsAdmin, guildInfo: guildInfo });

        } catch (parseErr) {
            console.error('Error parsing giveaway.json:', parseErr);
            res.status(500).send('Internal Server Error');
        }
    });
});

app.post(
    '/submit-form',
    isAuthenticated,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let {
            name,
            description,
            cost,
            image,
            restrictRoles,
            requiredRoles,
            minLevel,
            endDate,
            channel,
            winnerAmount,
            winnerMessage,
            isChange,
            giveawayMessageId,
        } = req.body;

        const prefix = "data:image/png;base64,";

        if (image !== null && image !== undefined && image !== "") {
            if (image.startsWith(prefix)) {
                image = image.substring(prefix.length);
            }

        }

        const guild = client.guilds.cache.get(guildId);
        if (requiredRoles === null || requiredRoles === undefined || requiredRoles === "") {
            requiredRoles = `${guildId}`;
        }
        const giveawayRole = await guild.roles.fetch(requiredRoles);
        var [date, time] = endDate.split("T");
        time = time.substring(0, 5);
        const giveawayChannel = await guild.channels.fetch(channel);

        if (isChange) {
            await changeGiveaway(null, name, description, cost, winnerAmount, date, time, giveawayChannel, giveawayRole, minLevel, winnerMessage, giveawayMessageId);
        }
        else {
            await createGiveaway(null, name, description, cost, winnerAmount, date, time, giveawayChannel, giveawayRole, minLevel, winnerMessage, image);
        }

        res.json({ data: req.body });
    }
);

//#endregion

//#endregion

//#region ---------|     Discord Bot     |--------- 

//#region -- REPEATING MESSAGES --

var repeatingMessagesArray = []

await GetRepeatingMessages().then(subs => {
    subs.forEach(element => {
        repeatingMessagesArray.push(element)
    });
}).catch(error => {
    console.error(error)
});

await SaveRepeatingMessages();

repeatingMessagesLoop()

async function repeatingMessagesLoop() {
    setInterval(async () => {
        const date = new Date()
        const day = date.getDay()
        const hour = date.getHours()
        const minute = date.getMinutes()

        repeatingMessagesArray.forEach(async repeatingMessage => {
            const newDate = new Date()
            const nextSend = new Date(repeatingMessage.nextSend)
            const nextDay = nextSend.getDay()
            const nextHour = nextSend.getHours()
            const nextMinute = nextSend.getMinutes()

            if (day === nextDay && hour === nextHour && minute === nextMinute) {
                const channel = client.channels.cache.get(repeatingMessage.channel)

                if (repeatingMessage.messageId !== null) {

                    const oldMessage = await channel.messages.fetch(repeatingMessage.messageId)
                    if (oldMessage) {
                        oldMessage.delete()
                    }
                }

                const newMessage = await channel.send(repeatingMessage.message)

                newDate.setDate(newDate.getDate() + repeatingMessage.day)
                newDate.setHours(newDate.getHours() + repeatingMessage.hour)
                newDate.setMinutes(newDate.getMinutes() + repeatingMessage.minute)
                repeatingMessage.nextSend = newDate
                repeatingMessage.messageId = newMessage.id
                SaveRepeatingMessages()
            }

        })
    }, 3000)
}

//#endregion

//#region -- GIVEAWAYS --

client.on('ready', async () => {
    setInterval(loop, 15 * 1000)
    setInterval(monthlyTop10, 24 * 60 * 60 * 1000)
    setInterval(oneDayLoop, 24 * 60 * 60 * 1000)
});
async function oneDayLoop() {
    let connection = null;
    try {
        connection = await pool.getConnection();

        // Profillerin ID'lerini al
        const [profilesResult] = await connection.query(`
            SELECT id, monthlyXp
            FROM user_profiles
        `);
        const profiles = profilesResult;

        for (const profileToLook of profiles) {
            try {
                const guild = await client.guilds.fetch(guildId);
                if (!guild) {
                    console.error(`Guild with ID ${guildId} not found.`);
                    continue;
                }

                let member;
                try {
                    member = await guild.members.fetch(profileToLook.id);
                } catch (error) {
                    if (error.code === 10007) {
                        console.error(`Member with ID ${profileToLook.id} not found.`);
                        continue;
                    } else {
                        throw error;
                    }
                }

                if (!member) {
                    console.error(`Member with ID ${profileToLook.id} could not be fetched.`);
                    continue;
                }

                let profile = await controlAndCreateProfile(member);
                if (!profile) {
                    console.error(`Profile creation failed for member ${profileToLook.id}.`);
                    continue;
                }

                const joinedAt = member.joinedAt;
                if (!joinedAt) {
                    console.error(`Member ${profileToLook.id} does not have a joinedAt date.`);
                    continue;
                }

                const currentDate = new Date();
                const diffTime = Math.abs(currentDate - joinedAt);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                console.log(diffDays);

                // SQL güncelleme işlemleri
                await CheckAchievements(profile, diffDays, "server_age");

                if (profile.monthlyXp[1] > 0) {
                    profile.activityStreak++;
                    await CheckAchievements(profile, profile.activityStreak, "activity_streak");
                } else {
                    profile.activityStreak = 0;
                }

                // Profil güncellemesini yap
                await connection.query(`
                    UPDATE user_profiles
                    SET activityStreak = ?
                    WHERE id = ?
                `, [profile.activityStreak, profile.id]);

            } catch (error) {
                console.error(`Error processing profile ${profileToLook.id}:`, error);
            }
        }

    } catch (error) {
        console.error('Internal Server Error:', error);
    } finally {
        // Bağlantıyı kapat
        if (connection) {
            connection.release();
        }
    }
}



//#endregion

//#region -- LEVEL XP SETUP --


// var profiles = []

const xpIntervals = new Map();
let eventChannelId = null;

// await GetProfile().then(profile => {
//     profile.forEach(element => {
//         profiles.push(element)
//     });
// }).catch(error => {
//     console.error(error)
// })
// profiles.forEach(profile => {
//     profile.canEarnFromMessage = true
//     profile.canEarnFromPhoto = true
//     profile.canEarnFromAdReaction = true
//     profile.canEarnFromEvent = true
//     profile.requiredXp = config.levelUpXp * profile.level
// })


// unshift a zero after a day pass
setInterval(async () => {

    let connection = null;
    try {
        connection = await pool.getConnection();

        // Kullanıcı profillerini al
        const [profiles] = await connection.query('SELECT id, monthlyXp, monthlyCallMin, monthlyEventMin, monthlyGiveawayAmount, monthlyWonGiveawayAmount, monthlyTextMessageAmount, monthlyImageMessageAmount, monthlyVideoMessageAmount, monthlyEmoteMessageAmount, monthlyEventAmount FROM user_profiles');

        for (const profile of profiles) {
            const updatedMonthlyXp = JSON.stringify([0, ...(JSON.parse(profile.monthlyXp) || [])].slice(0, 30));
            const updatedMonthlyCallMin = JSON.stringify([0, ...(JSON.parse(profile.monthlyCallMin) || [])].slice(0, 30));
            const updatedMonthlyEventMin = JSON.stringify([0, ...(JSON.parse(profile.monthlyEventMin) || [])].slice(0, 30));
            const updatedMonthlyGiveawayAmount = JSON.stringify([0, ...(JSON.parse(profile.monthlyGiveawayAmount) || [])].slice(0, 30));
            const updatedMonthlyWonGiveawayAmount = JSON.stringify([0, ...(JSON.parse(profile.monthlyWonGiveawayAmount) || [])].slice(0, 30));
            const updatedMonthlyTextMessageAmount = JSON.stringify([0, ...(JSON.parse(profile.monthlyTextMessageAmount) || [])].slice(0, 30));
            const updatedMonthlyImageMessageAmount = JSON.stringify([0, ...(JSON.parse(profile.monthlyImageMessageAmount) || [])].slice(0, 30));
            const updatedMonthlyVideoMessageAmount = JSON.stringify([0, ...(JSON.parse(profile.monthlyVideoMessageAmount) || [])].slice(0, 30));
            const updatedMonthlyEmoteMessageAmount = JSON.stringify([0, ...(JSON.parse(profile.monthlyEmoteMessageAmount) || [])].slice(0, 30));
            const updatedMonthlyEventAmount = JSON.stringify([0, ...(JSON.parse(profile.monthlyEventAmount) || [])].slice(0, 30));

            // Kullanıcı profillerini güncelle
            await connection.query(`
                UPDATE user_profiles
                SET 
                    monthlyXp = ?,
                    monthlyCallMin = ?,
                    monthlyEventMin = ?,
                    monthlyGiveawayAmount = ?,
                    monthlyWonGiveawayAmount = ?,
                    monthlyTextMessageAmount = ?,
                    monthlyImageMessageAmount = ?,
                    monthlyVideoMessageAmount = ?,
                    monthlyEmoteMessageAmount = ?,
                    monthlyEventAmount = ?
                WHERE id = ?`,
                [
                    updatedMonthlyXp,
                    updatedMonthlyCallMin,
                    updatedMonthlyEventMin,
                    updatedMonthlyGiveawayAmount,
                    updatedMonthlyWonGiveawayAmount,
                    updatedMonthlyTextMessageAmount,
                    updatedMonthlyImageMessageAmount,
                    updatedMonthlyVideoMessageAmount,
                    updatedMonthlyEmoteMessageAmount,
                    updatedMonthlyEventAmount,
                    profile.id
                ]
            );
        }
    } catch (error) {
        console.error('Error updating daily counts:', error);
    } finally {
        if (connection) {
            // Bağlantıyı havuza geri bırak
            connection.release();
        }
    }
}, 24 * 60 * 60 * 1000)

function fixJson(jsonStr) {
    jsonStr = jsonStr.trim().replace(/^[^{[]+|[^}\]]+$/g, '');

    jsonStr = jsonStr.replace(/[\u0000-\u0019]+/g, '');

    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

    let openBraces = (jsonStr.match(/{/g) || []).length;
    let closeBraces = (jsonStr.match(/}/g) || []).length;
    let openBrackets = (jsonStr.match(/\[/g) || []).length;
    let closeBrackets = (jsonStr.match(/]/g) || []).length;

    while (closeBraces > openBraces) {
        jsonStr = jsonStr.substring(0, jsonStr.lastIndexOf('}') + 1);
        closeBraces--;
    }

    while (closeBrackets > openBrackets) {
        jsonStr = jsonStr.substring(0, jsonStr.lastIndexOf(']') + 1);
        closeBrackets--;
    }

    while (openBraces > closeBraces) {
        jsonStr += '}';
        openBraces--;
    }

    while (openBrackets > closeBrackets) {
        jsonStr += ']';
        openBrackets--;
    }

    try {
        return JSON.parse(jsonStr);
    } catch (err) {
        throw new Error('Geçersiz JSON formatı: ' + err.message);
    }
}


//#endregion

//#region -- SUBS SETUP --

var subsArray = []

await GetSubs().then(subs => {
    subs.forEach(element => {
        subsArray.push(element)
    });
}).catch(error => {
    console.error(error)
})

await SaveSubs()

//#endregion

//#region -- INTERACTIONS --

client.on('interactionCreate', async interaction => {

    if (interaction.isCommand()) {

        //#region -- HELP --

        if (interaction.commandName === 'help') {

            let embedArray = []

            const repeatingMessageEmbed = new EmbedBuilder()
                .setColor('Fuchsia')
                .setTitle('Repeating Message Commands')
                .addFields(
                    { name: '`/create-repeating-message`', value: '`Create a new repeating message`' },
                    { name: '`/delete-repeating-message`', value: '`Delete a repeating message`' },
                    { name: '`/repeating-messages-list`', value: '`Lists all repeating messages`' },
                    { name: '`/repeating-message-info`', value: '`Provides detailed information about a specific repeating message`' },
                    { name: '`/change-repeating-message`', value: '`Change the message of a specific repeating message`' },
                    { name: '`/change-repeating-message-time`', value: '`Change the time of a specific repeating message`' },
                    { name: '`/change-repeating-message-channel`', value: '`Change the channel of a specific repeating message`' }
                )



            const subscriptionEmbed = new EmbedBuilder()
                .setColor('Fuchsia')
                .setTitle('Subscription Commands')
                .addFields(
                    { name: '`/create-subs`', value: '`Create a new subscription`' },
                    { name: '`/delete-subs`', value: '`Delete a subscription`' },
                    { name: '`/subs-list`', value: '`Lists all subscriptions`' },
                    { name: '`/subs-info`', value: '`Provides detailed information about a specific subscription`' },
                    { name: '`/change-subs-name`', value: '`Change the name of a specific subscription' },
                    { name: '`/change-subs-id`', value: '`Change the id of a specific subscription`' },
                    { name: '`/change-subs-role`', value: 'Change the role of a specific subscription`' },
                    { name: '`/add-subs-user`', value: '`Add a user to a specific subscription`' },
                    { name: '`/remove-subs-user`', value: '`Remove a user from a specific subscription`' }
                )

            const profileEmbed = new EmbedBuilder()
                .setColor('Fuchsia')
                .setTitle('Profil Commands')
                .addFields(
                    { name: '/profile`', value: '`Shows the profile of a user`' },
                    { name: '/my-profile`', value: '`Shows your profile`' },
                    { name: '/set-progress-bar-color`', value: '`Set your progress bar color`' },
                    { name: '/set-profile-background`', value: '`Set your profile background`' },
                    { name: '/quip`', value: '`Set your profile quip`' },
                    { name: '/private-profile`', value: '`Set your profile to private`' },
                    { name: '/unprivate-profile`', value: '`Set your profile to public`' }
                )

            const configEmbed = new EmbedBuilder()
                .setColor('Fuchsia')
                .setTitle('Config Commands')
                .addFields(
                    { name: '/set-config`', value: '`Set the configuration for the bot`' }
                )

            const leaderboardEmbed = new EmbedBuilder()
                .setColor('Fuchsia')
                .setTitle('Leaderboard Commands')
                .addFields(
                    { name: '`/leaderboard`', value: '`Shows leaderboard`' },
                    { name: '`/add-xp`', value: '`Add xp to a user`' },
                    { name: '`/add-level-role`', value: '`Set a role for a level`' },
                    { name: '`/remove-level-role`', value: '`Remove a level-role`' }
                )

            const giveawayEmbed = new EmbedBuilder()
                .setColor('Fuchsia')
                .setTitle('Giveaway Commands')
                .addFields(
                    { name: '`/giveaways-info`', value: '`Provides detailed information about a specific giveaway`' },
                    { name: '`/giveaways-delete`', value: '`Deletes a specific giveaway`' },
                    { name: '`/giveaways-list`', value: '`Lists all active giveaways`' },
                    { name: '`/change-giveaways-name`', value: '`Change the name of a specific giveaway`' },
                    { name: '`/change-giveaways-description`', value: '`Change the description of a specific giveaway`' },
                    { name: '`/change-giveaways-date`', value: '`Change the date of a specific giveaway`' },
                    { name: '`/change-giveaways-winneramount`', value: '`Change the number of winners for a specific giveaway`' },
                    { name: '`/change-giveaways-channel`', value: '`Change the channel of a specific giveaway`' },
                    { name: '`/add-winner-user`', value: '`Add a user as a winner to a specific giveaway`' },
                    { name: '`/remove-winner-user`', value: '`Remove a user from a specific giveaway`' },
                    { name: '`/create-giveaway`', value: '`Initiates a new giveaway event.`' }
                )

            const rewardEmbed = new EmbedBuilder()
                .setColor('Fuchsia')
                .setTitle('Reward Commands')
                .addFields(
                    { name: '`/reward`', value: '`Give a user a reward`' }
                )

            const shopEmbed = new EmbedBuilder()
                .setColor('Fuchsia')
                .setTitle('Shop Commands')
                .addFields(
                    { name: '`/add-item`', value: '`Add an item to the shop`' },
                    { name: '`/remove-item`', value: '`Remove an item from the shop`' },
                    { name: '`/shop1`', value: '`Shows the shop`' },
                    { name: '`/buy`', value: '`Buy an item from the shop`' },
                    { name: '`/change-item-price`', value: '`Change the price of an item in the shop`' },
                    { name: '`/change-item-description`', value: '`Change the description of an item in the shop`' },
                    { name: '`/change-item-name`', value: '`Change the name of an item in the shop`' }
                )

            const currencyEmbed = new EmbedBuilder()
                .setColor('Fuchsia')
                .setTitle('Currency Commands')
                .addFields(
                    { name: '`/balance`', value: '`Shows your balance`' },
                    { name: '`/currency`', value: '`Shows the currency of a user`' },
                    { name: '`/currency-history`', value: '`Shows the currency history`' }
                )

            embedArray.push(repeatingMessageEmbed, subscriptionEmbed, profileEmbed, configEmbed, leaderboardEmbed, giveawayEmbed, rewardEmbed, shopEmbed, currencyEmbed)


            const options = [
                { label: 'Repeating Message Commands', value: 'repeatingMessageEmbed' },
                { label: 'Subscription Commands', value: 'subscriptionEmbed' },
                { label: 'Profile Commands', value: 'profileEmbed' },
                { label: 'Config Commands', value: 'configEmbed' },
                { label: 'Leaderboard Commands', value: 'leaderboardEmbed' },
                { label: 'Giveaway Commands', value: 'giveawayEmbed' },
                { label: 'Reward Commands', value: 'rewardEmbed' },
                { label: 'Shop Commands', value: 'shopEmbed' },
                { label: 'Currency Commands', value: 'currencyEmbed' }
            ];

            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select')
                        .setPlaceholder('Select a category')
                        .addOptions(options)
                );


            let message = await interaction.reply({ embeds: [repeatingMessageEmbed], components: [row] });

            const collector = message.createMessageComponentCollector({ time: 120000 });

            collector.on('collect', async i => {
                let embed;
                switch (i.values[0]) {
                    case 'repeatingMessageEmbed':
                        embed = repeatingMessageEmbed;
                        break;
                    case 'subscriptionEmbed':
                        embed = subscriptionEmbed;
                        break;
                    case 'profileEmbed':
                        embed = profileEmbed;
                        break;
                    case 'configEmbed':
                        embed = configEmbed;
                        break;
                    case 'leaderboardEmbed':
                        embed = leaderboardEmbed;
                        break;
                    case 'giveawayEmbed':
                        embed = giveawayEmbed;
                        break;
                    case 'rewardEmbed':
                        embed = rewardEmbed;
                        break;
                    case 'shopEmbed':
                        embed = shopEmbed;
                        break;
                    case 'currencyEmbed':
                        embed = currencyEmbed;
                        break;
                }
                await i.update({ embeds: [embed], components: [row] });
            });

        }


        //#endregion

        //#region -- REPEATING MESSAGES --
        if (interaction.commandName === 'create-repeating-message') {
            const message = interaction.options.getString('message');
            const channel = interaction.options.getChannel('channel');
            const day = interaction.options.getInteger('day');
            const hour = interaction.options.getInteger('hour');
            const minute = interaction.options.getInteger('minute');

            await createRepeatingMessage(interaction, message, channel, day, hour, minute);
        }

        if (interaction.commandName === 'delete-repeating-message') {
            const message = interaction.options.getString('message');

            await deleteRepeatingMessage(interaction, message);
        }

        if (interaction.commandName === 'repeating-messages-list') {
            const repeatingMessagesList = repeatingMessagesArray.map(repeatingMessage => repeatingMessage.message + ' - ' + repeatingMessage.channel);

            const embed = new EmbedBuilder()
                .setColor('Gold')
                .setTitle('Repeating Messages')
                .setDescription(repeatingMessagesList.join('\n'))
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }

        if (interaction.commandName === 'repeating-message-info') {

            const message = interaction.options.getString('message');
            const index = repeatingMessagesArray.findIndex(repeatingMessage => repeatingMessage.messageId === message);

            console.log(message);
            console.log(index);


            if (index !== -1) {
                const repeatingMessageInfo = repeatingMessagesArray[index];

                const embed = new EmbedBuilder()
                    .setAuthor({ name: `Owner: ${repeatingMessageInfo.ownerUsername}` })
                    .setColor('Gold')
                    .setTitle('Repeating Message Info')
                    .setDescription(`Message: ${repeatingMessageInfo.message}\nChannel: ${repeatingMessageInfo.channel}\nInterval: ${repeatingMessageInfo.day} days ${repeatingMessageInfo.hour} hour ${repeatingMessageInfo.minute} minute`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            }
        }

        if (interaction.commandName === 'change-repeating-message') {
            const message = interaction.options.getString('old-message');
            const newMessage = interaction.options.getString('new-message');

            await changeRepeatingMessage(interaction, message, newMessage);
        }

        if (interaction.commandName === 'change-repeating-message-time') {
            const message = interaction.options.getString('message');
            const day = interaction.options.getInteger('day');
            const hour = interaction.options.getInteger('hour');
            const minute = interaction.options.getInteger('minute');

            await changeRepeatingMessageTime(interaction, message, day, hour, minute);
        }

        if (interaction.commandName === 'change-repeating-message-channel') {
            const message = interaction.options.getString('message');
            const channel = interaction.options.getChannel('channel');

            await changeRepeatingMessageChannel(interaction, message, channel);
        }

        //#endregion

        //#region --GIVEAWAYS--

        if (interaction.commandName === 'create-giveaway') {
            const giveawayName = interaction.options.getString('giveaway-name');
            const giveawayDescription = interaction.options.getString('giveaway-description');
            const giveawayCost = interaction.options.getInteger('cost');
            const giveawayWinnerAmount = interaction.options.getInteger('winner-amount');
            const giveawayDate = interaction.options.getString('date');
            const giveawayTime = interaction.options.getString('time');
            const giveawayChannel = interaction.options.getChannel('channel');
            const giveawayRole = interaction.options.getRole('role');
            const minLevel = interaction.options.getInteger('min-level');
            const winnerMessage = interaction.options.getString('winner-message');
            const giveawayImage = interaction.options.getAttachment('image');

            let giveawaybase64Image = null;

            if (giveawayImage !== null && giveawayImage !== undefined && giveawayImage !== "") {
                if (giveawayImage.contentType.startsWith('image/')) {
                    try {
                        const response = await fetch(giveawayImage.url);
                        const buffer = await response.buffer();
                        giveawaybase64Image = buffer.toString('base64');
                    } catch (error) {
                        console.error(error);
                    }
                }
            }

            await createGiveaway(interaction, giveawayName, giveawayDescription, giveawayCost, giveawayWinnerAmount, giveawayDate, giveawayTime, giveawayChannel, giveawayRole, minLevel, winnerMessage, giveawaybase64Image);
        }
        if (interaction.commandName === 'change-giveaways-name') {
            const giveawayMessageId = interaction.options.getString('giveaways');
            const giveawayName = interaction.options.getString('name');

            await changeGiveawayName(interaction, giveawayMessageId, giveawayName);
        }
        if (interaction.commandName === 'change-giveaways-description') {
            const giveawayMessageId = interaction.options.getString('giveaways');
            const giveawayDescription = interaction.options.getString('description');

            await changeGiveawayDescription(interaction, giveawayMessageId, giveawayDescription);
        }
        if (interaction.commandName === 'change-giveaways-date') {
            const giveawayMessageId = interaction.options.getString('giveaways');
            const giveawayDate = interaction.options.getString('date');
            const giveawayTime = interaction.options.getString('time');

            await changeGiveawayDate(interaction, giveawayMessageId, giveawayDate, giveawayTime);

        }
        if (interaction.commandName === 'change-giveaways-winneramount') {
            const giveawayMessageId = interaction.options.getString('giveaways');
            const giveawayWinnerAmount = interaction.options.getInteger('winner-amount');


            await changegiveawayWinnerAmount(interaction, giveawayMessageId, giveawayWinnerAmount);
        }
        if (interaction.commandName === 'change-giveaways-channel') {
            const giveawayMessageId = interaction.options.getString('giveaways');
            const giveawayChannel = interaction.options.getChannel('channel');

            await changeGiveawayChannel(interaction, giveawayMessageId, giveawayChannel);
        }
        if (interaction.commandName === 'remove-winner-user') {
            const giveawayMessageId = interaction.options.getString('giveaways');
            const targetUser = interaction.options.getUser('user');

            await removeWinnerUser(interaction, giveawayMessageId, targetUser);

        }
        if (interaction.commandName === 'add-winner-user') {
            const giveawayMessageId = interaction.options.getString('giveaways')
            const targetUser = interaction.options.getUser('user');

            await addWinnerUser(interaction, giveawayMessageId, targetUser);

        }
        if (interaction.commandName === 'giveaways-info') {
            const giveawayMessageId = interaction.options.getString('giveaways');

            await giveawaysInfo(interaction, giveawayMessageId);
        }
        if (interaction.commandName === 'giveaways-delete') {
            const giveawayMessageId = interaction.options.getString('giveaways');

            await deleteGiveaway(interaction, giveawayMessageId);
        }
        if (interaction.commandName === 'giveaways-list') {
            await giveawayList(interaction);
        }
        //#endregion

        //#region --CURRRENCY--

        if (interaction.commandName === "reward") {
            const member = interaction.options.getMember("user");
            const amount = interaction.options.getInteger("amount")
            const reason = interaction.options.getString("reason")
            await Reward(member, amount, interaction, reason)
        }


        if (interaction.commandName === "shop1") {

            var profile = await controlAndCreateProfile(interaction.user)

            const shopData = await readFileFunc(shopPath);
            if (shopData.length === 0) {
                interaction.reply({ content: 'There are no items in the shop.', ephemeral: true });
                return;
            }

            const userBalanceEmbed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('Choose store reward!')
                .setDescription(`Your balance is ${profile.balance} tokens`);



            let pages = [];
            const itemsPerPage = 5;
            for (let i = 0; i < shopData.length; i += itemsPerPage) {
                let embeds = [];
                for (let j = i; j < i + itemsPerPage && j < shopData.length; j++) {
                    let item = shopData[j];
                    let description = item.description ? item.description : 'No description available';
                    let embed = new EmbedBuilder()
                        .setAuthor({ name: `${item.price} tokens`, iconURL: coinUrl })
                        .setColor('Blue')
                        .setTitle(item.name)
                        .setDescription(`Description: ${description}\nType: ${item.type}\nPrice: ${item.price} tokens`);

                    if (item.roleId) {
                        try {
                            let role = await interaction.guild.roles.fetch(item.roleId);
                            embed.addFields({ name: 'Role', value: role.name });
                        } catch (error) {
                            console.log(error);
                        }
                    }

                    if (item.imageBase64[0]) {
                        const imageBuffer = Buffer.from(item.imageBase64[0], 'base64');
                        const attachmentName = `image_${j}.png`;
                        const attachment = new AttachmentBuilder(imageBuffer, { name: attachmentName });
                        embed.setImage(`attachment://${attachmentName}`);
                        embed.files = [attachment];
                    }

                    embeds.push(embed);
                }
                embeds.push(userBalanceEmbed);
                pages.push(embeds);
            }

            let currentPage = 0;

            const createPaginationButtons = (currentPage, totalPages) => {
                return new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('previous')
                            .setLabel('Previous')
                            .setStyle('Primary')
                            .setDisabled(currentPage === 0),
                        new ButtonBuilder()
                            .setCustomId('page')
                            .setLabel(`${currentPage + 1}/${totalPages}`)
                            .setStyle('Success')
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('Next')
                            .setStyle('Primary')
                            .setDisabled(currentPage === totalPages - 1),
                    );
            };

            const createSelectMenu = (items) => {
                let options = [];
                items.forEach((item, index) => {
                    options.push({
                        label: item.name,
                        description: item.description ? item.description : 'No description available',
                        value: index.toString()
                    });
                });

                return new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('selectItem')
                            .setPlaceholder('Select an item')
                            .addOptions(options)
                    );
            };

            let reply = await interaction.reply({
                embeds: pages[currentPage],
                components: [createPaginationButtons(currentPage, pages.length), createSelectMenu(shopData)],
                ephemeral: true,
                files: pages[currentPage].flatMap(embed => embed.files ? embed.files : [])
            });

            const collector = reply.createMessageComponentCollector({ time: 300000 });

            collector.on('collect', async interaction => {
                if (interaction.customId === 'previous') {
                    currentPage = Math.max(currentPage - 1, 0);
                } else if (interaction.customId === 'next') {
                    currentPage = Math.min(currentPage + 1, pages.length - 1);
                } else if (interaction.customId === 'selectItem') {

                    const selectedIndex = parseInt(interaction.values[0], 10);
                    const selectedItem = shopData[selectedIndex];

                    await Buy(interaction.user, selectedItem.id, interaction)

                }

                await interaction.update({
                    embeds: pages[currentPage],
                    components: [createPaginationButtons(currentPage, pages.length), createSelectMenu(shopData)],
                    files: pages[currentPage].flatMap(embed => embed.files ? embed.files : [])
                });
            });

            collector.on('end', () => {
                reply.edit({
                    components: []
                });
            });
        }



        if (interaction.commandName === "add-item") {
            const name = interaction.options.getString("name")
            const price = interaction.options.getInteger("price")
            const description = interaction.options.getString("description")
            const image = interaction.options.getAttachment("image")
            const type = interaction.options.getSubcommand()

            let imageBase64 = null;
            if (image !== null && image !== undefined && image !== "") {
                if (image.contentType.startsWith('image/')) {
                    try {
                        const response = await fetch(image.url);
                        const buffer = await response.buffer();
                        imageBase64 = buffer.toString('base64');
                    } catch (error) {
                        console.error(error);
                    }
                }

            }

            var role = null
            if (type === "role") {
                role = interaction.options.getRole("role")
                if (role.managed) {
                    const embed = new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`**${role.name}** is a bot role.`)
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return
                }
                await AddItem(interaction, name, price, description, imageBase64, type, role.id, null)
                return
            }

            await AddItem(interaction, name, price, description, imageBase64, type, null, null)

        }
        if (interaction.commandName === "buy") {
            var itemId = interaction.options.getString("item")
            const user = interaction.user
            await Buy(user, itemId, interaction)
        }
        if (interaction.commandName === "remove-item") {
            const itemId = interaction.options.getString("item")
            await RemoveItem(interaction, itemId)
        }
        if (interaction.commandName === "change-item-price") {
            const itemId = interaction.options.getString("item")
            const newPrice = interaction.options.getInteger("price")
            await ChangePrice(interaction, itemId, newPrice)
        }
        if (interaction.commandName === "change-item-name") {
            const itemId = interaction.options.getString("item")
            const newName = interaction.options.getString("name")
            await ChangeName(interaction, itemId, newName)
        }
        if (interaction.commandName === "change-item-description") {
            const itemId = interaction.options.getString("item")
            const newDescription = interaction.options.getString("description")
            await ChangeDescription(interaction, itemId, newDescription)
        }
        if (interaction.commandName === "balance") {

            await controlAndCreateProfile(interaction.user)


            var profile = await controlAndCreateProfile(interaction.user)

            const embed = new EmbedBuilder()
                .setAuthor({ name: `You have ${profile.balance} coins.`, iconURL: coinUrl })
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setDescription('``You can use the command``\n**``/shop1``**`` to buy items.``\n')
                .setColor('Blue')
            await interaction.reply({ embeds: [embed], ephemeral: true });

        }
        if (interaction.commandName === "currency") {

            const user = interaction.options.getUser("user")
            var profile = await controlAndCreateProfile(user)

            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setDescription(`**${user.username}** has **${profile.balance}** coins.`)
            await interaction.reply({ embeds: [embed], ephemeral: true });

        }
        if (interaction.commandName === "currency-history") {
            const user = interaction.options.getUser("user")
            const currencyHistory = await readFileFunc(currencyHistoryPath)
            var userHistory = currencyHistory.filter(history => history.userId === user.id)
            userHistory = userHistory.splice(0, 10)
            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('Currency History for ' + user.username)
                .setDescription(userHistory.map(history => `Date: **${history.date}**\nPrice: **${history.amount}**  \nItem type: **${history.type}**\n\n`).join("\n"))
            await interaction.reply({ embeds: [embed], ephemeral: true });

        }
        //#endregion

        //#region --LEVEL XP--

        if (interaction.commandName === "leaderboard") {
            const day = interaction.options.getString("day")
            const type = interaction.options.getString("type")

            await leaderBoard(interaction, day, type)
        }
        if (interaction.commandName === "add-xp") {
            const user = interaction.options.getUser("user")
            const xpAmount = interaction.options.getInteger("xp-amount")
            let connection = null;
            try {
                connection = await pool.getConnection();
                const [userProfile] = await connection.query(`
                    SELECT * FROM user_profiles
                    WHERE id = ?`, [user.id]
                );

                // XP ekle
                await addXp(interaction, user, xpAmount, userProfile);

            } catch (error) {
                console.error('Error retrieving user profile:', error);
                await interaction.reply({
                    content: 'An error occurred while retrieving user profile.',
                    ephemeral: true
                });
            } finally {
                if (connection) {
                    // Bağlantıyı havuza geri bırak
                    connection.release();
                }
            }
        }
        if (interaction.commandName === "add-level-role") {
            const role = await interaction.options.getRole("role");
            const level = await interaction.options.getInteger("level");

            let connection = null;
            try {
                connection = await pool.getConnection();

                const [profiles] = await connection.query(`
                SELECT id FROM user_profiles
                WHERE level >= ?`, [level]
                );

                const guild = await client.guilds.fetch(process.env.GUILD_ID)
                await guild.members.fetch()

                for (const profile of profiles) {
                    const member = guild.members.cache.get(profile.id)
                    if (member) {
                        await member.roles.add(role)
                    }
                }
                const level_role = await readFileFunc(level_rolesPath);
                level_role.push({ level: level, role: role.id })
                await writeFileFunc(level_rolesPath, level_role)
                const embed = new EmbedBuilder()
                    .setDescription("**Role is succesfully set**")
                    .setColor("Green")
                await interaction.reply({ embeds: [embed], ephemeral: true })

            } catch (error) {
                console.error('Error retrieving user profiles:', error);
                await interaction.reply({
                    content: 'An error occurred while retrieving user profiles.',
                    ephemeral: true
                });
            } finally {
                if (connection) {
                    // Bağlantıyı havuza geri bırak
                    connection.release();
                }
            }
        }
        if (interaction.commandName === "remove-level-role") {
            const level = await interaction.options.getInteger("level");
            var level_roles = await readFileFunc(level_rolesPath)
            level_roles = level_roles.filter(element => element.level !== level)
            await writeFileFunc(level_rolesPath, level_roles)

            const embed = new EmbedBuilder()
                .setDescription("Level role is deleted")
                .setColor("Green")

            await interaction.reply({ embeds: [embed], ephemeral: true })

        }
        //#endregion

        //#region -- SUBS --

        if (interaction.commandName === 'create-subs') {
            const name = interaction.options.getString('name');
            const id = interaction.options.getInteger('level');
            const role = interaction.options.getRole('role');

            await createSubs(interaction, name, id, role);
        }

        if (interaction.commandName === 'delete-subs') {
            const subs = interaction.options.getString('subs');

            await deleteSubs(interaction, subs);
        }

        if (interaction.commandName === 'subs-list') {
            const subsList = subsArray.map(subs => subs.id);

            const embed = new EmbedBuilder()
                .setColor('Gold')
                .setTitle('Subscriptions')
                .setDescription(subsList.join('\n'))
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }

        if (interaction.commandName === 'subs-info') {
            const subsData = interaction.options.getString('subs');
            const index = subsArray.findIndex(subs => subs.id === subsData);

            if (index !== -1) {
                const subsInfo = subsArray[index];

                let description = `Name: ${subsInfo.name}\nLevel: ${subsInfo.level}\nRole: ${subsInfo.roleId}`;

                for (let i = 0; i < subsInfo.users.length; i++) {
                    const user = await client.users.fetch(subsInfo.users[i]);
                    description += `\n${i + 1}. ${user.username}`;
                }

                const embed = new EmbedBuilder()
                    .setColor('Gold')
                    .setTitle('Subscription Info')
                    .setDescription(description)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            }
        }

        if (interaction.commandName === 'change-subs-name') {
            const subs = interaction.options.getString('subs');
            const name = interaction.options.getString('name');

            await changeSubsName(interaction, subs, name);
        }

        if (interaction.commandName === 'change-subs-level') {
            const subs = interaction.options.getString('subs');
            const id = interaction.options.getInteger('id');

            await changeSubsId(interaction, subs, id);
        }

        if (interaction.commandName === 'change-subs-role') {
            const subs = interaction.options.getString('subs');
            const role = interaction.options.getRole('role');

            await changeSubsRole(interaction, subs, role);
        }

        if (interaction.commandName === 'add-subs-user') {
            const subs = interaction.options.getString('subs');
            const user = interaction.options.getUser('user');

            await addSubsUser(interaction, subs, user);
        }

        if (interaction.commandName === 'remove-subs-user') {
            const subs = interaction.options.getString('subs');
            const user = interaction.options.getUser('user');

            await removeSubsUser(interaction, subs, user);
        }

        if (interaction.commandName === "change-sub-entry") {
            const sub = interaction.options.getString('sub');
            const entryNumber = interaction.options.getInteger("entry");

            await changeEntry(interaction, sub, entryNumber)

        }
        //#endregion

        //#region -- PROFILE --

        if (interaction.commandName === 'profile') {
            const user = interaction.options.getUser('user');

            const URLButton = new ButtonBuilder()
                .setStyle('Link')
                .setLabel('Profile')
                .setURL(`https://nexusvault.net/profile/${user.id}`)

            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle(`${user.username}'s Profile`)
                .setDescription(`[Click here to view the profile](https://nexusvault.net/profile/${user.id})`)

            // await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(URLButton)], ephemeral: true });
            await interaction.reply({ embeds: [embed], ephemeral: true });

            return

            await showProfile(interaction, user);
        }

        if (interaction.commandName === 'my-profile') {
            const user = interaction.user;

            const URLButton = new ButtonBuilder()
                .setStyle('Link')
                .setLabel('Profile')
                .setURL(`https://nexusvault.net/profile/${user.id}`)

            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setDescription(`[Click here to view the profile](https://nexusvault.net/profile/${user.id})`)


            // await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(URLButton)], ephemeral: true });
            await interaction.reply({ embeds: [embed], ephemeral: true });

            return

            await showProfile(interaction, user);
        }

        if (interaction.commandName === "set-progress-bar-color") {

            const colorNameInput = interaction.options.getString('color').toLowerCase();
            const rgb = colorName[colorNameInput];

            const profile = await findSQL(interaction.user.id)

            await ChangeProgressBarColor(interaction, colorNameInput, profile, rgb);
        }



        if (interaction.commandName === "set-profile-background") {
            const colorNameInput = interaction.options.getString('color').toLowerCase();
            const profile = await findSQL(interaction.user.id)
            const rgb = colorName[colorNameInput];

            await ChangeBackgroundColor(interaction, colorNameInput, profile, rgb);
        }

        if (interaction.commandName === "private-profile") {
            const publicOption = false
            const profile = await findSQL(interaction.user.id)
            await PublicProfile(interaction, publicOption, profile);
        }

        if (interaction.commandName === "unprivate-profile") {
            const publicOption = true
            const profile = await findSQL(interaction.user.id)
            await PublicProfile(interaction, publicOption, profile);

        }
        if (interaction.commandName === "quip") {
            const quip = interaction.options.getString("quip")
            const profile = await findSQL(interaction.user.id)
            await ChangeQuip(interaction, quip, profile)

        }

        //#endregion

        //#region -- SET CONFIG --

        if (interaction.commandName === 'set-config') {
            const variableName = interaction.options.getString('variable-name');
            const variableValue = interaction.options.getString('variable-value');

            await newValues(variableName, variableValue);
            const successEmbed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`**${valueName}** updated successfully.`);
            await interaction.reply({ embeds: [successEmbed] });
        }


        if (interaction.commandName === 'set-stripe') {
            const variableName = interaction.options.getString('variable-name');
            const variableValue = interaction.options.getString('variable-value');

            const envFilePath = '.env';
            const updates = {
                [variableName]: variableValue,
            };

            stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

            updateEnvFile(envFilePath, updates);
            const successEmbed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`**${variableName}** updated successfully.`);

            await interaction.reply({ embeds: [successEmbed], ephemeral: true });
        }


        //#endregion

        //#region --BLACKLİST--

        if (interaction.commandName === "blacklist") {
            const blacklist = await readFileFunc(blacklistPath)
            var blacklistedWords = 'Here are the blacklisted words:\n\n'
            const embed = new EmbedBuilder()
                .setColor("DarkGrey")
                .setTitle('Blacklisted Words')
            blacklist.forEach((word, index) => {
                blacklistedWords += `${index + 1}. **${word}**\n`
            })
            embed.setDescription(blacklistedWords)
            if (interaction != null) {
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                //web response
            }
        }
        if (interaction.commandName === "add-blacklist") {
            const word = interaction.options.getString("word")
            await AddBlacklist(interaction, word)

        }
        if (interaction.commandName === "remove-blacklist") {
            const word = interaction.options.getString("word")
            await RemoveBlacklist(interaction, word)
        }
        //#endregion

        //#region --ACHİVEMENT--

        if (interaction.commandName === "view-achievement") {
            const user = interaction.options.getUser("user")
            await ShowAchievement(interaction, user)
        }
        if (interaction.commandName === "achievement") {
            const user = interaction.user
            await ShowAchievement(interaction, user)
        }
        if (interaction.commandName === "achievement-list") {
            await AchievementList(interaction)
        }
        if (interaction.commandName === "private-achievement") {
            const publicOption = false
            const profile = await controlAndCreateProfile(interaction.user)
            await PublicAchievement(interaction, publicOption, profile);
        }
        if (interaction.commandName === "unprivate-achievement") {
            const publicOption = true
            const profile = await controlAndCreateProfile(interaction.user)

            await PublicAchievement(interaction, publicOption, profile);
        }
        if (interaction.commandName === "achievement-info") {
            const achievement = interaction.options.getString("achievement")
            await AchievementInfo(interaction, achievement)

        }

        //#endregion

        //#region --CUSTOM EMOTES--

        if (interaction.commandName === 'add-emote') {

            const emoteFile = interaction.options.getAttachment('file');
            const emoteName = interaction.options.getString('name');

            await addEmote(interaction, emoteFile, emoteName, interaction.user);
        }

        if (interaction.commandName === 'delete-emote') {
            const emoteId = interaction.options.getString('name');

            await deleteEmote(interaction, emoteId);
        }

        //#endregion
    }

    if (interaction.isAutocomplete()) {

        //#region --LEVEL AUTO--
        if (interaction.commandName === "remove-level-role") {
            const level_roles = await readFileFunc(level_rolesPath)
            const focusedValue = interaction.options.getFocused().toLowerCase()
            const filtered = level_roles.filter(item => item.level.toString().startsWith(focusedValue))
            await interaction.respond(filtered.map(element => ({ name: `${element.level}`, value: element.level }))
            )

        }

        //#endregion

        //#region --REPEATING MESSAGES AUTO--

        if (interaction.commandName === 'delete-repeating-message' ||
            interaction.commandName === 'repeating-message-info' ||
            interaction.commandName === 'change-repeating-message' ||
            interaction.commandName === 'change-repeating-message-time' ||
            interaction.commandName === 'change-repeating-message-channel') {

            const repeatingMessagesData = await readFileFunc(repeatingMessagesPath);

            const focusedValue = interaction.options.getFocused().toLowerCase();

            const filtered = repeatingMessagesData.filter(repeatingMessage =>
                repeatingMessage.message.toLowerCase().includes(focusedValue)
            ).map(repeatingMessage => {

                return {
                    name: ` Owner: ${repeatingMessage.ownerUsername} - Message: ${repeatingMessage.message}- Interval: ${repeatingMessage.day} days ${repeatingMessage.hour} hour ${repeatingMessage.minute} minute`,
                    value: `${repeatingMessage.messageId}`
                };
            }).slice(0, 25);

            await interaction.respond(filtered.map(repeatingMessage => ({
                name: repeatingMessage.name,
                value: repeatingMessage.value
            })));
        }

        //#endregion

        //#region --CONFIG AUTO-

        if (interaction.commandName === 'set-config') {
            const configData = await readFileFunc(configPath);

            const variableNames = Object.keys(configData);

            const focusedValue = interaction.options.getFocused().toLowerCase();

            const filteredVariableNames = variableNames.filter(variable =>
                variable.toLowerCase().includes(focusedValue)
            ).map(variable => {
                return {
                    name: variable,
                    value: configData[variable].toString()
                };
            }).slice(0, 25);

            await interaction.respond(filteredVariableNames.map(variable => ({
                name: variable.name,
                value: variable.name
            })));
        }
        //#endregion

        //#region --SUBS AUTOC--
        if (
            interaction.commandName === 'delete-subs' ||
            interaction.commandName === 'subs-info' ||
            interaction.commandName === 'change-subs-name' ||
            interaction.commandName === 'change-subs-level' ||
            interaction.commandName === 'change-subs-role' ||
            interaction.commandName === 'add-subs-user' ||
            interaction.commandName === 'remove-subs-user' ||
            interaction.commandName === "change-sub-entry"
        ) {

            const subsData = await readFileFunc(subsPath);

            const focusedValue = interaction.options.getFocused().toLowerCase();

            const filtered = subsData.filter(subs =>
                subs.name.toLowerCase().includes(focusedValue)
            ).map(subs => {

                return {
                    name: `Name: ${subs.name}- ID: ${subs.id}`,
                    value: `${subs.id}`
                };
            }).slice(0, 25);

            await interaction.respond(filtered.map(subs => ({
                name: subs.name,
                value: subs.value
            })));
        }
        //#endregion

        //#region --GIVEAWAYS AUTO--

        if (
            interaction.commandName === 'add-winner-user' ||
            interaction.commandName === 'remove-winner-user' ||
            interaction.commandName === 'giveaways-info' ||
            interaction.commandName === 'giveaways-delete' ||
            interaction.commandName === 'change-giveaways-name' ||
            interaction.commandName === 'change-giveaways-description' ||
            interaction.commandName === 'change-giveaways-date' ||
            interaction.commandName === 'change-giveaways-winneramount' ||
            interaction.commandName === 'change-giveaways-channel'
        ) {


            const giveaways = await readFileFunc(giveawayPath);

            const focusedValue = interaction.options.getFocused().toLowerCase();

            const filteredGiveaways = giveaways.filter(giveaway =>
                giveaway.name.toLowerCase().includes(focusedValue)
            ).map(giveaway => {
                const giveawayDate = new Date(giveaway.date);
                const formattedDate = giveawayDate.toISOString().replace('T', ' | ').substring(0, 18);

                return {
                    name: `Name: ${giveaway.name} --- Date: ${formattedDate}`,
                    value: giveaway.messageId
                };
            }).slice(0, 25);

            await interaction.respond(filteredGiveaways.map(giveaway => ({
                name: giveaway.name,
                value: giveaway.value
            })));
        }
        //#endregion

        //#region --CURRRENCY AUTO--

        if (interaction.commandName === "remove-item" || interaction.commandName === "change-item-price" || interaction.commandName === "change-item-name" || interaction.commandName === "change-item-description") {
            const shopData = await readFileFunc(shopPath)
            const focusedValue = interaction.options.getFocused().toLowerCase()
            const filtered = shopData.filter(item => item.name.toLowerCase().includes(focusedValue))
            await interaction.respond(filtered.map(item => ({ name: item.name, value: item.id }))
            )
        }
        if (interaction.commandName === "buy") {
            const shopData = await readFileFunc(shopPath)
            const focusedValue = interaction.options.getFocused().toLowerCase()
            const filtered = shopData.filter(item => item.name.toLowerCase().includes(focusedValue))
            await interaction.respond(filtered.map(item => ({ name: `Name: ${item.name}, Value: ${item.price}`, value: item.id }))
            )
        }
        //#endregion

        //#region --BLACKLİST AUTO--

        if (interaction.commandName === 'remove-blacklist') {
            const blacklist = await readFileFunc(blacklistPath)
            const focusedValue = interaction.options.getFocused().toLowerCase()
            const filtered = blacklist.filter(word => word.toLowerCase().includes(focusedValue))
            await interaction.respond(filtered.map(word => ({ name: word, value: word }))
            )
        }

        //#endregion

        //#region --CUSTOM EMOTES AUTO--

        async function getEmotesFromDatabase(focusedValue) {
            let connection = null;
            try {
                connection = await pool.getConnection();

                // Emote bilgilerini veritabanından çek
                const [rows] = await connection.query(`
                    SELECT name, owner, id, createdDate
                    FROM user_profiles
                    CROSS JOIN JSON_TABLE(
                        user_profiles.customEmotes,
                        '$[*]' COLUMNS (
                            name VARCHAR(255) PATH '$.name',
                            owner VARCHAR(255) PATH '$.owner',
                            id VARCHAR(255) PATH '$.id',
                            createdDate VARCHAR(255) PATH '$.createdDate'
                        )
                    ) AS emotes
                `);

                // Filtreleme işlemini yap
                const filteredEmotes = rows
                    .filter(emote => emote.name.toLowerCase().includes(focusedValue.toLowerCase()))
                    .map(emote => {
                        const formattedCreatedDate = emote.createdDate.substring(0, 10);

                        return {
                            name: emote.name,
                            owner: emote.owner,
                            id: emote.id,
                            createdDate: formattedCreatedDate
                        };
                    });

                return filteredEmotes;
            } catch (error) {
                console.error('Error fetching emotes:', error);
                throw new Error('Error fetching emotes');
            } finally {
                if (connection) {
                    // Bağlantıyı havuza geri bırak
                    connection.release();
                }
            }
        }

        if (interaction.commandName === 'delete-emote') {
            const focusedValue = interaction.options.getFocused().toLowerCase();

            const emotes = await getEmotesFromDatabase(focusedValue);

            const formattedEmotes = emotes.map(emote => {
                const owner = client.users.cache.get(emote.owner);
                const formattedCreatedDate = emote.createdDate.substring(0, 10);

                return {
                    name: `Name: ${emote.name} __ Owner: @${owner ? owner.username : 'Unknown'} __ Created Date: ${formattedCreatedDate}`,
                    value: emote.id
                };
            }).slice(0, 25);

            await interaction.respond(formattedEmotes.map(emote => ({
                name: emote.name,
                value: emote.value
            })));
        }

        //#endregion

        //#region --ACHİVEMENT AUTO--
        if (interaction.commandName === "achievement-info") {
            const achievements = await readFileFunc(achievementPath)
            const keys = Object.keys(achievements)
            const focusedValue = interaction.options.getFocused().toLowerCase()
            const filtered = keys.filter(achievement => achievement.toLowerCase().includes(focusedValue))
            await interaction.respond(filtered.map(achievement => ({ name: achievement.replace("_", " "), value: achievement }))
            )

        }

        //#endregion
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('myModal_')) {

        const itemId = interaction.customId.split('_')[1];
        const codes = interaction.fields.getTextInputValue('codes');
        const codeArray = codes.split("##")
            .map(code => code.trim()) // Trim each individual code
            .filter(code => code.length > 0); // Remove any empty codes
        const shopData = await readFileFunc(shopPath)
        const item = shopData.find(item => item.id === itemId)
        if (item) {
            item.codes = codeArray
        }

        fs.writeFileSync(shopPath, JSON.stringify(shopData, null, 2))
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`**${item.name}** has been added to the shop.`)


        // Paragraph means multiple lines of text.

        if (interaction != null) {
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

    }
});

client.on("GuildMemberUpdate", async (oldMember, newMember) => {

    var profile = await controlAndCreateProfile(newMember.user)

    if (!oldMember.premiumSince && newMember.premiumSince) {
        addTodayXp(profile, config.messageExp * 7)
        const boostValue = profile?.boost || 1;
        profile.boost = boostValue + 4;
        profile.boostEndDate = new Date().getDate() + 2
    }

    // Check if the member stopped boosting
    if (oldMember.premiumSince && !newMember.premiumSince) {
        const boostValue = profile?.boost || 1;
        profile.boost = boostValue - 4;
        if (profile.boost < 1) {
            profile.boost = 1;
        }
    }

    await updateProfile(profile);

});

//#region -- LEVEL XP --

const spamMap = new Map();
const spamThreshold = 8; // Number of messages considered as spam
const timeInterval = 4000; // Time interval in milliseconds (5 seconds)
const muteDuration = 5000; // Mute duration in milliseconds (5 seconds)

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    var profile = await controlAndCreateProfile(message.author)
    const boostValue = profile?.boost || 1;

    const user = message.author
    const guild = message.guild
    // checking if the message is blacklisted
    const blacklist = await readFileFunc(blacklistPath)
    const found = blacklist.find(word => message.content.toLowerCase().includes(word.toLowerCase()))
    if (found) {
        message.delete()
        message.channel.send(`**${userMention(message.author.id)}**, you are not allowed to use that word.`)

        profile.totalXp -= config.messageExp * 4;
        profile.xp -= config.messageExp * 4;

        profile.monthlyXp[0] -= config.messageExp * 4;

        if (profile.totalXp < 0) {
            profile.totalXp = 0
        }
        if (profile.xp < 0) {
            profile.xp = 0
        }
        if (profile.monthlyXp[0] < 0) {
            profile.monthlyXp[0] = 0
        }
        await updateProfile(profile);
    }

    // checking if the message is spam

    const userId = user.id;
    const currentTime = Date.now();

    if (!spamMap.has(userId)) {
        spamMap.set(userId, []);
    }

    const messageTimestamps = spamMap.get(userId);
    messageTimestamps.push(currentTime);

    // Remove old timestamps outside the time interval
    while (messageTimestamps.length > 0 && messageTimestamps[0] <= currentTime - timeInterval) {
        messageTimestamps.shift();
    }

    // Check if the user is spamming

    if (messageTimestamps.length >= 1) {
        //here is the message combo part

        if (messageTimestamps.length >= spamThreshold) {

            addTodayXp(profile, config.messageExp * -2)
            if (profile.xp < 0) {
                profile.xp = 0
            }
            if (profile.totalXp < 0) {
                profile.totalXp = 0
            }
            if (profile.monthlyXp[0] < 0) {
                profile.monthlyXp[0] = 0
            }

            // Find or create the mute role
            let muteRole = guild.roles.cache.find(role => role.name === 'Muted');
            if (!muteRole) {
                muteRole = await guild.roles.create({
                    name: 'Muted',
                    permissions: []
                });

                // Update channel overwrites for the mute role
                guild.channels.cache.forEach(channel => {
                    channel.permissionOverwrites.create(muteRole, {
                        SendMessages: false,
                        Speak: false,
                        AddReactions: false
                    });
                });
            }

            // Add the mute role to the user
            const member = await guild.members.fetch(userId);
            await member.roles.add(muteRole);

            // Unmute the user after the mute duration
            setTimeout(async () => {
                await member.roles.remove(muteRole);
            }, muteDuration);

            // Clear the user's message timestamps to reset the spam check
            spamMap.delete(userId);
        }
    }



    // checking the message content to give xp
    if (message.attachments.size > 0) {
        const images = message.attachments.filter(attachment => attachment.contentType && attachment.contentType.startsWith('image/'));
        const videos = message.attachments.filter(attachment => attachment.contentType && attachment.contentType.startsWith('video/'));
        const emojis = message.content.match(/<a?:\w+:\d+>/g) || [];

        if (emojis.length > 0) {
            addTodayXp(profile, config.emoteExp * boostValue)
            profile.monthlyEmoteMessageAmount[0] += 1
            profile.totalEmoteMessageAmount += 1

            let controlLevelUp = true
            while (controlLevelUp) {
                controlLevelUp = false
                if (profile.xp >= profile.requiredXp) {
                    await LevelUp(profile)
                    if (profile.level !== 50) {
                        controlLevelUp = true
                    }

                }
            }
            await updateProfile(profile);


        }
        if (images.size > 0) {

            addTodayXp(profile, config.photoExp * boostValue)
            profile.monthlyImageMessageAmount[0] += 1
            profile.totalImageMessageAmount += 1

            let controlLevelUp = true
            while (controlLevelUp) {
                controlLevelUp = false
                if (profile.xp >= profile.requiredXp) {
                    await LevelUp(profile)
                    if (profile.level !== 50) {
                        controlLevelUp = true
                    }
                }
            }

            await updateProfile(profile);

        }

        if (videos.size > 0) {
            addTodayXp(profile, config.videosExp * boostValue)
            profile.monthlyVideoMessageAmount[0] += 1
            profile.totalVideoMessageAmount += 1

            let controlLevelUp = true
            while (controlLevelUp) {
                controlLevelUp = false
                if (profile.xp >= profile.requiredXp) {
                    await LevelUp(profile)
                    if (profile.level !== 50) {
                        controlLevelUp = true
                    }
                }
            }
            await updateProfile(profile);


        }
    }
    else {

        addTodayXp(profile, config.messageExp * boostValue)
        profile.monthlyTextMessageAmount[0] += 1
        profile.totalTextMessageAmount += 1

        let controlLevelUp = true
        while (controlLevelUp) {
            controlLevelUp = false
            if (profile.xp >= profile.requiredXp) {
                await LevelUp(profile)
                if (profile.level !== 50) {
                    controlLevelUp = true
                }
            }
        }
        await CheckAchievements(profile, profile.totalTextMessageAmount, "messages")

        await updateProfile(profile);

    }

})

client.on('guildScheduledEventUpdate', async (oldEvent, newEvent) => {


    if (newEvent.status == '2') {
        eventChannelId = newEvent.channelId;
        // startXpGain(newEvent.channel, config.eventExp, config.callXpWaitDurationMin);
    }

    if (newEvent.status == '3') {
        eventChannelId = null;
    }

})

client.on("guildMemberRemove", async member => {
    try {
        const memberToDel = await findSQL(member.id)
        if (memberToDel) {
            let connection = null;
            try {
                connection = await pool.getConnection();
                await connection.query(`
                    DELETE FROM user_profiles WHERE id = ?
                `, [member.id]);

            } catch (error) {
                console.error('Error deleting member from database:', error);
                throw error;
            } finally {
                if (connection) {
                    // Bağlantıyı havuza geri bırak
                    connection.release();
                }
            }
        }
    } catch (error) {
        console.error("An error occurred in guildMemberRemove event:", error);
    }
})

client.on('voiceStateUpdate', async (oldState, newState) => {

    const userDC = newState.member.user
    const profile = await controlAndCreateProfile(userDC)

    // Check if user joins a channel or if there's a change in the number of users in the channel
    if (newState.channel && (newState.channel.members.size > 1)) {
        if (newState.channelId === eventChannelId) {
            startXpGain(newState.channel, config.eventExp, config.callXpWaitDurationMin, true);
        } else {
            startXpGain(newState.channel, config.callExp, config.callXpWaitDurationMin, false);
        }
    }

    // Check if user leaves a channel or if there's a change in the number of users in the channel
    if (oldState.channel && (oldState.channel.members.size < 2)) {
        stopXpGain(oldState.channel);
    }

});

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;

    var profile = await controlAndCreateProfile(user)
    const boostValue = profile?.boost || 1;

    if (profile.canEarnFromAdReaction) {
        addTodayXp(profile, config.addReactionExp * boostValue)
        profile.monthlyAddReaction[0] += 1
        profile.totalAddReaction += 1

        let controlLevelUp = true
        while (controlLevelUp) {
            controlLevelUp = false
            if (profile.xp >= profile.requiredXp) {
                await LevelUp(profile)
                if (profile.level !== 50) {
                    controlLevelUp = true
                }
            }
        }
        await CheckAchievements(profile, profile.totalAddReaction, "reactions")
        await updateProfile(profile);
    }

})


//#endregion

//#region -- GIVEAWAYS --

client.on('messageReactionAdd', async (reaction, user) => {

    if (user.bot) return;
    if (reaction.emoji.name !== '✅') return;

    const giveaways = await readFileFunc(giveawayPath);


    let giveaway = giveaways.find(r => r.messageId === reaction.message.id);


    if (!giveaway) return;

    const guild = reaction.message.guild; // Sunucuyu al

    // let control;

    // for (let index = 0; index < giveaway.roleId.length; index++) {
    //     const element = giveaway.roleId[index];

    //     if (element && !guild.members.cache.get(user.id).roles.cache.has(giveaway.roleId[index])) {

    //     } else {
    //         control = true
    //     }
    // }

    if (guild.members.cache.get(user.id).roles.cache.has(giveaway.roleId[0])) {
        const profile = await controlAndCreateProfile(user)
        if (giveaway.minLevel <= profile.level) {



            // kullanıcıyı costPayed diye bir değişkene ekle ve giveawaysa kaydet çıkınca da buradan kontrol et

            try {
                const dmChannel = await user.createDM();
                const profile = await controlAndCreateProfile(user)

                if (profile.balance - parseInt(giveaway.cost) < 0) {
                    const rejectEmbed = new EmbedBuilder()
                        .setTitle(`${giveaway.name}`)
                        .setDescription(`Sorry you dont have enough coins for this giveaway! 🚫`)
                        .setColor('Red');
                    await dmChannel.send({ embeds: [rejectEmbed] });
                    return;
                }


                profile.balance -= parseInt(giveaway.cost)
                giveaway.costPayed.push({ id: user.id, amount: 1 })

                fs.writeFileSync(giveawayPath, JSON.stringify(giveaways, null, 2));

                await updateProfile(profile);

                const embed = new EmbedBuilder()
                    .setTitle(`${giveaway.name}`)
                    .setDescription(`Congratulations, You're in the giveaway! 🎉`)
                    .setColor('Green');

                await dmChannel.send({ embeds: [embed] });
            } catch (error) {
                console.error(`Could not send DM to ${user.tag}:`, error);
            }
        } else {
            try {
                const dmChannel = await user.createDM();

                const embed = new EmbedBuilder()
                    .setTitle(`${giveaway.name}`)
                    .setDescription(`Your level is insufficient for this giveaway. 🚫`)
                    .setColor('Red');

                await dmChannel.send({ embeds: [embed] });
            } catch (error) {
                console.error(`Could not send DM to ${user.tag}:`, error);
            }
        }
    } else {
        try {
            const dmChannel = await user.createDM();

            const embed = new EmbedBuilder()
                .setTitle(`${giveaway.name}`)
                .setDescription(`Your role rank is insufficient for this giveaway. 🚫`)
                .setColor('Red');

            await dmChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error(`Could not send DM to ${user.tag}:`, error);
        }
    }

});

client.on('messageReactionRemove', async (reaction, user) => {

    if (user.bot) return;
    if (reaction.emoji.name !== '✅') return;

    const giveaways = await readFileFunc(giveawayPath);

    let giveaway = giveaways.find(r => r.messageId === reaction.message.id);
    if (!giveaway) return;

    const guild = reaction.message.guild; // Sunucuyu al

    let control

    for (let index = 0; index < giveaway.roleId.length; index++) {
        const element = giveaway.roleId[index];

        if (element && !guild.members.cache.get(user.id).roles.cache.has(element)) {

        } else {
            control = true
        }
    }

    if (control) {
        try {
            const dmChannel = await user.createDM();
            const profile = await controlAndCreateProfile(user)

            if (giveaway.costPayed.find(temp => temp.id === user.id)) {
                profile.balance += parseInt(giveaway.cost)
                giveaway.costPayed.filter(temp => temp.id !== user.id)

                fs.writeFileSync(giveawayPath, JSON.stringify(giveaways, null, 2));
                await updateProfile(profile);

                const embed = new EmbedBuilder()
                    .setDescription(`You're no longer in the giveaway!`)
                    .setColor('Red')

                await dmChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error(`Could not send DM to ${user.tag}:`, error);
        }
    }
});

//#endregion

//#endregion

//#region -----| DISCORD FUNCTIONS |-----

//#region --CUSTOM EMOTE FUNCTIONS--

async function addEmote(interaction, emoteFile, emoteName, user) {
    const customers = await readFileFunc(usersPath)
    const customer = customers.find(customer => customer.discordId === user.id)
    if (customer.subscriptionStatus === "inactive") {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription('You need to have an active subscription to use this command.')
        if (interaction !== null) {
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }

    if (emoteName.length === 1) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription('The emote name must be at least 2 characters long.')
        if (interaction !== null) {
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }

    var profile;
    if (interaction !== null) {
        profile = await controlAndCreateProfile(interaction.user)
    } else {
        profile = await controlAndCreateProfile(user)
    }
    if (!emoteFile) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription('Please provide either a URL or a file, but not both or neither.')

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }


    try {
        let emoteAttachment;
        const validFormats = ['image/png', 'image/jpeg', 'image/gif'];
        if (!validFormats.includes(emoteFile.contentType)) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('The file must be a PNG, JPEG, or GIF.')
            if (interaction !== null) {
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
        if (emoteFile.size > 256 * 1024) { // 256 KB size limit
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('The file size must be less than 256 KB.')
            if (interaction !== null) {
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
        if (interaction !== null) {
            emoteAttachment = emoteFile.url;

        } else {
            emoteAttachment = emoteFile;
        }

        // Add the emote to the server
        const guild = await client.guilds.fetch(guildId)
        const emoji = await guild.emojis.create({
            attachment: emoteAttachment,
            name: emoteName,
        });
        var newEmote = new Emote(emoteName, emoji.id, 7);
        profile.customEmotes.push(newEmote);
        if (profile.customEmotes.length > profile.maxCustomEmotes) {
            const emojiToDeleteId = profile.customEmotes[0].id;

            try {
                const emoji = await guild.emojis.fetch(emojiToDeleteId);
                await emoji.delete();
            } catch (error) {
                console.error(`Failed to delete the emoji. Error: ${error.message}`);
            }
            profile.customEmotes.shift();
        }
        await updateProfile(profile);

        if (interaction !== null) {
            const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`Emote ${emoji} added successfully!`)

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

    } catch (error) {
        console.error(error);
        if (interaction !== null) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('Failed to add the emote. Please ensure the URL or file is correct and valid.')
            interaction.reply({ embeds: [embed], ephemeral: true });
        }

    }
}
async function deleteEmote(interaction, emoteId, user) {
    const profile = await controlAndCreateProfile(user);
    if (!profile) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(`Profile with emote ${emoteId} not found.`);

        if (interaction !== null) {
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        return;
    }

    const guild = await client.guilds.fetch(guildId);
    const emoji = guild.emojis.cache.find(emoji => emoji.id === emoteId);



    if (!emoji) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(`Emote ${emoteId} not found.`);

        if (interaction !== null) {
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        return;
    }

    await emoji.delete();
    let connection = null;
    try {
        connection = await pool.getConnection();

        await connection.query(`
            UPDATE user_profiles
            SET customEmotes = JSON_REMOVE(customEmotes, JSON_UNQUOTE(JSON_SEARCH(customEmotes, 'one', ?)))
            WHERE JSON_CONTAINS(customEmotes, JSON_OBJECT('id', ?), '$')
        `, [emoteId, emoteId]);

    } catch (error) {
        console.error('Error deleting emote from database:', error);
        throw error;
    } finally {
        if (connection) {
            // Bağlantıyı havuza geri bırak
            connection.release();
        }
    }

    const embed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(`Emote ${emoji} removed successfully!`);

    if (interaction !== null) {
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
}


async function editEmote(interaction, emoteId, emoteName, emoteCreatedDate, emoteDate, user) {
    const profile = await controlAndCreateProfile(user);
    if (!profile) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(`Profile with emote ${emoteId} not found.`);
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const guild = await client.guilds.fetch(guildId);
    const emoji = guild.emojis.cache.find(emoji => emoji.id === emoteId);

    if (!emoji) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(`Emote ${emoteId} not found.`);
        if (interaction != null) {
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        return
    }
    let connection = null;
    try {
        connection = await pool.getConnection();
        await emoji.setName(emoteName || emoji.name);

        try {
            await connection.query(`
                UPDATE user_profiles
                SET customEmotes = JSON_SET(customEmotes, 
                    CONCAT('$[', JSON_UNQUOTE(JSON_SEARCH(customEmotes, 'one', ?)), ']'),
                    JSON_OBJECT('id', ?, 'name', ?, 'createdDate', ?, 'Date', ?))
                WHERE JSON_CONTAINS(customEmotes, JSON_OBJECT('id', ?), '$')
            `, [emoteId, emoteId, emoteName || profile.customEmotes.find(emote => emote.id === emoteId).name, emoteCreatedDate || profile.customEmotes.find(emote => emote.id === emoteId).createdDate, emoteDate || profile.customEmotes.find(emote => emote.id === emoteId).Date, emoteId]);

        } catch (error) {
            console.error('Error updating emote in database:', error);
            throw error;
        } finally {
            if (connection) {
                // Bağlantıyı havuza geri bırak
                connection.release();
            }
        }

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`Emote ${emoteId} updated successfully!`);
        return interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
        console.error('Error updating emote on Discord:', error);
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription('Failed to update emote.');
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
}
class Emote {
    constructor(name, id, day) {
        this.name = name;
        this.id = id;
        this.createdDate = new Date();
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + day);
        this.Date = currentDate;
    }
}

//#endregion

//#region  --ACHIEVEMENTS--

async function ShowAchievement(interaction, user) {

    var profile = await controlAndCreateProfile(user)
    var member = await interaction.guild.members.fetch(user.id)
    var isUserAdmin;
    try {
        isUserAdmin = member.permissions.has('ADMINISTRATOR');
    } catch (error) {
        isUserAdmin = false;
    }
    if ((interaction.id !== user.id && !profile.publicAchievements) && isUserAdmin === false) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription("This user's achievements are private, sorry!")
        await interaction.reply({ embeds: [embed] });
        return;
    }

    const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle(`Curious about ${user.username}'s achievements ?`)
        .setDescription(`take a look!\nHere are the achievements of ${user.username}`)
    const joinedAt = member.joinedAt;
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - joinedAt);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    profile.achievements.forEach(achievement => {
        let valueString = achievement.tier.replace("_", " ")
        let achType = achievement.type.replace("_", " ")
        switch (achType) {
            case "messages":
                embed.addFields({ name: `**${achType}**`, value: `Tier: ${valueString} | ${achievement.subtier}\n${profile.totalTextMessageAmount} Messages sent` })
                break;
            case "events":
                embed.addFields({ name: `**${achType}**`, value: `Tier: ${valueString} | ${achievement.subtier}\n${profile.totalEventAmount} Events participated` })
                break;
            case "giveaways":
                embed.addFields({ name: `**${achType}**`, value: `Tier: ${valueString} | ${achievement.subtier}\n${profile.totalGiveawayAmount} Giveaways entered` })
                break;
            case "pictures":
                embed.addFields({ name: `**${achType}**`, value: `Tier: ${valueString} | ${achievement.subtier}\n${profile.totalImageMessageAmount} Pictures sent` })
                break;
            case "reactions":
                embed.addFields({ name: `**${achType}**`, value: `Tier: ${valueString} | ${achievement.subtier}\n${profile.totalAddReaction} Reactions added` })
                break;
            case "voice chat":
                embed.addFields({ name: `**${achType}**`, value: `Tier: ${valueString} | ${achievement.subtier}\n${profile.totalVoiceChatAmount} Voice chat minutes` })
                break;
            case "activities":
                embed.addFields({ name: `**$achType}**`, value: `Tier: ${valueString} | ${achievement.subtier}\n${profile.totalActivityAmount} Activities participated` })
                break;
            case "server age":
                embed.addFields({ name: `**${achType}**`, value: `Tier: ${valueString} | ${achievement.subtier}\n${diffDays} Days in the server` })
                break;
            case "activity streak":
                embed.addFields({ name: `**${achType}**`, value: `Tier: ${valueString} | ${achievement.subtier}\n${profile.activityStreak} Activity streak` })
                break;

        }
    })
    await interaction.reply({ embeds: [embed] });
}
async function AchievementList(interaction) {
    const achievement = await readFileFunc(achievementPath)
    const embed = new EmbedBuilder()
        .setTitle("Here are Nexus Vault's achievements!")
        .setDescription("Use command /achievementsinfo to learn more about how to earn these achievements")
        .setColor("#FFD700") // Gold color
        .addFields(
            { name: "📝 Messages", value: "tiers 1-3 | 15 total achievements\nEarn achievements for sending messages!", inline: true },
            { name: "📅 Events", value: "tiers 1-2 | 10 total achievements\nEarn achievements for participating in server events!", inline: true },
            { name: "🎁 Giveaways", value: "tiers 1-3 | 15 total achievements\nEarn achievements for entering giveaways!", inline: true },
            { name: "📸 Pictures", value: "tiers 1-2 | 10 total achievements\nEarn achievements for sending pictures!", inline: true },
            { name: "👍 Reactions", value: "tiers 1-2 | 10 total achievements\nEarn achievements for adding reactions to messages!", inline: true },
            { name: "🎙️ Voice Calls", value: "tiers 1-3 | 15 total achievements\nEarn achievements for spending time in VC!", inline: true },
            { name: "🏃 Activities", value: "tiers 1-2 | 10 total achievements\nEarn achievements for spending time in activities!", inline: true },
            { name: "🎥 Streaming", value: "tiers 1-3 | 15 total achievements\nEarn achievements for time spent streaming!", inline: true },
            { name: "🔥 Activity Streaks", value: "tiers 1-3 | 15 total achievements\nEarn achievements for maintaining activity streaks!", inline: true },
            { name: "📆 Server Age", value: "tiers 1-5 | 25 total achievements\nEarn achievements for how long you've been a part of Nexus Vault!", inline: true }
        )
        .setFooter({ text: "Achievements system by Nexus Vault" });

    await interaction.reply({ embeds: [embed] });
}
async function PublicAchievement(interaction, publicOption, profile) {
    const newPublicOption = publicOption ? 1 : 0;
    profile.publicAchievements = newPublicOption;

    await updateProfile(profile);
    const embed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(`Public achievements set to ${publicOption}.`)
    await interaction.reply({ embeds: [embed], ephemeral: true });
}
async function CheckAchievements(profile, count, type) {
    const achievements = await readFileFunc(achievementPath)
    const achTocheck = achievements[type]
    let subtier = null;
    let userTier = null;
    for (const [tier, threshold] of Object.entries(achTocheck)) {
        for (let i = 0; i < threshold.length; i++) {
            if (threshold[i] <= count) {
                subtier = i + "/" + threshold.length
                userTier = tier
            }
        }
    }
    if (subtier) {
        const achToChange = profile.achievements.find(ach => ach.type === type);
        if (achToChange) {
            for (const [i, [tier, threshold]] of Object.entries(achTocheck).entries()) {
                if (tier === achToChange.tier && subtier !== achToChange.subtier) {
                    console.log(config.messageExp * 2 * (i + 1))
                    addTodayXp(profile, config.messageExp * 2 * (i + 1))
                }
            }
        }

        if (achToChange === undefined || achToChange === null) {
            const newAchievement = new Achievement(type, subtier);
            profile.achievements.push(newAchievement);
            addTodayXp(profile, config.messageExp * 2)
        } else {
            achToChange.subtier = subtier
            achToChange.tier = userTier
        }
    }
    await updateProfile(profile);
}
async function AchievementInfo(interaction, ach) {
    const achievements = await readFileFunc(achievementPath)
    const keys = Object.keys(achievements)
    var tierOneArray = []
    var tierTwoArray = []
    var tierThreeArray = []
    switch (ach) {
        case "messages":
            const messageAchievements = achievements.messages
            for (const [tier, threshold] of Object.entries(messageAchievements)) {
                if (tier === "tier_one") {
                    threshold.forEach(threshold => {
                        {
                            tierOneArray.push(`send ${threshold} messages\n`)
                        }
                    })

                } else if (tier === "tier_two") {
                    threshold.forEach(threshold => {
                        {
                            tierTwoArray.push(`send in ${threshold} messages\n`)
                        }
                    })
                }
                else if (tier === "tier_three") {
                    threshold.forEach(threshold => {
                        {
                            tierThreeArray.push(`send in ${threshold} messages\n`)
                        }
                    })
                }
            }
            const embed = new EmbedBuilder()
                .setTitle("Messages Achievements")
                .setDescription("Earn achievements for sending messages!")
                .setColor("#FFD700") // Gold color
                .addFields(
                    {
                        name: "Messages | tier one", value: `${tierOneArray.join("")}`
                    },
                    {
                        name: "Messages | tier two", value: `${tierTwoArray.join("")}`
                    },
                    {
                        name: "Messages | tier three", value: `${tierThreeArray.join("")}`
                    }
                )
                .setFooter({ text: "Achievements system by Nexus Vault" });
            await interaction.reply({ embeds: [embed], ephemeral: true });
            break;
        case "events":
            const eventAchievements = achievements.events
            for (const [tier, threshold] of Object.entries(eventAchievements)) {
                if (tier === "tier_one") {
                    threshold.forEach(threshold => {
                        {
                            tierOneArray.push(`participate in ${threshold} events\n`)
                        }
                    })

                } else if (tier === "tier_two") {
                    threshold.forEach(threshold => {
                        {
                            tierTwoArray.push(`participate in ${threshold} events\n`)
                        }
                    })
                }

            }
            const embed2 = new EmbedBuilder()
                .setTitle("Events Achievements")
                .setDescription("Earn achievements for participating in server events!")
                .setColor("#FFD700") // Gold color
                .addFields(
                    {
                        name: "Events | tier one", value: `${tierOneArray.join("")}`
                    },
                    {
                        name: "Events | tier two", value: `${tierTwoArray.join("")}`
                    }
                )
                .setFooter({ text: "Achievements system by Nexus Vault" });
            await interaction.reply({ embeds: [embed2], ephemeral: true });
            break;
        case "giveaways":
            const giveawayAchievements = achievements.giveaways
            for (const [tier, threshold] of Object.entries(giveawayAchievements)) {
                if (tier === "tier_one") {
                    threshold.forEach(threshold => {
                        {
                            tierOneArray.push(` enter ${threshold} giveaways\n`)
                        }
                    })

                } else if (tier === "tier_two") {
                    threshold.forEach(threshold => {
                        {
                            tierTwoArray.push(`enter  ${threshold} giveaways\n`)
                        }
                    })
                }
                else if (tier === "tier_three") {
                    threshold.forEach(threshold => {
                        {
                            tierThreeArray.push(`enter  ${threshold} giveaways\n`)
                        }
                    })
                }
            }
            const embed3 = new EmbedBuilder()
                .setTitle("Giveaways Achievements")
                .setDescription("Earn achievements for entering giveaways!")
                .setColor("#FFD700") // Gold color
                .addFields(
                    {
                        name: "Giveaways | tier one", value: `${tierOneArray.join("")}`
                    },
                    {
                        name: "Giveaways | tier two", value: `${tierTwoArray.join("")}`
                    },
                    {
                        name: "Giveaways | tier three", value: `${tierThreeArray.join("")}`
                    }
                )
                .setFooter({ text: "Achievements system by Nexus Vault" });
            await interaction.reply({ embeds: [embed3], ephemeral: true });
            break;
        case "pictures":
            const pictureAchievements = achievements.pictures
            for (const [tier, threshold] of Object.entries(pictureAchievements)) {
                if (tier === "tier_one") {
                    threshold.forEach(threshold => {
                        {
                            tierOneArray.push(`send ${threshold} images\n`)
                        }
                    })

                } else if (tier === "tier_two") {
                    threshold.forEach(threshold => {
                        {
                            tierTwoArray.push(`send ${threshold} images\n`)
                        }
                    })
                }

            }
            const embed4 = new EmbedBuilder()
                .setTitle("Pictures Achievements")
                .setDescription("Earn achievements for sending pictures!")
                .setColor("#FFD700") // Gold color
                .addFields(
                    {
                        name: "Pictures | tier one", value: `${tierOneArray.join("")}`
                    },
                    {
                        name: "Pictures | tier two", value: `${tierTwoArray.join("")}`
                    }
                )
                .setFooter({ text: "Achievements system by Nexus Vault" });
            await interaction.reply({ embeds: [embed4], ephemeral: true });
            break;
        case "reactions":
            const reactionAchievements = achievements.reactions
            for (const [tier, threshold] of Object.entries(reactionAchievements)) {
                if (tier === "tier_one") {
                    threshold.forEach(threshold => {
                        {
                            tierOneArray.push(`add ${threshold} reactions\n`)
                        }
                    })

                } else if (tier === "tier_two") {
                    threshold.forEach(threshold => {
                        {
                            tierTwoArray.push(`add ${threshold} reactions\n`)
                        }
                    })
                }

            }
            const embed5 = new EmbedBuilder()
                .setTitle("Reactions Achievements")
                .setDescription("Earn achievements for adding reactions to messages!")
                .setColor("#FFD700") // Gold color
                .addFields(
                    {
                        name: "Reactions | tier one", value: `${tierOneArray.join("")}`
                    },
                    {
                        name: "Reactions | tier two", value: `${tierTwoArray.join("")}`
                    }
                )
                .setFooter({ text: "Achievements system by Nexus Vault" });
            await interaction.reply({ embeds: [embed5], ephemeral: true });
            break;
        case "voice_chat":
            const voiceCallAchievements = achievements.voice_chat
            for (const [tier, threshold] of Object.entries(voiceCallAchievements)) {
                if (tier === "tier_one") {
                    threshold.forEach(threshold => {
                        {
                            tierOneArray.push(`spend ${threshold} hours in vc\n`)
                        }
                    })

                } else if (tier === "tier_two") {
                    threshold.forEach(threshold => {
                        {
                            tierTwoArray.push(`spend ${threshold} hours in vc\n`)
                        }
                    })
                }
                else if (tier === "tier_three") {
                    threshold.forEach(threshold => {
                        {
                            tierThreeArray.push(`spend ${threshold} hours vc\n`)
                        }
                    })
                }
            }
            const embed6 = new EmbedBuilder()
                .setTitle("Voice Chat Achievements")
                .setDescription("Earn achievements for spending time in VC!")
                .setColor("#FFD700") // Gold color
                .addFields(
                    {
                        name: "Voice Chat | tier one", value: `${tierOneArray.join("")}`
                    },
                    {
                        name: "Voice Chat | tier two", value: `${tierTwoArray.join("")}`
                    },
                    {
                        name: "Voice Chat | tier three", value: `${tierThreeArray.join("")}`
                    }
                )
                .setFooter({ text: "Achievements system by Nexus Vault" });
            await interaction.reply({ embeds: [embed6], ephemeral: true });
            break;
        case "activities":
            const activityAchievements = achievements.activities
            for (const [tier, threshold] of Object.entries(activityAchievements)) {
                if (tier === "tier_one") {
                    threshold.forEach(threshold => {
                        {
                            tierOneArray.push(`spend ${threshold} hours in activities\n`)
                        }
                    })

                } else if (tier === "tier_two") {
                    threshold.forEach(threshold => {
                        {
                            tierTwoArray.push(`spend ${threshold} hours in activities\n`)
                        }
                    })
                }

            }
            const embed7 = new EmbedBuilder()
                .setTitle("Activities Achievements")
                .setDescription("Earn achievements for spending time in activities!")
                .setColor("#FFD700") // Gold color
                .addFields(
                    {
                        name: "Activities | tier one", value: `${tierOneArray.join("")}`
                    },
                    {
                        name: "Activities | tier two", value: `${tierTwoArray.join("")}`
                    }
                )
                .setFooter({ text: "Achievements system by Nexus Vault" });
            await interaction.reply({ embeds: [embed7], ephemeral: true });
            break;
        case "activity_streak":
            const activityStreakAchievements = achievements.activity_streak
            for (const [tier, threshold] of Object.entries(activityStreakAchievements)) {
                if (tier === "tier_one") {
                    threshold.forEach(threshold => {
                        {
                            tierOneArray.push(`maintain ${threshold} day activity streak\n`)
                        }
                    })

                } else if (tier === "tier_two") {
                    threshold.forEach(threshold => {
                        {
                            tierTwoArray.push(`maintain ${threshold} day activity streak\n`)
                        }
                    })
                }
            }
            const embed8 = new EmbedBuilder()
                .setTitle("Activity Streak Achievements")
                .setDescription("Earn achievements for maintaining activity streaks!")
                .setColor("#FFD700") // Gold color
                .addFields(
                    {
                        name: "Activity Streak | tier one", value: `${tierOneArray.join("")}`
                    },
                    {
                        name: "Activity Streak | tier two", value: `${tierTwoArray.join("")}`
                    }
                )
                .setFooter({ text: "Achievements system by Nexus Vault" });
            await interaction.reply({ embeds: [embed8], ephemeral: true });
            break;
        case "server_age":
            let tierFourArray = []
            let tierFiveArray = []
            const serverAgeAchievements = achievements.server_age
            for (const [tier, threshold] of Object.entries(serverAgeAchievements)) {
                if (tier === "tier_one") {
                    threshold.forEach(threshold => {
                        {
                            tierOneArray.push(`be in the server for ${threshold} days\n`)
                        }
                    })

                } else if (tier === "tier_two") {
                    threshold.forEach(threshold => {
                        {
                            tierTwoArray.push(`be in the server for ${threshold} days\n`)
                        }
                    })
                }
                else if (tier === "tier_three") {
                    threshold.forEach(threshold => {
                        {
                            tierThreeArray.push(`be in the server for ${threshold} days\n`)
                        }
                    })
                } else if (tier === "tier_four") {
                    threshold.forEach(threshold => {
                        {
                            tierFourArray.push(`be in the server for ${threshold} days\n`)
                        }
                    })
                }
                else if (tier === "tier_five") {
                    threshold.forEach(threshold => {
                        {
                            tierFiveArray.push(`be in the server for ${threshold} days\n`)
                        }
                    })
                }
            }
            const embed9 = new EmbedBuilder()
                .setTitle("Server Age Achievements")
                .setDescription("Earn achievements for how long you've been a part of Nexus Vault!")
                .setColor("#FFD700") // Gold color
                .addFields(
                    {
                        name: "Server Age | tier one", value: `${tierOneArray.join("")}`
                    },
                    {
                        name: "Server Age | tier two", value: `${tierTwoArray.join("")}`
                    },
                    {
                        name: "Server Age | tier three", value: `${tierThreeArray.join("")}`
                    },
                    {
                        name: "Server Age | tier four", value: `${tierFourArray.join("")}`
                    },
                    {
                        name: "Server Age | tier five", value: `${tierFiveArray.join("")}`
                    }
                )
                .setFooter({ text: "Achievements system by Nexus Vault" });
            await interaction.reply({ embeds: [embed9], ephemeral: true });
            break;

    }



}

//#endregion

//#region -- REPEATING MESSAGES FUNCTION--

class RepeatingMessage {
    constructor() {
        this.ownerId = ""
        this.ownerUsername = ""
        this.message = ""
        this.messageId = ""
        this.channel = ""
        this.day = 0
        this.hour = 0
        this.minute = 0
        this.createdAt = new Date()
        this.nextSend = new Date()
    }
}
async function SaveRepeatingMessages() {
    await fsPromises.writeFile(repeatingMessagesPath, JSON.stringify(repeatingMessagesArray, null, 2))
}
async function GetRepeatingMessages() {
    return JSON.parse(await fsPromises.readFile(repeatingMessagesPath, 'utf8'))
}
async function createRepeatingMessage(interaction, message, channel, day, hour, minute) {

    if (repeatingMessagesArray.findIndex(repeatingMessage => repeatingMessage.message === message) !== -1 && repeatingMessagesArray.findIndex(repeatingMessage => repeatingMessage.channel === channel.id) !== -1) {
        const errorEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Repeating Message Error')
            .setDescription(`The repeating message already exists.`)
            .setTimestamp();

        if (interaction !== null) { await interaction.reply({ embeds: [errorEmbed], ephemeral: true }) }

        return
    }

    const createdAt = new Date(new Date().toUTCString())

    const nextSend = new Date(new Date().toUTCString())
    nextSend.setDate(nextSend.getDate() + day)
    nextSend.setHours(nextSend.getHours() + hour)
    nextSend.setMinutes(nextSend.getMinutes() + minute)

    const newMessage = await channel.send(message)

    const repeatingMessage = new RepeatingMessage()
    repeatingMessage.ownerId = interaction.user.id
    repeatingMessage.ownerUsername = interaction.user.username
    repeatingMessage.message = message
    repeatingMessage.messageId = newMessage.id
    repeatingMessage.channel = channel.id
    repeatingMessage.day = day
    repeatingMessage.hour = hour
    repeatingMessage.minute = minute
    repeatingMessage.createdAt = createdAt
    repeatingMessage.nextSend = nextSend


    repeatingMessagesArray.push(repeatingMessage)
    await SaveRepeatingMessages()

    if (interaction !== null) {
        const successEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Repeating Message Created')
            .setDescription(`Message: ${message}\nChannel: ${channel}\nInterval: ${day} days ${hour} hour ${minute} minute`)
            .setTimestamp();

        await interaction.reply({ embeds: [successEmbed] });
    }
}
async function deleteRepeatingMessage(interaction, messageId) {
    const message = repeatingMessagesArray.find(repeatingMessage => repeatingMessage.messageId === messageId).message;
    const index = repeatingMessagesArray.findIndex(repeatingMessage => repeatingMessage.messageId === messageId);

    if (index !== -1) {
        repeatingMessagesArray.splice(index, 1);
        await SaveRepeatingMessages();

        const successEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Repeating Message Deleted')
            .setDescription(`Message: ${message}`)
            .setTimestamp();

        await interaction.reply({ embeds: [successEmbed] });
    }
}
async function changeRepeatingMessage(interaction, messageId, newMessage) {

    const message = repeatingMessagesArray.find(repeatingMessage => repeatingMessage.messageId === messageId).message;
    const index = repeatingMessagesArray.findIndex(repeatingMessage => repeatingMessage.messageId === messageId);

    if (index !== -1) {
        repeatingMessagesArray[index].message = newMessage;
        await SaveRepeatingMessages();

        const successEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Repeating Message Changed')
            .setDescription(`Message: ${message} -> ${newMessage}`)
            .setTimestamp();

        await interaction.reply({ embeds: [successEmbed] });
    }
}
async function changeRepeatingMessageTime(interaction, messageId, day, hour, minute) {
    const index = repeatingMessagesArray.findIndex(repeatingMessage => repeatingMessage.messageId === messageId);

    if (index !== -1) {
        repeatingMessagesArray[index].day = day;
        repeatingMessagesArray[index].hour = hour;
        repeatingMessagesArray[index].minute = minute;
        await SaveRepeatingMessages();

        const successEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Repeating Message Time Changed')
            .setDescription(`Message: ${message}\nInterval: ${day} days ${hour} hour ${minute} minute`)
            .setTimestamp();

        await interaction.reply({ embeds: [successEmbed] });
    }
}
async function changeRepeatingMessageChannel(interaction, messageId, channel) {


    const message = repeatingMessagesArray.find(repeatingMessage => repeatingMessage.messageId === messageId).message;
    console.log(message)
    const index = repeatingMessagesArray.findIndex(repeatingMessage => repeatingMessage.messageId === messageId);

    if (index !== -1) {
        const targetChannel = client.channels.cache.get(repeatingMessagesArray[index].channel)
        const oldMessage = await targetChannel.messages.fetch(repeatingMessagesArray[index].messageId)
        if (oldMessage) {
            oldMessage.delete()
        }

        const newMessage = await channel.send(repeatingMessagesArray[index].message)

        repeatingMessagesArray[index].channel = channel.id;
        repeatingMessagesArray[index].messageId = newMessage.id;

        await SaveRepeatingMessages();

        const successEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Repeating Message Channel Changed')
            .setDescription(`Message: ${message}\nChannel: ${channel}`)
            .setTimestamp();

        await interaction.reply({ embeds: [successEmbed] });
    }
}

//#endregion

//#region -- SUBS FUNCTIONS --

class Subs {
    constructor() {
        this.id = ""
        this.name = ""
        this.roleId = ""
        this.users = []
    }
}
async function SaveSubs() {
    await fsPromises.writeFile(subsPath, JSON.stringify(subsArray, null, 2))
    console.log('Subs saved')
}
async function GetSubs() {
    return JSON.parse(await fsPromises.readFile(subsPath, 'utf8'))
}
async function createSubs(interaction, name, id, role) {

    const subs = new Subs()
    subs.id = id
    subs.name = name
    subs.roleId = role.id

    subsArray.push(subs)
    await SaveSubs()

    if (interaction !== null) {
        const successEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Subscription Created')
            .setDescription(`Name: ${name}\nID: ${id}\nRole: ${role.name}`)
            .setTimestamp();

        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    }
}
async function deleteSubs(interaction, subsParam) {
    const index = subsArray.findIndex(subs => subs.id === subsParam);

    if (index !== -1) {
        subsArray.splice(index, 1);
        await SaveSubs();
    }

    if (interaction !== null) {
        const successEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Subscription Deleted')
            .setDescription(`The subscription has been deleted.`)
            .setTimestamp();

        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    }
}
async function changeSubsName(interaction, subsParam, name) {
    const index = subsArray.findIndex(subs => subs.id === subsParam);

    if (index !== -1) {
        subsArray[index].name = name;
        await SaveSubs();
    }

    if (interaction !== null) {
        const successEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Subscription Name Changed')
            .setDescription(`The subscription name has been changed to ${name}.`)
            .setTimestamp();

        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    }
}
async function changeSubsId(interaction, subsParam, id) {
    const index = subsArray.findIndex(subs => subs.id === subsParam);

    if (index !== -1) {
        if (subsArray.findIndex(subs => subs.id === id) === -1) {
            subsArray[index].level = id;
            await SaveSubs();
            if (interaction !== null) {
                const successEmbed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('Subscription ID Changed')
                    .setDescription(`The subscription ID has been changed to ${id}.`)
                    .setTimestamp();

                await interaction.reply({ embeds: [successEmbed], ephemeral: true });
            }
        } else {
            if (interaction !== null) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Subscription ID Error')
                    .setDescription(`The subscription ID already exists.`)
                    .setTimestamp();

                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
}
async function changeSubsRole(interaction, subsParam, role) {
    const index = subsArray.findIndex(subs => subs.level === subsParam);

    if (index !== -1) {
        subsArray[index].roleId = role.id;
        await SaveSubs();
    }

    if (interaction !== null) {
        const successEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Subscription Role Changed')
            .setDescription(`The subscription role has been changed to ${role.name}.`)
            .setTimestamp();

        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    }
}
async function addSubsUser(interaction, subsParam, user) {
    const index = subsArray.findIndex(sub => sub.id === subsParam);

    if (index !== -1) {
        subsArray[index].users.push(user.id);
        await SaveSubs();
    }

    if (interaction !== null) {
        const successEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('User Added to Subscription')
            .setDescription(`The user has been added to the subscription.`)
            .setTimestamp();

        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    }
}
async function removeSubsUser(interaction, subsParam, userParam) {
    const index = subsArray.findIndex(subs => subs.id === subsParam);

    if (index !== -1) {
        const userIndex = subsArray[index].users.findIndex(user => user.id === userParam.id);

        if (userIndex !== -1) {
            subsArray[index].users.splice(userIndex, 1);
            await SaveSubs();
        }
    }

    if (interaction !== null) {
        const successEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('User Removed from Subscription')
            .setDescription(`The user has been removed from the subscription.`)
            .setTimestamp();

        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    }
}

async function changeEntry(interaction, subsParam, entry) {
    const index = subsArray.findIndex(subs => subs.id === subsParam);

    if (index !== -1) {
        subsArray[index].giveawayEntry = entry;
        await SaveSubs();
    }

    if (interaction !== null) {
        const successEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Subscription Entry Changed')
            .setDescription(`The subscription entry number has been changed to ${entry}.`)
            .setTimestamp();

        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    }
}
//#endregion

//#region -- PROFILE FUNCTIONS --

async function showProfile(interaction, user) {

    const profile = await controlAndCreateProfile(user)

    if (user === null) {
        user = await client.users.fetch(profile.id);
    }
    const guild = await client.guilds.fetch(guildId);
    let member;

    try {
        member = await guild.members.fetch(user.id);

    } catch (error) {
        member = null;
    }

    if (member === null) {

        if (interaction !== null) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`User is not in the server.`)
            if (interaction !== null) {
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
        return null;
    }

    var isUserAdmin;
    try {
        isUserAdmin = member.permissions.has('ADMINISTRATOR');
    } catch (error) {
        isUserAdmin = false;
    }
    if ((user.id !== profile.id && !profile.public) && isUserAdmin === false) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(`User has a private profile.`)
        if (interaction !== null) {
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        return
    }

    const name = user.username;
    const avatar = user.displayAvatarURL();
    const xp = profile.xp;
    const level = profile.level;
    const requiredXp = profile.requiredXp;
    var joinedDate = member.joinedAt.toString().split(' ').slice(1, 4).join(' ');
    const percentage = xp === 0 ? 0 : Math.floor((xp / requiredXp) * 100);
    const quip = profile.quip;
    joinedDate = joinedDate.replace(/(\b\d{1,2}\b)/, '$1,');
    const backgroundColor = profile.backgroundColor || "#000000";
    const progressColor = profile.progressBarColor || "#7289da";
    var userAch = 0;

    const achievements = await readFileFunc(achievementPath);
    var a = 0;
    for (const profileAch of profile.achievements) {
        for (const [type, achToCheck] of Object.entries(achievements)) {
            if (profileAch.type === type) {
                if (profileAch.subtier) {
                    const parts = profileAch.subtier.split('/');
                    const numerator = parseInt(parts[0], 10);
                    userAch++;
                    userAch += numerator;
                    if (profileAch.tier === "tier_two") {
                        userAch += 5;
                    } else if (profileAch.tier === "tier_three") {
                        userAch += 10;
                    } else if (profileAch.tier === "tier_four") {
                        userAch += 15;
                    } else if (profileAch.tier === "tier_five") {
                        userAch += 20;
                    }
                }
            }

        }
    }
    const profileHtml = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Discord Profile Mockup</title>
    <style>
        html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #2c2f33;
            overflow: hidden;
        }
        .profile-card {
            background-color: ${backgroundColor};
            border-radius: 10px;
            padding: 20px;
            width: 400px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            text-align: left;
            box-sizing: border-box;
        }
        .profile-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .profile-header img {
            border-radius: 50%;
            width: 50px;
            height: 50px;
            margin-right: 15px;
        }
        .profile-info {
            flex-grow: 1;
        }
        .username {
            font-size: 20px;
            font-weight: bold;
            color: #fff;
        }
        .joined-date, .level {
            font-size: 14px;
            color: #b9bbbe;
            margin: 2px 0;
        }
        .exp-bar-container {
            position: relative;
            background-color: #4f545c;
            border-radius: 4px;
            overflow: hidden;
            margin: 10px 0;
            height: 18px;
        }
        .exp-bar {
            height: 100%;
            background-color: ${progressColor};
            width: ${percentage}%;
            min-width: 5px; /* Ensure a minimum width for visibility */
        }
        .exp-text {
            position: absolute;
            top: 0;
            left: 10px;
            text-align: left;
            color: ${backgroundColor};
            font-size: 14px;
            line-height: 18px;
            z-index: 1;
        }
        .level-text {
            position: absolute;
            top: 0;
            right: 10px;
            text-align: right;
            color: ${backgroundColor};
            font-size: 14px;
            line-height: 18px;
            z-index: 1;
        }
        .quip {
            font-size: 14px;
            color: #b9bbbe;
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="profile-card">
        <div class="profile-header">
            <img src="${avatar}" alt="Avatar">
            <div class="profile-info">
                <div class="username">${name}</div>
                <div class="joined-date">joined: ${joinedDate}</div>
                <div class="level">lvl. ${level} | ${userAch} achievements</div>
            </div>
        </div>
        <div class="exp-bar-container">
            <div class="exp-bar"></div>
            <div class="exp-text">exp: ${xp}/${requiredXp}</div>
            <div class="level-text">lvl. ${level}</div>
        </div>
        <div class="quip">${quip}</div>
    </div>
</body>
</html>
`;

    if (interaction === null) {
        return {
            "id": user.id,
            "public": profile.public ? true : false,
            "percentage": percentage,
            "avatar": avatar,
            "name": name,
            "xp": xp,
            "level": level,
            "requiredXp": requiredXp,
            "joinedDate": joinedDate,
            "quip": quip,
            "backgroundColor": backgroundColor,
            "progressColor": progressColor
        };

    }


    const browser = await puppeteer.launch({
        headless: true,
        executablePath: "/home/rqx3du584dnt/.cache/puppeteer/chrome/linux-126.0.6478.63/chrome-linux64/chrome",
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(profileHtml);
    await page.waitForSelector('.profile-card');

    // Get the dimensions of the profile card
    const cardDimensions = await page.evaluate(() => {
        const card = document.querySelector('.profile-card');
        const { width, height } = card.getBoundingClientRect();
        return { width, height };
    });

    // Set the viewport to the dimensions of the profile card
    await page.setViewport({
        width: Math.ceil(cardDimensions.width),
        height: Math.ceil(cardDimensions.height)
    });
    const screenshotBuffer = await page.screenshot({
        clip: {
            x: 0,
            y: 0,
            width: Math.ceil(cardDimensions.width),
            height: Math.ceil(cardDimensions.height)
        }
    });
    await browser.close();

    const attachment = new AttachmentBuilder(screenshotBuffer, { name: 'profile-image.png' });

    if (interaction !== null) {
        await interaction.reply({ files: [attachment] });
    }
}
async function findEmoteByName(emojis, emojiName) {
    for (const emojiCollection of emojis) {
        for (const emoji of emojiCollection.values()) {
            if (emoji.name === emojiName) {
                return emoji;
            }
        }
    }
    return null;
}
// async function MakeChart(profile) {

//     const width = 400; // Width of the chart
//     const height = 300; // Height of the chart
//     const canvas = createCanvas(width, height);
//     const ctx = canvas.getContext('2d'); // Get the 2D drawing context

//     // Customize global chart defaults
//     Chart.register(...registerables, LinearScale, CategoryScale, BarElement)
//     Chart.defaults.font.size = 10;
//     Chart.defaults.color = '#fff';
//     var serverWide = [0];
//     profiles.forEach((profil, index) => {
//         profil.monthlyXp.forEach((xp, index) => {
//             if (serverWide[index] === undefined) {
//                 serverWide[index] = xp;
//             } else {
//                 serverWide[index] += xp;
//             }
//         })
//     })
//     var average = []
//     for (let i = 0; i < profile.monthlyXp.length; i++) {
//         average.push(profile.monthlyXp[i] / profiles.length)
//     }

//     const now = new Date();
//     const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//     const dayOfWeekIndex = now.getDay();

//     // Yeni düzenlenmiş dizi
//     const sortedDaysOfWeek = [
//         ...daysOfWeek.slice(dayOfWeekIndex + 1),
//         ...daysOfWeek.slice(0, dayOfWeekIndex + 1)
//     ];

//     // Define the chart configuration with both bar and line datasets
//     const configuration = {
//         type: 'bar', // Base type of the chart
//         data: {
//             labels: sortedDaysOfWeek, // X-axis labels
//             datasets: [
//                 {
//                     type: 'bar',
//                     label: 'Your stats',
//                     data: profile.monthlyXp.slice(0, 7), // Y-axis data
//                     backgroundColor: [
//                         'rgba(255, 99, 132, 0.2)',
//                         'rgba(54, 162, 235, 0.2)',
//                         'rgba(255, 206, 86, 0.2)',
//                         'rgba(75, 192, 192, 0.2)',
//                         'rgba(153, 102, 255, 0.2)',
//                         'rgba(255, 159, 64, 0.2)'
//                     ],
//                     borderColor: [
//                         'rgba(255, 99, 132, 1)',
//                         'rgba(54, 162, 235, 1)',
//                         'rgba(255, 206, 86, 1)',
//                         'rgba(75, 192, 192, 1)',
//                         'rgba(153, 102, 255, 1)',
//                         'rgba(255, 159, 64, 1)'
//                     ],
//                     borderWidth: 1
//                 },
//                 {
//                     type: 'line',
//                     label: 'Server-wide stats',
//                     data: average,
//                     backgroundColor: 'rgba(255, 206, 86, 0.2)',
//                     borderColor: 'rgba(255, 206, 86, 1)',
//                     borderWidth: 2,
//                     fill: false,
//                     tension: 0.4
//                 }
//             ]
//         },
//         options: {
//             scales: {
//                 y: {
//                     beginAtZero: true,
//                     ticks: {
//                         color: '#fff' // Customize tick color
//                     },
//                     grid: {
//                         color: 'rgba(255, 255, 255, 0.2)' // Customize grid color
//                     }
//                 },
//                 x: {
//                     ticks: {
//                         color: '#fff' // Customize tick color
//                     },
//                     grid: {
//                         color: 'rgba(255, 255, 255, 0.2)' // Customize grid color
//                     }
//                 }
//             },
//             plugins: {
//                 legend: {
//                     labels: {
//                         color: '#fff' // Customize legend color
//                     }
//                 },
//                 tooltip: {
//                     backgroundColor: 'rgba(0, 0, 0, 0.8)', // Tooltip background color
//                     titleColor: '#fff', // Tooltip title color
//                     bodyColor: '#fff', // Tooltip body color
//                     borderColor: 'rgba(255, 255, 255, 0.3)', // Tooltip border color
//                     borderWidth: 1
//                 }
//             }
//         }
//     };

//     // Render the chart
//     new Chart(ctx, configuration);

//     // Convert the canvas to a buffer
//     const buffer = canvas.toBuffer('image/png');

//     return buffer;
// }
async function PublicProfile(interaction, publicOption, profile) {
    const newPublicOption = publicOption ? 1 : 0;
    profile.public = newPublicOption;
    await updateProfile(profile);
    const embed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(`Profile visibility set to ${publicOption ? '**public** \nEveryone can see your profile \nTo make your profile private use /private-profile ' : '**private** \nOnly you and staff members can see your profile to unprivate your profile use /unprivate-profile'}.`)
    if (interaction !== null) {
        await interaction.reply({ embeds: [embed], ephemeral: true });

    }
}
async function ChangeQuip(interaction, quip, profile) {
    profile.quip = quip;
    await updateProfile(profile);
    if (interaction !== null) {
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`Quip changed to ${quip}.`)

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}
async function ChangeProgressBarColor(interaction, colorNameInput, profile, rgb) {

    if (!rgb) {
        if (interaction !== null) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`Invalid color name! Please provide a valid color name.`)
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        return;

    }
    const hex = `#${rgb.map(x => x.toString(16).padStart(2, '0')).join('')}`;
    profile.progressBarColor = hex
    await updateProfile(profile);

    if (interaction !== null) {
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`Progress bar color changed to ${colorNameInput}.`)
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

}
async function ChangeBackgroundColor(interaction, colorNameInput, profile, rgb) {
    if (!rgb) {
        if (interaction !== null) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`Invalid color name! Please provide a valid color name.`)
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        return;

    }
    const hex = `#${rgb.map(x => x.toString(16).padStart(2, '0')).join('')}`;
    profile.backgroundColor = hex
    await updateProfile(profile);

    if (interaction !== null) {
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`Background color changed to ${colorNameInput}.`)
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}

//#endregion

//#region -- LEVEL XP FUNCTIONS --

async function leaderBoard(interaction, day, type) {
    let pagePer = 10
    let query;
    let params = [];
    const typeMap = {
        "level": "level",
        "booster": "premiumSince",
        "longestSub": "subMonth"
    };

    if (type === "booster") {
        // Booster'ları ve profillerini çek
        query = `
                SELECT p.id, p.public, m.premiumSince
                FROM user_profiles p
                JOIN guild_members m ON p.id = m.user_id
                WHERE m.premiumSince IS NOT NULL AND p.public = true
            `;
    } else if (day !== "All") {
        // Belirli bir gün için aylık istatistikler
        const intDay = parseInt(day);
        const typeColumn = `monthly${type}`;
        query = `
                SELECT id, ${typeColumn}
                FROM user_profiles
                WHERE public = true
            `;
    } else {
        // Toplam istatistikler
        query = `
                SELECT id, ${typeMap[type]} AS value
                FROM user_profiles
                WHERE public = true
            `;
    }
    let connection = null;

    try {
        connection = await pool.getConnection();
    } catch (error) {
        console.error(error);
        return;
    }

    const [rows] = await connection.query(query, params);

    // Sonuçları işleme
    const firstArray = new Map();
    rows.forEach(row => {
        const key = `<@${row.id}>`; // Kullanıcı etiketleme formatı
        const value = row.value || row.premiumSince || row.subMonth;
        firstArray.set(key, value);
    });

    // Liderlik panosunu sıralama
    let sortedArray = Array.from(firstArray);
    sortedArray.sort((a, b) => b[1] - a[1]);
    let sortedMap = new Map(sortedArray);

    // Liderlik panosunu formatlama
    let counter = 1;
    const numberedMap = new Map();
    for (let [key, value] of sortedMap) {
        if (counter === 1) {
            numberedMap.set(`:first_place:  ${key}`, `\`${value}\``);
        } else if (counter === 2) {
            numberedMap.set(`:second_place:  ${key}`, `\`${value}\``);
        } else if (counter === 3) {
            numberedMap.set(`:third_place:  ${key}`, `\`${value}\``);
        } else {
            numberedMap.set(`**#${counter}.**  ${key}`, `\`${value}\``);
        }
        counter++;
    }

    // Sayfalandırma
    let firstTen = Array.from(numberedMap).slice(0, pagePer);
    const totalProfiles = rows.length; // toplam profiller sayısı
    const totalPage = Math.ceil(totalProfiles / pagePer);

    // Çıktıyı formatlama
    let description = firstTen.map(row => row.join('\n')).join('\n');
    var page = 0;
    let formattedType = type.replace(/([A-Z])/g, ' $1').trim();
    formattedType = formattedType.charAt(0).toUpperCase() + formattedType.slice(1);


    const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription(`**${day} 𝐝𝐚𝐲𝐬 𝐥𝐞𝐚𝐝𝐞𝐫𝐛𝐨𝐚𝐫𝐝 for ${formattedType}\n 𝗬𝗼𝘂 𝗮𝗿𝗲 𝗻𝘂𝗺𝗯𝗲𝗿 ${playerNumber + 1}**  \n${description}`)

    const pageButton = new ButtonBuilder()
        .setCustomId("page-button")
        .setStyle(ButtonStyle.Secondary)
        .setLabel(`page ${page + 1}/${totalPage}`)
        .setDisabled(true)

    if (day === "All") {
        embed.setDescription(`**L𝐞𝐚𝐝𝐞𝐫𝐛𝐨𝐚𝐫𝐝 for ${formattedType}\n 𝗬𝗼𝘂 𝗮𝗿𝗲 𝗻𝘂𝗺𝗯𝗲𝗿 ${playerNumber + 1}**  \n${description}`)
    }

    const nextButton = new ButtonBuilder()
        .setCustomId("next")
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary)

    const prevButton = new ButtonBuilder()
        .setCustomId("prev")
        .setLabel("Previous")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true)

    // Function to update buttons based on current page
    function updateButtons() {
        if (page === 0) {
            prevButton.setDisabled(true);
        } else {
            prevButton.setDisabled(false);
        }

        if ((page + 1) * pagePer >= numberedMap.size) {
            nextButton.setDisabled(true);
        } else {
            nextButton.setDisabled(false);
        }

        pageButton.setLabel(`page ${page + 1}/${totalPage}`);
    }

    const buttonRow = new ActionRowBuilder().addComponents(prevButton, pageButton, nextButton)

    const replya = await interaction.reply({ embeds: [embed], components: [buttonRow], ephemeral: true })

    const collector = replya.createMessageComponentCollector()

    collector.on("collect", buttonInteract => {
        if (buttonInteract.customId == "next") {
            page++;
            updateButtons();

            let nextTen = Array.from(numberedMap).slice(page * pagePer, (page + 1) * pagePer);
            let nextDescription = nextTen.map(row => row.join('\n')).join('\n');

            let embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`**${day} days leaderboard for ${formattedType}\nYou are number ${playerNumber + 1}**  \n${nextDescription}`);

            if (day === "All") {
                embed.setDescription(`**Leaderboard for ${formattedType}\nYou are number ${playerNumber + 1}**  \n${nextDescription}`);
            }

            buttonInteract.update({ embeds: [embed], components: [buttonRow] });
        }

        if (buttonInteract.customId === "prev") {
            page--;
            updateButtons();

            let prevTen = Array.from(numberedMap).slice(page * pagePer, (page + 1) * pagePer);
            let prevDescription = prevTen.map(row => row.join('\n')).join('\n');

            let embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`**${day} days leaderboard for ${formattedType}\nYou are number ${playerNumber + 1}**  \n${prevDescription}`);

            if (day === "All") {
                embed.setDescription(`**Leaderboard for ${formattedType}\nYou are number ${playerNumber + 1}**  \n${prevDescription}`);
            }

            buttonInteract.update({ embeds: [embed], components: [buttonRow] });
        }
    });
}
async function addXp(interaction, user, xpAmount, userProfile) {
    if (user.bot) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription('You cannot add XP to a bot.')
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return
    }

    if (userProfile) {
        userProfile.totalXp += xpAmount
        userProfile.xp += xpAmount
        userProfile.monthlyXp[0] += xpAmount
        await updateProfile(userProfile);
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`XP added to ${user.username}.`)
        await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription('User has no profile.')
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return
    }

}
async function SaveProfiles() {
    return
    // // if (profiles.length != 0) {
    //     try {
    //         const jsonString = JSON.stringify(profiles, null, 2)
    //         await fsPromises.writeFile(profilesPath, jsonString, "utf8")

    //     } catch (error) {
    //         console.error("A problem occured when saving the profiles :" + error)
    //     }
    // } else {
    //     console.log("Not writing empty profiles")
    // }
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


async function GetProfile() {
    return
    // try {
    //     var data = await fsPromises.readFile(profilesPath, "utf8")
    //     return JSON.parse(data)
    // }
    // catch (err) {
    //     console.error("Error reading profiles " + err)
    // }
}
function StartMessageTimer(profile) {
    profile.canEarnFromMessage = 0
    setTimeout(() => {
        profile.canEarnFromMessage = 1
    }, config.messageWait * 1000)
}
function StartPhotoTimer(profile) {
    profile.canEarnFromPhoto = 0
    setTimeout(() => {
        profile.canEarnFromPhoto = 1
    }, config.messageWait * 1000)
}
function StartAddReactionTimer(profile) {
    profile.canEarnFromAdReaction = 0
    setTimeout(() => {
        profile.canEarnFromAdReaction = 1
    }, config.messageWait * 1000)
}
function StartEventTimer(profile) {
    profile.canEarnFromEvent = 0
    setTimeout(() => {
        profile.canEarnFromEvent = 1
    }, config.messageWait * 30 * 1000)
}
async function LevelUp(profile) {
    if (profile.level === 50) {
        profile.xp = profile.requiredXp
        return
    }
    profile.xp -= profile.requiredXp
    profile.level += 1
    profile.requiredXp = config.levelUpXp * profile.level
    const level_roles = await readFileFunc(level_rolesPath)
    for (const level_role of level_roles) {
        if (profile.level === level_role.level) {
            const guild = await client.guilds.fetch(process.env.GUILD_ID)
            const role = await guild.roles.fetch(level_role.role)
            const member = await guild.members.fetch(profile.id);
            await member.roles.add(role)

        }
    }

    if (profile.level === 1) {
        profile.balance += 10;
    } else if (profile.level === 3) {
        profile.balance += 20;
    } else if (profile.level === 8) {
        profile.balance += 35;
    } else if (profile.level === 15) {
        profile.balance += 45;
    } else if (profile.level === 20) {
        profile.balance += 70;
    } else if (profile.level === 25) {
        profile.balance += 100;
    } else if (profile.level === 30) {
        profile.balance += 135;
    } else if (profile.level === 40) {
        profile.balance += 175;
    } else if (profile.level === 49) {
        profile.balance += 225;
    }
    await updateProfile(profile);

}
function findIndices2D(array2D, element) {
    const indices = [];
    array2D.forEach((subArray, index) => {
        if (subArray[0] === element) {
            indices.push(index);
        }
    });
    return indices;
}
function startXpGain(channel, xp, duraction, isEvent) {

    if (xpIntervals.has(channel.id)) return; // Interval already set for this channel

    if (isEvent) {
        channel.forEach(async member => {

            let profile = await controlAndCreateProfile(member)
            const boostValue = profile?.boost || 1;

            if (profile.canEarnFromEvent) {
                addTodayXp(profile, config.messageExp * boostValue)
                profile.monthlyEventAmount[0] += 1
                profile.totalEventAmount += 1
                StartEventTimer(profile)
            }
            await CheckAchievements(profile, profile.totalEventAmount, "event")
        }
        )
    }

    const interval = setInterval(() => {
        if (channel.members.size < 2) {
            clearInterval(interval);
            xpIntervals.delete(channel.id);
            return;
        }

        channel.members.forEach(async member => {
            if (!member.user.bot) { // Check if the member is not a bot
                let profile = await controlAndCreateProfile(member)
                const boostValue = profile?.boost || 1;

                addTodayXp(profile, config.messageExp * boostValue)

                let controlLevelUp = true
                while (controlLevelUp) {
                    controlLevelUp = false
                    if (profile.xp >= profile.requiredXp) {
                        await LevelUp(profile)
                        if (profile.level !== 50) {
                            controlLevelUp = true
                        }
                    }
                }
            }
        });
    }, duraction * 60 * 1000);

    xpIntervals.set(channel.id, interval);


    const MinutesInterval = setInterval(() => {
        if (channel.members.size < 2) {
            clearInterval(MinutesInterval);
            xpIntervals.delete(channel.id);
            return;
        }

        channel.members.forEach(async member => {
            if (!member.user.bot) { // Check if the member is not a bot
                let profile = await controlAndCreateProfile(member)

                if (isEvent) {
                    profile.monthlyEventMin[0] += 1
                    profile.totalEventMin += 1
                } else {
                    profile.monthlyCallMin[0] += 1
                    profile.totalCallMin += 1
                    await CheckAchievements(profile, profile.totalCallMin, "voice_chat")
                }
                let connection = null;

                try {
                    connection = await pool.getConnection();
                } catch (error) {
                    console.error('Error in addTodayXp:', error);
                }


                await connection.query(
                    'UPDATE user_profiles SET monthlyEventMin = ?, totalEventMin = ?, monthlyCallMin = ?, totalCallMin = ? WHERE id = ?',
                    [
                        JSON.stringify(profile.monthlyEventMin),
                        profile.totalEventMin,
                        JSON.stringify(profile.monthlyCallMin),
                        profile.totalCallMin,
                        profile.id
                    ]
                );
            }
        });
    }, 60 * 1000);

    xpIntervals.set(channel.id, MinutesInterval);

    // const StreamInterval = setInterval(() => {
    //   if (channel.members.size < 2) {
    //     clearInterval(StreamInterval);
    //     xpIntervals.delete(channel.id);
    //     return;
    //   }




    //   channel.members.forEach(async member => {
    //     if (!member.user.bot) { // Check if the member is not a bot
    //       let profile = profiles.find(profileId => profileId.id.toString() === member.id.toString())

    //       if (profile === undefined) {
    //         profile = new Profiles(member)
    //         profiles.push(profile)
    //         await updateProfile(profile); 
    //       }

    //       const streamingActivity = await member.presence?.activities.find(activity => activity.type === 'STREAMING');
    //       const amk = await member.presence


    //       if (streamingActivity) {

    //         profile.monthlyStreamMin[0] += 1
    //         profile.totalStreamMin += 1
    //         await updateProfile(profile); 
    //       } else {

    //       }
    //     }
    //   });
    // }, 10 * 1000);
    // xpIntervals.set(channel.id, StreamInterval);


}
function stopXpGain(channel) {
    if (xpIntervals.has(channel.id)) {
        clearInterval(xpIntervals.get(channel.id));
        xpIntervals.delete(channel.id);
    }
}
async function addTodayXp(profile, xp) {
    let connection;
    try {
        connection = await pool.getConnection();

        if (!profile) {
            return
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


async function getMonthlyData(type) {
    let connection = null;

    try {
        connection = await pool.getConnection();
        // SQL sorgusunu tür ile oluştur
        let query = `
            SELECT id, ${type}
            FROM user_profiles
            WHERE public = true
        `;

        const [rows] = await connection.query(query);

        // Veriyi işleme
        let firstArray = rows.map(row => {
            let tempArray = row[type].slice(0, 30);
            let sum = tempArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            return { id: row.id, sum: sum };
        });

        // Sıralama ve en yüksek sonuçları alma
        firstArray.sort((a, b) => b.sum - a.sum);
        const top10 = firstArray.slice(0, 10);

        return top10;

    } catch (error) {
        console.error('Hata:', error);
        throw error;
    } finally {
        if (connection) {
            // Bağlantıyı havuza geri bırak
            connection.release();
        }
    }
}

async function monthlyTop10() {
    const today = new Date();
    const dayOfMonth = today.getDate();

    if (dayOfMonth === 1) {
        const typeName = ["monthlyXp", "monthlyCallMin"];
        const typeNameLabel = ["Xp", "VC Minute"];
        const typeNameColor = ["#00bfff", "#d15fee"];

        for (let typeIndex = 0; typeIndex < typeName.length; typeIndex++) {
            const type = typeName[typeIndex];
            const label = typeNameLabel[typeIndex];
            const color = typeNameColor[typeIndex];

            try {
                const top10 = await getMonthlyData(type);

                let description = `You are in the top 10 of the ${label} leaderboard. \n`;

                for (let i = 0; i < top10.length; i++) {
                    if (type === "monthlyCallMin") {
                        let totalMinutes = top10[i].sum;
                        let days = Math.floor(totalMinutes / (60 * 24));
                        let hours = Math.floor((totalMinutes % (60 * 24)) / 60);
                        let minutes = Math.floor(totalMinutes % 60);

                        description += `${i + 1}. <@${top10[i].id}> : **${days}** Day **${hours}** Hour **${minutes}** Minute \n`;
                    } else {
                        description += `${i + 1}. <@${top10[i].id}> : **${top10[i].sum}** Xp \n`;
                    }
                }

                // Kullanıcılara mesaj gönderme
                for (let element of top10) {
                    try {
                        const user = await client.users.fetch(element.id);

                        const embed = new EmbedBuilder()
                            .setColor(color)
                            .setTitle(`Top 10 ${label} Leaderboard`)
                            .setDescription(description);

                        await user.send({ embeds: [embed] });
                    } catch (error) {
                        console.error("Error fetching user or sending message:", error);
                    }
                }

            } catch (error) {
                console.error("Error processing top 10 leaderboard:", error);
            }
        }
    }
}
async function controlAndCreateProfile(user) {
    let connection = null;

    try {
        connection = await pool.getConnection();

        // Profil var mı kontrol et
        const [rows] = await connection.execute('SELECT * FROM user_profiles WHERE id = ?', [user.id]);
        let profile = rows[0]; // İlk sonucu al (varsa)

        if (!profile && !user.bot) {
            // Profil bulunamadıysa ve kullanıcı bot değilse, yeni profil oluştur
            profile = {
                id: user.id,
                public: true,
                level: 1,
                requiredXp: config.levelUpXp,
                xp: 0,
                totalXp: 0,
                balance: 0,
                subsMonth: 0,
                totalSubsMonth: 0,
                canEarnFromPhoto: true,
                canEarnFromMessage: true,
                canEarnFromAdReaction: true,
                canEarnFromEvent: true,
                wonGiveawayNames: [],
                customEmotes: [],
                totalCallMin: 0,
                achievements: [],
                publicAchievements: true,
                boost: 1,
                spentMoney: 0,
                boostEndDate: null,
                totalEventMin: 0,
                giveawayEntry: 0,
                totalGiveawayEntry: 0,
                totalGiveawayAmount: 0,
                totalWonGiveawayAmount: 0,
                totalTextMessageAmount: 0,
                totalImageMessageAmount: 0,
                totalVideoMessageAmount: 0,
                totalEmoteMessageAmount: 0,
                totalAddReaction: 0,
                totalEventAmount: 0,
                activityStreak: 0,
                quip: "Please fill here with /quip command",
                monthlyXp: new Array(30).fill(0),
                monthlyCallMin: new Array(30).fill(0),
                monthlyEventMin: new Array(30).fill(0),
                monthlyGiveawayAmount: new Array(30).fill(0),
                monthlyWonGiveawayAmount: new Array(30).fill(0),
                monthlyTextMessageAmount: new Array(30).fill(0),
                monthlyImageMessageAmount: new Array(30).fill(0),
                monthlyVideoMessageAmount: new Array(30).fill(0),
                monthlyEmoteMessageAmount: new Array(30).fill(0),
                monthlyAddReaction: new Array(30).fill(0),
                monthlyEventAmount: new Array(30).fill(0),
                backgroundColor: "#000000",
                progressBarColor: "#7289da"
            };

            const profileWithJson = Object.fromEntries(
                Object.entries(profile).map(([key, value]) =>
                    Array.isArray(value) ? [key, JSON.stringify(value)] : [key, value]
                )
            );

            const insertUserQuery = `INSERT INTO user_profiles SET ?`;

            await connection.query(insertUserQuery, profileWithJson);

            // Yeni eklenen profil veritabanından tekrar alınmalı
            const [newRows] = await connection.execute('SELECT * FROM user_profiles WHERE id = ?', [user.id]);
            profile = newRows[0];
        }

        // Profil verilerini parse et
        const jsonFields = [
            "wonGiveawayNames",
            "customEmotes",
            "achievements",
            "monthlyXp",
            "monthlyCallMin",
            "monthlyEventMin",
            "monthlyGiveawayAmount",
            "monthlyWonGiveawayAmount",
            "monthlyTextMessageAmount",
            "monthlyImageMessageAmount",
            "monthlyVideoMessageAmount",
            "monthlyEmoteMessageAmount",
            "monthlyAddReaction",
            "monthlyEventAmount"
        ];

        for (const field of jsonFields) {
            profile[field] = JSON.parse(profile[field] || '[]');
        }

        return profile;
    } catch (error) {
        console.error('Error creating or retrieving profile:', error);
    } finally {
        if (connection) connection.release(); // Bağlantıyı serbest bırak
    }
}

//#endregion

//#region -- GIVEAWAY FUNCTIONS --

async function createGiveaway(interaction, giveawayName, giveawayDescription, giveawayCost, giveawayWinnerAmount, giveawayDate, giveawayTime, giveawayChannel, giveawayRole, minLevel, winnerMessage, giveawaybase64Image) {

    // Create an empty roles array
    let roles = [];

    roles.push(giveawayRole.id)


    let warnEmbed = new EmbedBuilder()
        .setColor('DarkRed')

    // Tarih formatını kontrol et
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/;

    if (!dateRegex.test(giveawayDate) || !timeRegex.test(giveawayTime)) {
        warnEmbed.setDescription('**The date and/or time format is incorrect. Please use YYYY-MM-DD for date and HH:MM for time.**');
        if (interaction != null) {
            await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
        }
        return;
    }
    const targetDateLocal = new Date(`${giveawayDate}T${giveawayTime}:00.000Z`);

    const targetDateUTC = new Date(targetDateLocal.getTime() - config.gmtAmount * 3600000);

    if (isNaN(targetDateUTC.getTime())) {
        warnEmbed.setDescription('**Invalid date/time combination or incorrect UTC conversion. Please enter a valid date and time.**');
        await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
        return;
    }

    const nowUTC = new Date(new Date().toISOString());
    const minimumDateUTC = new Date(nowUTC.getTime() + 5 * 60000);


    if (targetDateUTC < minimumDateUTC) {
        warnEmbed.setDescription('**The giveaway must be scheduled at least 5 minutes from now. Please set a future time.**');
        await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
        return;
    }


    let rolesString = '';
    for (const role of roles) {
        if (role) {
            if (role == guildId) {
                rolesString += `@everyone\n`;
            } else {
                rolesString += `<@&${role}>\n`;
            }
        }
    }


    try {
        let giveawayEmbed = new EmbedBuilder()
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .setTitle(giveawayName)
            .setDescription(`**${giveawayDescription}**\n\n` +
                `${minLevel ? `Min Level: **${minLevel}**\n` : ''}` +
                `Exclusive giveaway for: **${rolesString}**\n` +
                `Number of Winners: **${giveawayWinnerAmount}**\n` +
                `Giveaway ends in: **${giveawayDate} at ${giveawayTime} UTC+${config.gmtAmount} **\n\nReact to the emoticon below to join the giveaway. You will receive a confirmation dm from the bot to confirm your entry.`)
            .setColor('Blue')
            .setTimestamp()

        let attachment = null;
        let message;

        if (giveawaybase64Image) {
            const imageBuffer = Buffer.from(giveawaybase64Image, 'base64');

            attachment = new AttachmentBuilder(imageBuffer, { name: 'image.png' });

            giveawayEmbed.setImage('attachment://image.png');

            console.log('Image attached to the giveaway message.');

            message = await giveawayChannel.send({ embeds: [giveawayEmbed], files: [attachment] });
        } else {
            message = await giveawayChannel.send({ embeds: [giveawayEmbed] });
        }


        await message.react(config.giveawayEmoji);

        let newGiveaway = {
            messageId: message.id,
            name: giveawayName,
            description: giveawayDescription,
            cost: giveawayCost,
            roleId: roles,
            minLevel: minLevel,
            date: `${giveawayDate}T${giveawayTime}:00Z`,
            channelId: giveawayChannel.id,
            winnerAmount: giveawayWinnerAmount,
            winnerMessage: winnerMessage,
            winnerUser: [],
            costPayed: [],
            image: []
        };

        newGiveaway.image.push(giveawaybase64Image)

        fs.readFile(giveawayPath, async (err, data) => {
            let json = data.length ? await JSON.parse(data) : [];
            json.push(newGiveaway);

            fs.writeFile(giveawayPath, JSON.stringify(json, null, 2), (err) => {
                if (err) {
                    console.error('Error writing to file:', err);
                    const errorEmbed = new EmbedBuilder()
                        .setColor('DarkRed')
                        .setDescription('**Failed to save the giveaway data.**');
                    interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    const successEmbed = new EmbedBuilder()
                        .setColor('Green')
                        .setDescription('giveaway has been created and saved successfully!');
                    if (interaction != null) {
                        interaction.reply({ embeds: [successEmbed], ephemeral: true });
                    }
                }
            });
        });
    } catch (error) {
        console.error('Failed to send message or save giveaway:', error);
    }
}
async function changeGiveaway(interaction, giveawayName, giveawayDescription, giveawayCost, giveawayWinnerAmount, giveawayDate, giveawayTime, giveawayChannel, giveawayRole, minLevel, winnerMessage, giveawayMessageId) {
    const giveaways = await readFileFunc(giveawayPath);

    let giveaway = giveaways.find(r => r.messageId === giveawayMessageId);

    if (giveaway) {
        giveaway.name = giveawayName;
        giveaway.description = giveawayDescription;
        giveaway.cost = giveawayCost;
        giveaway.winnerAmount = giveawayWinnerAmount;
        giveaway.date = `${giveawayDate}T${giveawayTime}:00Z`;
        giveaway.channelId = giveawayChannel.id;
        giveaway.roleId[0] = giveawayRole.id;
        giveaway.minLevel = minLevel;
        giveaway.winnerMessage = winnerMessage;

        let rolesString = '';
        for (const role of giveaway.roleId) {
            if (role) {
                if (role == guildId) {
                    rolesString += `@everyone\n`;
                } else {
                    rolesString += `<@&${role}>\n`;
                }
            }
        }

        try {
            const channel = await client.channels.fetch(giveaway.channelId);
            const message = await channel.messages.fetch(giveaway.messageId);

            if (message) {
                const embeds = message.embeds;
                const oldEmbed = embeds[0];
                if (oldEmbed) {

                    // DEĞİŞKEN İSİMLERİ DEĞİŞECEK

                    let newEmbed = new EmbedBuilder(oldEmbed)
                        .setTitle(giveawayName)
                        .setDescription(`**${giveawayDescription}**\n\n` +
                            `${minLevel ? `Min Level: **${minLevel}**\n` : ''}` +
                            `Exclusive giveaway for: **${rolesString}**\n` +
                            `Number of Winners: **${giveaway.winnerAmount}**\n` +
                            `Giveaway ends in: **${giveawayDate} at ${giveawayTime} UTC+${config.gmtAmount} **\n\nReact to the emoticon below to join the giveaway. You will receive a confirmation dm from the bot to confirm your entry.`);

                    let attachment = null;

                    if (giveaway.image[0]) {
                        // base64 string'i Buffer'a çevir
                        const imageBuffer = Buffer.from(giveaway.image[0], 'base64');

                        // Buffer'ı bir dosya ekine çevir
                        attachment = new AttachmentBuilder(imageBuffer, { name: 'image.png' });

                        newEmbed.setImage('attachment://image.png');

                        await message.edit({ embeds: [newEmbed], files: [attachment] });
                    } else {
                        await message.edit({ embeds: [newEmbed] });
                    }

                }
            }

            fs.writeFileSync(giveawayPath, JSON.stringify(giveaways, null, 2));

            const warnEmbed = new EmbedBuilder()
                .setColor('Green')
                .setDescription('giveaway updated successfully.');
            if (interaction != null) {
                await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
            }
        } catch (error) {
            console.error('Failed to fetch or update the message:', error);
            const warnEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('Failed to update the giveaway message.');
            if (interaction != null) {
                await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
            }
        }
    } else {
        const warnEmbed = new EmbedBuilder()
            .setColor('Red')
            .setDescription('giveaway not');
        if (interaction != null) {
            await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
        }
    }
}
async function changeGiveawayName(interaction, giveawayMessageId, giveawayName) {
    const giveaways = await readFileFunc(giveawayPath);

    let giveaway = giveaways.find(r => r.messageId === giveawayMessageId);

    if (giveaway) {
        giveaway.name = giveawayName;

        try {
            const channel = await client.channels.fetch(giveaway.channelId);
            const message = await channel.messages.fetch(giveaway.messageId);

            let rolesString = '';
            for (const role of giveaway.roleId) {
                if (role) {
                    if (role == guildId) {
                        rolesString += `@everyone\n`;
                    } else {
                        rolesString += `<@&${role}>\n`;
                    }
                }
            }

            if (message) {
                const embeds = message.embeds;
                const oldEmbed = embeds[0];
                if (oldEmbed) {
                    const newEmbed = new EmbedBuilder(oldEmbed)
                        .setTitle(giveawayName);
                    await message.edit({ embeds: [newEmbed] });
                }
            }

            fs.writeFileSync(giveawayPath, JSON.stringify(giveaways, null, 2));

            const warnEmbed = new EmbedBuilder()
                .setColor('Green')
                .setDescription('giveaway name updated successfully.');
            await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
        } catch (error) {
            console.error('Failed to fetch or update the message:', error);
            const warnEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('Failed to update the message title.');
            await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
        }
    } else {
        const warnEmbed = new EmbedBuilder()
            .setColor('Red')
            .setDescription('giveaway not found.');
        await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
    }
}
async function changeGiveawayDescription(interaction, giveawayMessageId, giveawayDescription) {
    const giveaways = await readFileFunc(giveawayPath);

    let giveaway = giveaways.find(r => r.messageId === giveawayMessageId);

    if (giveaway) {
        giveaway.description = giveawayDescription;

        try {
            const channel = await client.channels.fetch(giveaway.channelId);
            const message = await channel.messages.fetch(giveaway.messageId);

            if (message) {
                const embeds = message.embeds;
                const oldEmbed = embeds[0];
                if (oldEmbed) {
                    let newEmbed = new EmbedBuilder(oldEmbed)
                        .setDescription(`**${giveawayDescription}**\n\n` +
                            `${giveaway.minLevel ? `Min Level: **${giveaway.minLevel}**\n` : ''}` +
                            `Exclusive giveaway for: **${rolesString}**\n` +
                            `Number of Winners: **${giveaway.winnerAmount}**\n` +
                            `Giveaway ends in: **${formattedDate} UTC+${config.gmtAmount} **\n\nReact to the emoticon below to join the giveaway. You will receive a confirmation dm from the bot to confirm your entry.`);

                    let attachment = null;

                    if (giveaway.image[0]) {
                        // base64 string'i Buffer'a çevir
                        const imageBuffer = Buffer.from(giveaway.image[0], 'base64');

                        // Buffer'ı bir dosya ekine çevir
                        attachment = new AttachmentBuilder(imageBuffer, { name: 'image.png' });

                        newEmbed.setImage('attachment://image.png');
                        await message.edit({ embeds: [newEmbed], files: [attachment] });
                    } else {
                        await message.edit({ embeds: [newEmbed] });
                    }


                }
            }

            fs.writeFileSync(giveawayPath, JSON.stringify(giveaways, null, 2));

            const warnEmbed = new EmbedBuilder()
                .setColor('Green')
                .setDescription('giveaway description updated successfully.');
            await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
        } catch (error) {
            console.error('Failed to fetch or update the message:', error);
            const warnEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('Failed to update the message description.');
            await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
        }
    } else {
        const warnEmbed = new EmbedBuilder()
            .setColor('Red')
            .setDescription('giveaway not found.');
        await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
    }
}
async function changeGiveawayDate(interaction, giveawayMessageId, giveawayDate, giveawayTime) {

    let warnEmbed = new EmbedBuilder()
        .setColor('DarkRed')

    // Tarih formatını kontrol et
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/;

    if (!dateRegex.test(giveawayDate) || !timeRegex.test(giveawayTime)) {
        warnEmbed.setDescription('**The date and/or time format is incorrect. Please use YYYY-MM-DD for date and HH:MM for time.**');
        await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
        return;
    }

    const targetDateLocal = new Date(`${giveawayDate}T${giveawayTime}:00.000Z`);
    const targetDateUTC = new Date(targetDateLocal.getTime() - config.gmtAmount * 3600000);

    if (isNaN(targetDateUTC.getTime())) {
        warnEmbed.setDescription('**Invalid date/time combination or incorrect UTC conversion. Please enter a valid date and time.**');
        await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
        return;
    }

    const nowUTC = new Date(new Date().toISOString());
    const minimumDateUTC = new Date(nowUTC.getTime() + 5 * 60000);

    if (targetDateUTC < minimumDateUTC) {
        warnEmbed.setDescription('**The giveaway must be scheduled at least 5 minutes from now. Please set a future time.**');
        await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
        return;
    }

    const giveaways = await readFileFunc(giveawayPath);

    let giveaway = await giveaways.find(r => r.messageId === giveawayMessageId);

    if (giveaway) {
        giveaway.date = `${giveawayDate}T${giveawayTime}:00Z`;

        try {
            const channel = await client.channels.fetch(giveaway.channelId);
            const message = await channel.messages.fetch(giveaway.messageId);


            const giveawayDate = new Date(giveaway.date);
            const formattedDate = giveawayDate.toISOString().replace('T', ' | ').substring(0, 18);


            let rolesString = '';
            for (const role of giveaway.roleId) {
                if (role) {
                    if (role === guildId) {
                        rolesString += `@everyone\n`;

                    } else {
                        rolesString += `<@&${role}>\n`;
                    }
                }
            }

            if (message) {
                const embeds = message.embeds;
                const oldEmbed = embeds[0];
                if (oldEmbed) {
                    let newEmbed = new EmbedBuilder(oldEmbed)
                        .setDescription(`**${giveaway.description}**\n\n` +
                            `${giveaway.minLevel ? `Min Level: **${giveaway.minLevel}**\n` : ''}` +
                            `Exclusive giveaway for: **${rolesString}**\n` +
                            `Number of Winners: **${giveaway.winnerAmount}**\n` +
                            `Giveaway ends in: **${formattedDate} UTC+${config.gmtAmount} **\n\nReact to the emoticon below to join the giveaway. You will receive a confirmation dm from the bot to confirm your entry.`);

                    let attachment = null;

                    if (giveaway.image[0]) {
                        // base64 string'i Buffer'a çevir
                        const imageBuffer = Buffer.from(giveaway.image[0], 'base64');

                        // Buffer'ı bir dosya ekine çevir
                        attachment = new AttachmentBuilder(imageBuffer, { name: 'image.png' });

                        newEmbed.setImage('attachment://image.png');

                        await message.edit({ embeds: [newEmbed], files: [attachment] });
                    } else {
                        await message.edit({ embeds: [newEmbed] });
                    }

                }
            }


            fs.writeFileSync(giveawayPath, JSON.stringify(giveaways, null, 2));

            const warnEmbed = new EmbedBuilder()
                .setColor('Green')
                .setDescription('**giveaway date updated successfully.**');
            await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
        } catch (error) {
            console.error('Failed to fetch or update the message:', error);
            const warnEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('**Failed to update the message description.**');
            await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
        }
    } else {
        const warnEmbed = new EmbedBuilder()
            .setColor('Red')
            .setDescription('**giveaway not found.**');
        await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
    }
}
async function changegiveawayWinnerAmount(interaction, giveawayMessageId, giveawayWinnerAmount) {
    const giveaways = await readFileFunc(giveawayPath);

    let giveaway = giveaways.find(r => r.messageId === giveawayMessageId);

    if (giveaway) {
        giveaway.winnerAmount = giveawayWinnerAmount;

        try {
            const channel = await client.channels.fetch(giveaway.channelId);
            const message = await channel.messages.fetch(giveaway.messageId);

            const giveawayDate = new Date(giveaway.date);
            const formattedDate = giveawayDate.toISOString().replace('T', ' | ').substring(0, 18);

            const guildId = interaction.guildId
            let rolesString = '';
            for (const role of giveaway.roleId) {
                if (role) {
                    if (role === guildId) {
                        rolesString += `@everyone\n`;

                    } else {
                        rolesString += `<@&${role}>\n`;
                    }
                }
            }

            if (message) {
                const embeds = message.embeds;
                const oldEmbed = embeds[0];
                if (oldEmbed) {
                    let newEmbed = new EmbedBuilder(oldEmbed)
                        .setDescription(`**${giveaway.description}**\n\n` +
                            `${giveaway.minLevel ? `Min Level: **${giveaway.minLevel}**\n` : ''}` +
                            `Exclusive giveaway for: **${rolesString}**\n` +
                            `Number of Winners: **${giveawayWinnerAmount}**\n` +
                            `Giveaway ends in: **${formattedDate} UTC+${config.gmtAmount}**\n\nReact to the emoticon below to join the giveaway. You will receive a confirmation dm from the bot to confirm your entry.`);

                    let attachment = null;

                    if (giveaway.image[0]) {
                        // base64 string'i Buffer'a çevir
                        const imageBuffer = Buffer.from(giveaway.image[0], 'base64');

                        // Buffer'ı bir dosya ekine çevir
                        attachment = new AttachmentBuilder(imageBuffer, { name: 'image.png' });

                        newEmbed.setImage('attachment://image.png');

                        await message.edit({ embeds: [newEmbed], files: [attachment] });
                    } else {
                        await message.edit({ embeds: [newEmbed] });
                    }

                }
            }


            fs.writeFileSync(giveawayPath, JSON.stringify(giveaways, null, 2));

            const warnEmbed = new EmbedBuilder()
                .setColor('Green')
                .setDescription('**giveaway number updated successfully.**');
            await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
        } catch (error) {
            console.error('Failed to fetch or update the message:', error);
            const warnEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('**Failed to update the message description.**');
            await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
        }
    } else {
        const warnEmbed = new EmbedBuilder()
            .setColor('Red')
            .setDescription('**giveaway not found.**');
        await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
    }
}
async function changeGiveawayChannel(interaction, giveawayMessageId, giveawayChannel) {
    const giveaways = await readFileFunc(giveawayPath);

    let giveaway = giveaways.find(r => r.messageId === giveawayMessageId);

    if (giveaway) {

        try {
            const channel = await client.channels.fetch(giveaway.channelId);
            const message = await channel.messages.fetch(giveaway.messageId);

            if (message) {
                message.delete();
            }

            const giveawayDate = new Date(giveaway.date);
            const formattedDate = giveawayDate.toISOString().replace('T', ' | ').substring(0, 18);

            let rolesString = '';
            for (const role of giveaway.roleId) {
                if (role) {
                    if (role === guildId) {
                        rolesString += `@everyone\n`;

                    } else {
                        rolesString += `<@&${role}>\n`;
                    }
                }
            }

            let giveawayEmbed = new EmbedBuilder()
                .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setTitle(giveaway.name)
                .setDescription(`**${giveaway.description}**\n\n` +
                    `${giveaway.minLevel ? `Min Level: **${giveaway.minLevel}**\n` : ''}` +
                    `Exclusive giveaway for: **${rolesString}**\n` +
                    `Number of Winners: **${giveaway.winnerAmount}**\n` +
                    `Giveaway ends in: **${formattedDate} UTC+${config.gmtAmount}**\n\nReact to the emoticon below to join the giveaway. You will receive a confirmation dm from the bot to confirm your entry.`)
                .setColor('Blue')
                .setTimestamp()

            let attachment = null;
            let newMessage;

            if (giveaway.image[0]) {
                // base64 string'i Buffer'a çevir
                const imageBuffer = Buffer.from(giveaway.image[0], 'base64');

                // Buffer'ı bir dosya ekine çevir
                attachment = new AttachmentBuilder(imageBuffer, { name: 'image.png' });

                giveawayEmbed.setImage('attachment://image.png');

                newMessage = await giveawayChannel.send({ embeds: [giveawayEmbed], files: [attachment] }).then(message => {
                    message.react(config.giveawayEmoji);
                    return message.id;
                })
            } else {
                newMessage = await giveawayChannel.send({ embeds: [giveawayEmbed] }).then(message => {
                    message.react(config.giveawayEmoji);
                    return message.id;
                })
            }

            giveaway.channelId = giveawayChannel.id;
            giveaway.messageId = newMessage;

            fs.writeFileSync(giveawayPath, JSON.stringify(giveaways, null, 2));

            const successEmbed = new EmbedBuilder()
                .setColor('Green')
                .setDescription('giveaway channel updated successfully.');
            await interaction.reply({ embeds: [successEmbed], ephemeral: true });
        } catch (error) {
            console.error('Failed to fetch or update the message:', error);
            const warnEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('Failed to update the message channel.');
            await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
        }
    } else {
        const warnEmbed = new EmbedBuilder()
            .setColor('Red')
            .setDescription('giveaway not found.');
        await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
    }
}
async function removeWinnerUser(interaction, giveawayMessageId, targetUser) {
    const giveaways = await readFileFunc(giveawayPath);

    let giveaway = await giveaways.find(r => r.messageId === giveawayMessageId);

    if (giveaway) {
        const userId = targetUser.id;
        const index = giveaway.winnerUser.findIndex(p => p.id === userId);

        if (index !== -1) {
            giveaway.winnerUser.splice(index, 1);
            fs.writeFileSync(giveawayPath, JSON.stringify(giveaways, null, 2));

            const successEmbed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Success!')
                .setDescription(`User **${targetUser.username}** has been successfully removed from the giveaway.`);

            await interaction.reply({ embeds: [successEmbed], ephemeral: true });
        } else {
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Error')
                .setDescription(`User **${targetUser.username}** is not a participant in the giveaway.`);

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    } else {
        const errorEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Error')
            .setDescription('giveaway not found.');

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}
async function addWinnerUser(interaction, giveawayMessageId, targetUser) {
    const giveaways = await readFileFunc(giveawayPath);

    let giveaway = giveaways.find(r => r.messageId === giveawayMessageId);

    if (giveaway) {
        const userName = targetUser.username;
        const userId = targetUser.id;

        const participant = {
            id: userId,
            name: userName
        };

        if (!giveaway.winnerUser.some(p => p.id === userId)) {
            giveaway.winnerUser.push(participant);

            fs.writeFileSync(giveawayPath, JSON.stringify(giveaways, null, 2));

            const successEmbed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Success!')
                .setDescription(`User **${userName}** added successfully to the giveaway!`);

            await interaction.reply({ embeds: [successEmbed], ephemeral: true });
        } else {
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Error')
                .setDescription(`This user is already a participant in the giveaway.`);

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    } else {
        const errorEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Error')
            .setDescription('giveaway not found.');

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}
async function giveawaysInfo(interaction, giveawayMessageId) {
    const giveaways = await readFileFunc(giveawayPath);

    let giveaway = await giveaways.find(r => r.messageId === giveawayMessageId);

    const giveawayDate = new Date(giveaway.date);
    const formattedDate = giveawayDate.toISOString().replace('T', ' | ').substring(0, 18);

    const names = giveaway.winnerUser.map(p => `**<@${p.id}>**`).join('\n');

    let rolesString = '';
    for (const role of giveaway.roleId) {
        if (role) {
            if (role == guildId) {
                rolesString += `@everyone\n`;
            } else {
                rolesString += `<@&${role}>\n`;
            }
        }
    }

    let giveawayEmbed = new EmbedBuilder()
        .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
        .setTitle(giveaway.name)
        .setDescription(`**${giveaway.description}**\n\n` +
            `${giveaway.minLevel ? `Min Level: **${giveaway.minLevel}**\n` : ''}` +
            `Exclusive giveaway for: **${rolesString}**\n` +
            `Number of Winners: **${giveaway.winnerAmount}**\n` +
            `Giveaway ends in: **${formattedDate}** UTC+${config.gmtAmount}\n\nReact to the emoticon below to join the giveaway. You will receive a confirmation dm from the bot to confirm your entry.\n` +
            `\n-----------------------------------------\n` +
            `-Only administrators can see this part-\n` +
            `\nwinnerUser:\n${names}`)
        .setColor('Blue');

    let attachment = null;

    if (giveaway.image[0]) {
        // base64 string'i Buffer'a çevir
        const imageBuffer = Buffer.from(giveaway.image[0], 'base64');

        // Buffer'ı bir dosya ekine çevir
        attachment = new AttachmentBuilder(imageBuffer, { name: 'image.png' });

        giveawayEmbed.setImage('attachment://image.png');

        interaction.reply({ embeds: [giveawayEmbed], files: [attachment], ephemeral: true })
    } else {
        interaction.reply({ embeds: [giveawayEmbed], ephemeral: true })
    }

}
async function deleteGiveaway(interaction, giveawayMessageId) {
    const giveaways = await readFileFunc(giveawayPath);

    const giveaway = giveaways.find(r => r.messageId === giveawayMessageId);

    if (giveaway) {
        const channel = await client.channels.fetch(giveaway.channelId);
        const message = await channel.messages.fetch(giveaway.messageId);

        if (message) {
            message.delete();
        }

        const newGiveaways = giveaways.filter(r => r.messageId !== giveawayMessageId);

        fs.writeFileSync(giveawayPath, JSON.stringify(newGiveaways, null, 2));

        const successEmbed = new EmbedBuilder()
            .setColor('Green')
            .setDescription('giveaway has been successfully deleted.');

        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    } else {
        const errorEmbed = new EmbedBuilder()
            .setColor('Red')
            .setDescription('giveaway not found.');

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}
async function giveawayList(interaction) {
    const giveaways = await readFileFunc(giveawayPath);

    let i = 0;

    const giveawayList = giveaways.map(giveaway => {
        const giveawayDate = new Date(giveaway.date);
        const formattedDate = giveawayDate.toISOString().replace('T', ' | ').substring(0, 18);
        i++;
        return {
            name: `${i}#  ${giveaway.name}  -  Ends at: ${formattedDate} UTC+${config.gmtAmount}`,
            value: giveaway.description
        };
    });

    let giveawayEmbed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Giveaway List')
        .setTimestamp();

    if (giveawayList.length === 0) {
        giveawayEmbed.setDescription('No active giveaways found.');
    } else {
        giveawayEmbed.addFields(giveawayList);
    }

    await interaction.reply({ embeds: [giveawayEmbed], ephemeral: true });

}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function loop() {


    let giveaways = await readFileFunc(giveawayPath);

    const nowUTC = new Date();


    //#region -- BOOST FUNCTIONS --

    async function updateBoosts() {

        let connection = null;

        try {
            connection = await pool.getConnection();
            const nowUTC = new Date();
            // Kullanıcı profillerini getir
            const [profiles] = await connection.query(`
                SELECT id, boost, boostEndDate
                FROM user_profiles
            `);

            const updatePromises = profiles.map(async (profile) => {
                const boostEndDate = new Date(profile.boostEndDate);
                const boostValue = profile?.boost || 1;

                if (boostEndDate && boostEndDate <= nowUTC) {
                    let newBoost = boostValue - 4;
                    if (newBoost < 0) {
                        newBoost = 1;
                    }

                    await connection.query(`
                        UPDATE user_profiles
                        SET boost = ?, boostEndDate = NULL
                        WHERE id = ?
                    `, [newBoost, profile.id]);
                }
            });

            // Güncellemeleri işle
            await Promise.all(updatePromises);

        } catch (error) {
            console.error('Hata:', error);
        } finally {
            if (connection) {
                // Bağlantıyı havuza geri bırak
                connection.release();
            }
        }
    }
    await updateBoosts();

    //#endregion

    //#region -- GIVEAWAY FUNCTIONS --

    for (const giveaway of giveaways) {
        const giveawayDateLocal = new Date(giveaway.date);
        const giveawayDateUTC = new Date(giveawayDateLocal.getTime() - (config.gmtAmount * 60 * 60000));

        if (giveawayDateUTC <= nowUTC) {

            try {
                let returnControl = false;
                let message;
                const channel = await client.channels.fetch(giveaway.channelId);
                try {
                    message = await channel.messages.fetch(giveaway.messageId);
                } catch (error) {
                    console.error('Failed to fetch the message:', error);
                    giveaways = giveaways.filter(r => r.messageId !== giveaway.messageId);
                    fs.writeFileSync(giveawayPath, JSON.stringify(giveaways, null, 2));
                    returnControl = true;
                    return;
                }

                if (returnControl) return;

                const reaction = message.reactions.cache.get(config.giveawayEmoji);
                const embeds = message.embeds;
                const embed = embeds[0];

                const users = await reaction.users.fetch();
                const userPoolNoFilter = users.filter(user => !user.bot).map(user => user.id);
                const winnerUsers = new Set(giveaway.winnerUser.map(participant => participant.id));
                const guild = await client.guilds.fetch(guildId);
                let userPool = []


                for (let index = 0; index < userPoolNoFilter.length; index++) {

                    const userId = userPoolNoFilter[index];
                    for (let index = 0; index < giveaway.roleId.length; index++) {

                        const roleElement = giveaway.roleId[index];

                        let user = null

                        try {
                            user = await guild.members.fetch(userId);
                            const role = guild.roles.cache.get(roleElement);

                            if (user.roles.cache.has(role.id)) {

                                var profile = await controlAndCreateProfile(user)

                                if (profile.level >= giveaway.minLevel) {

                                    let costPayedControl = true;

                                    if (!giveaway.costPayed.find(temp => temp.id === userId)) {
                                        if (profile.balance >= giveaway.cost) {
                                            profile.balance -= giveaway.cost
                                            giveaway.costPayed.push({ id: userId, amount: 1 })
                                        } else {
                                            costPayedControl = false;
                                        }
                                    }

                                    if (costPayedControl) {

                                        profile.monthlyGiveawayAmount[0] += 1
                                        profile.totalGiveawayAmount += 1
                                        addTodayXp(profile, config.giveawayExp)

                                        if (profile.totalGiveawayAmount >= profile.achievements[2].tier * achievements[2].threshold) {
                                            addTodayXp(profile, profile.achievements[2].tier * config.messageExp)
                                            profile.achievements[2].tier += 1
                                        }


                                        const nameAndDate = `${giveaway.name} - ${giveawayDateLocal.toISOString().replace('T', ' | ').substring(0, 18)}`
                                        profile.wonGiveawayNames.push(nameAndDate)

                                        await updateProfile(profile);

                                        userPool.push(userId)
                                        subsArray.forEach(sub => {
                                            if (sub.users.includes(userId)) {
                                                for (let i = 0; i < sub.giveawayEntry; i++) {
                                                    userPool.push(userId);
                                                }
                                            }
                                        });
                                    }
                                }
                            }
                        } catch (error) {

                        }


                    }
                }

                for (let index = 0; index < giveaway.costPayed.length; index++) {
                    const userId = giveaway.costPayed[index].id;
                    if (!userPool.includes(userId)) {
                        var profile = await findSQL(userId)
                        profile.balance += parseInt(giveaway.cost)
                        giveaway.costPayed.filter(element => element.id !== userId)
                    }
                }

                for (let i = 0; i < giveaway.costPayed.length; i++) {
                    const amount = giveaway.costPayed[i].amount;
                    for (let j = 1; j < amount; j++) {
                        const userId = giveaway.costPayed[i].id;
                        userPool.push(userId)
                    }
                }

                await updateProfile(profile);

                let availableSlots = giveaway.winnerAmount - winnerUsers.size;
                while (availableSlots > 0 && userPool.length > 0) {
                    const randomIndex = Math.floor(Math.random() * userPool.length);
                    const potentialWinner = userPool.splice(randomIndex, 1)[0];
                    try {
                        await guild.members.fetch(potentialWinner);
                    } catch (error) {
                        continue;
                    }

                    winnerUsers.add(potentialWinner);

                    availableSlots--;
                }

                const winnersArray = Array.from(winnerUsers);
                shuffleArray(winnersArray);

                giveaway.winners = winnersArray;

                const names = giveaway.winners.map(p => ` 🎁 **<@${p}>**`).join('\n');



                giveaway.winners.forEach(async winner => {

                    var profile = await findSQL(winner)
                    profile.monthlyWonGiveawayAmount[0] += 1
                    profile.totalWonGiveawayAmount += 1

                    const userDm = await client.users.fetch(winner)

                    const dmEmbed = new EmbedBuilder()
                        .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setTitle(`🎉 Congratulations! 🎉`)
                        .setDescription(`${giveaway.winnerMessage} `)
                        .setColor('Green')
                        .setTimestamp();

                    await userDm.send({ embeds: [dmEmbed] });

                    await updateProfile(profile);

                });



                const winnerEmbed = new EmbedBuilder()
                    .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setTitle(`${giveaway.name}`)
                    .setDescription(`\n**🎉 Winners: 🎉** \n\n${names}`)
                    .setColor('Green')
                    .setTimestamp();

                await channel.send({ embeds: [winnerEmbed] });

                const newTitle = `${embed.title} - (Expired)`;

                const updatedEmbed = new EmbedBuilder(embed)
                    .setTitle(newTitle)
                    .setTimestamp();

                await message.edit({ embeds: [updatedEmbed] });

                giveaways = giveaways.filter(r => r.messageId !== giveaway.messageId);
                fs.writeFileSync(giveawayPath, JSON.stringify(giveaways, null, 2));
            } catch (error) {
                console.error('Bir hata oluştu:', error);
            }

        }
    }

    //#endregion
}

//#endregion

//#region --CURRENCY FUNCTIONS--

class ShopItem {
    constructor(name, price, description, imageBase64, type, roleId) {
        this.id = uuidv4()
        this.name = name
        this.price = price
        this.description = description
        this.imageBase64 = [imageBase64]
        this.type = type
        this.codes = []
        this.roleId = roleId
    }
}
async function editItem(interaction, itemId, name, price, description, imageBase64, type, roleId, code) {

    const shopData = await readFileFunc(shopPath)
    const item = shopData.find(item => item.id === itemId)

    if (item) {

        if (name) {
            item.name = name
        }
        if (price) {
            item.price = price
        }
        if (description) {
            item.description = description
        }
        if (imageBase64) {
            item.imageBase64 = imageBase64
        }
        if (type) {
            item.type = type
        }
        if (roleId) {
            item.roleId = roleId
        }
        if (code[0]) {
            item.codes = code
        }

        fs.writeFileSync(shopPath, JSON.stringify(shopData, null, 2));
    }
}
async function AddItem(interaction, name, price, description, imageBase64, type, roleId, code) {
    const shopData = await readFileFunc(shopPath)

    if (type === "code") {
        const newItem = new ShopItem(name, price, description, imageBase64, type, null)
        shopData.push(newItem)
        fs.writeFileSync(shopPath, JSON.stringify(shopData, null, 2))


        if (interaction == null) {
            const codeArray = code.split("##")
                .map(code => code.trim()) // Trim each individual code
                .filter(code => code.length > 0); // Remove any empty codes
            const shopData = await readFileFunc(shopPath)
            const item = shopData.find(item => item.id === newItem.id)
            if (item) {
                item.codes = codeArray
            }
            fs.writeFileSync(shopPath, JSON.stringify(shopData, null, 2))
        } else {
            const modal = new ModalBuilder()
                .setCustomId(`myModal_${newItem.id}`)
                .setTitle('My Modal');
            const textArea = new TextInputBuilder()
                .setCustomId('codes')
                .setLabel("Wrtie ## between each code")
                .setPlaceholder('Write your code here')
                .setStyle(TextInputStyle.Paragraph);

            const firstActionRow = new ActionRowBuilder().addComponents(textArea)
            modal.addComponents(firstActionRow)
            await interaction.showModal(modal)
        }

        return
    } else if (type === "role") {
        const item = new ShopItem(name, price, description, imageBase64, type, roleId)
        shopData.push(item)
        fs.writeFileSync(shopPath, JSON.stringify(shopData, null, 2))
    } else if (type === "other") {
        const item = new ShopItem(name, price, description, imageBase64, type, null)
        shopData.push(item)
        fs.writeFileSync(shopPath, JSON.stringify(shopData, null, 2))
    }

    const embed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(`**${name}** has been added to the shop.`)

    // Paragraph means multiple lines of text.

    if (interaction != null) {
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}
async function ChangeName(interaction, itemId, newName) {
    var shopData = await readFileFunc(shopPath)
    var item = shopData.find(item => item.id === itemId)
    item.name = newName
    fs.writeFileSync(shopPath, JSON.stringify(shopData, null, 2))
    const embed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(`Name of **${item.name}** has been updated to **${newName}**.`)
    if (interaction != null) {
        await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
        //web response
    }
}
async function ChangeDescription(interaction, itemId, newDescription) {
    var shopData = await readFileFunc(shopPath)
    var item = shopData.find(item => item.id === itemId)
    item.description = newDescription
    fs.writeFileSync(shopPath, JSON.stringify(shopData, null, 2))
    const embed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(`Description of **${item.name}** has been updated to **${newDescription}**.`)
    if (interaction != null) {
        await interaction.reply({ embeds: [embed], ephemeral: true });

    } else {
        //web response
    }
}
async function ChangePrice(interaction, itemId, newPrice) {
    var shopData = await readFileFunc(shopPath)
    var item = shopData.find(item => item.id === itemId)
    item.price = newPrice
    fs.writeFileSync(shopPath, JSON.stringify(shopData, null, 2))
    const embed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(`Price of **${item.name}** has been updated to **${newPrice}** coins.`)
    if (interaction != null) {
        await interaction.reply({ embeds: [embed], ephemeral: true });

    } else {
        //web response
    }
}
async function Reward(member, amount, interaction, reason) {

    var profile = await controlAndCreateProfile(member)

    profile.balance += amount
    await updateProfile(profile);

    if (reason) {
        const user = await client.users.fetch(member.id)
        const dmChannel = await user.createDM();
        const embed2 = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`You have received **${amount}** coins from ${interaction.user.username}.\n\nReason: **${reason}**\nYour new balance is **${profile.balance}** coins.`)
        await dmChannel.send({ embeds: [embed2] });
    }

    if (interaction != null) {
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`**${amount}** coins have been added to **${member.user.username}**'s account.`);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}
async function Buy(user, item, interaction,) {
    var shopData = await readFileFunc(shopPath)
    item = shopData.find(itemToBuy => item === itemToBuy.id)

    const profile = await controlAndCreateProfile(user)

    if (interaction != null) {
        if (profile.balance >= item.price) {
            profile.balance -= item.price
            await updateProfile(profile);
            const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`**${item.name}** has been purchased successfully.`)
            await interaction.reply({ embeds: [embed], ephemeral: true });

            const dmChannel = await user.createDM();
            const embed2 = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`You have successfully purchased **${item.name}**.\nYour new balance is **${profile.balance}** coins.`)

            const currencyHistory = await readFileFunc(currencyHistoryPath)
            const guild = await client.guilds.fetch(guildId)
            const sendChannelId = await readFileFunc(channelIdPath)
            var channel = guild.channels.cache.get(sendChannelId.channelId);

            if (!channel) {
                const adminRole = guild.roles.cache.find(role => role.permissions.has("Administrator"));
                if (!adminRole) {
                    console.log('No admin role found.');
                    return null;
                }

                // If the channel doesn't exist, create a new one with permissions for admins only
                try {
                    const newChannel = await guild.channels.create({
                        name: "currency-history",
                        type: ChannelType.GuildText,
                        permissionOverwrites: [
                            {
                                id: guild.id, // This is the @everyone role
                                deny: ["ViewChannel"], // Deny access to everyone
                            },
                            {
                                id: adminRole.id, // This is the admin role
                                allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"], // Allow access to admins
                            },
                        ],
                        reason: 'Channel did not exist, so it was created for admins only',
                    });
                    console.log(`Created new admin-only channel: ${newChannel.name} with ID: ${newChannel.id}`);
                    channel = newChannel;
                    await writeFileFunc(channelIdPath, { channelId: channel.id })
                } catch (error) {
                    console.error(`Error creating channel: ${error}`);
                }
            }
            if (item.type === "code") {
                const newHistory = {
                    userId: user.id,
                    username: user.username,
                    amount: item.price,
                    date: new Date(),
                    type: "code",
                    reason: `Purchased ${item.name}`,
                    item: item.codes[0]
                }
                embed2.setDescription(`You have successfully purchased **${item.name}**.\n\nHere is your code: **${item.codes[0]}**\nYour new balance is **${profile.balance}** coins.`)
                item.codes.shift()
                if (item.codes.length === 0) {
                    shopData = shopData.filter(itemToDel => itemToDel.id !== item.id)
                }
                currencyHistory.push(newHistory)
                await writeFileFunc(currencyHistoryPath, currencyHistory)

                const embed3 = new EmbedBuilder()
                    .setColor('Green')
                    .setDescription(`**Customer**: ${userMention(newHistory.userId)} \n **Purchased** :${newHistory.item} code \n**Price:** ${item.price} coins.`)
                    .setTimestamp();
                await channel.send({ embeds: [embed3] });

            } else if (item.type === "role") {
                const role = await interaction.guild.roles.fetch(item.roleId)
                const member = await interaction.guild.members.fetch(user.id)
                await member.roles.add(role)
                const newHistory = {
                    userId: user.id,
                    username: user.username,
                    amount: item.price,
                    date: new Date(),
                    type: "role",
                    reason: `Purchased ${item.name}`,
                    item: role.name
                }
                currencyHistory.push(newHistory)
                await writeFileFunc(currencyHistoryPath, currencyHistory)
                const embed3 = new EmbedBuilder()
                    .setColor('Green')
                    .setDescription(`**Customer** : ${userMention(newHistory.userId)}\n **Item**: ${newHistory.item} role \n**Price**: ${item.price} coins.`)
                    .setTimestamp();
                await channel.send({ embeds: [embed3] });

            } else if (item.type === "other") {
                const newHistory = {
                    userId: user.id,
                    username: user.username,
                    amount: item.price,
                    date: new Date(),
                    type: "other",
                    reason: `Purchased ${item.name}`,
                    item: item.name
                }
                currencyHistory.push(newHistory)
                await writeFileFunc(currencyHistoryPath, currencyHistory)
                const embed3 = new EmbedBuilder()
                    .setColor('Green')
                    .setDescription(`**Customer** : ${userMention(newHistory.userId)}\n **Item**: ${newHistory.item} \n**Price**: ${item.price} coins.`)
                    .setTimestamp();
                await channel.send({ embeds: [embed3] });

            }
            await dmChannel.send({ embeds: [embed2] });
            writeFileFunc(shopPath, shopData)
        } else {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`You do not have enough coins to purchase **${item.name}**.`)
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    } else {
        //web response
    }
}
async function RemoveItem(interaction, itemId) {
    var shopData = await readFileFunc(shopPath)
    shopData = shopData.filter(item => item.id !== itemId)
    fs.writeFileSync(shopPath, JSON.stringify(shopData, null, 2))
    if (interaction != null) {
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`Item removed successfully.`)
        await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
        //web response
    }
}
//#endregion

//#region --BLACKLİST FUNCTIONS--

async function AddBlacklist(interaction, word) {
    const blacklist = await readFileFunc(blacklistPath)
    blacklist.push(word)
    fs.writeFileSync(blacklistPath, JSON.stringify(blacklist, null, 2))
    const embed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(`**${word}** has been added to the blacklist.`)
    if (interaction != null) {
        await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
        //web response
    }
}

async function RemoveBlacklist(interaction, word) {
    const blacklist = await readFileFunc(blacklistPath)
    const newBlacklist = blacklist.filter(item => item !== word)
    fs.writeFileSync(blacklistPath, JSON.stringify(newBlacklist, null, 2))
    const embed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(`**${word}** has been removed from the blacklist.`)
    if (interaction != null) {
        await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
        //web response
    }
}

//#endregion

//#region --FUNCTIONS-- 

async function GetGuildInfo(guild) {

    const logoImageUrl = guild.iconURL({ format: 'png', size: 4096 }) ? guild.iconURL({ format: 'png', size: 4096 }) : 'https://cdn.discordapp.com/embed/avatars/0.png';
    const bannerImageUrl = guild.bannerURL({ format: 'png', size: 4096 }) ? guild.bannerURL({ format: 'png', size: 4096 }) : null;
    const totalMembers = guild.memberCount ? guild.memberCount : 0;
    let onlineMembers = 0;
    guild.members.cache.forEach(member => {
        if (member.presence && (member.presence.status !== 'offline')) {
            onlineMembers++;
        }
    });
    const guildName = guild.name ? guild.name : 'Unknown Guild Name';
    const guildUrl = `https://discord.com/channels/${guild.id}`;

    return { logoImageUrl, bannerImageUrl, totalMembers, onlineMembers, guildName, guildUrl };
}

//#endregion


//#region ---------| CONFIG |---------


async function readFileFunc(path) {
    try {
        const jsonStr = await fs.promises.readFile(path, 'utf8');
        try {
            return JSON.parse(jsonStr);
        } catch (err) {
            console.error('JSON parsing error, attempting to fix:', err.message);
            const fixedData = fixJson(jsonStr);
            await writeFileFunc(path, fixedData);
            return fixedData;
        }
    } catch (err) {
        console.error('Error reading file:', err);
    }
}

async function writeFileFunc(path, data) {
    try {
        await fs.promises.writeFile(path, JSON.stringify(data, null, 2));
        console.log('File successfully written.');
    } catch (err) {
        console.error('Error writing file:', err);
    }
}
async function GetValues() {
    try {
        var data = fs.readFileSync(configPath, "utf8")
        return JSON.parse(data)
    } catch (err) {
        console.error(err)
    }
}
function SetValues(jsonData) {
    try {
        const messageExp = parseInt(jsonData.messageXp);
        const photoExp = parseInt(jsonData.photoXp);
        const videosExp = parseInt(jsonData.videoXp);
        const emoteExp = parseInt(jsonData.emoteXp);
        const callExp = parseInt(jsonData.callXp);
        const eventExp = parseInt(jsonData.eventXp);
        const messageWait = parseInt(jsonData.messageXpWaitDurationSecond);
        const photoWait = parseInt(jsonData.photoXpWaitDurationSecond);
        const levelUpXp = parseInt(jsonData.levelUpXp);
        const callXpWaitDurationMin = parseInt(jsonData.callXpWaitDurationMin);
        const gmtAmount = parseInt(jsonData.gmtAmount);
        const addReactionExp = parseInt(jsonData.addReactionExp);

        const giveawayEmoji = jsonData.giveawayEmoji;

        if (isNaN(messageExp) || isNaN(photoExp) || isNaN(callExp) || isNaN(messageWait) || isNaN(levelUpXp) || isNaN(callXpWaitDurationMin)) {
            throw new Error('One or more values are not numbers');
        }

        return { gmtAmount, giveawayEmoji, messageExp, photoExp, callExp, messageWait, photoWait, levelUpXp, callXpWaitDurationMin, emoteExp, videosExp, eventExp, addReactionExp };

    } catch (err) {
        console.error(err)
    }
}
async function newValues(valueName, value) {
    try {
        var jsonData = await GetValues()
        jsonData[valueName] = value
        fs.writeFileSync
            (configPath, JSON.stringify(jsonData, null, 2))
        jsonData = await GetValues()
        SetValues(jsonData)

    }
    catch (err) {
        console.error(err)
    }
}
function updateEnvFile(filePath, updates) {
    const envConfig = readEnvFile(filePath);

    for (const key in updates) {
        envConfig[key] = updates[key];
    }

    const updatedContent = Object.entries(envConfig)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    fs.writeFileSync(filePath, updatedContent);
}
function readEnvFile(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return dotenv.parse(fileContent);
}

process.on('uncaughtException', error => {
    console.error('Error: ', error);
});

const httpsServer = https.createServer(options, app);
httpsServer.listen(8080, () => {
    console.log('HTTPS Server running on port 443');
})



client.login(TOKEN);

//#endregion

//#endregion

//#endregion

//#endregion ---------------------------------------
