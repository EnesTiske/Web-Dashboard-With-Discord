import express from 'express';
import axios from 'axios';
import { URLSearchParams } from 'url';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import Stripe from 'stripe';
dotenv.config();
const router = express.Router();
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "https://nexusvault.net/api/auth/discord/callback";
const pathToUsers = path.join("src/data/users.json")
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


router.get("/login", (req, res) => {
  const state = req.headers.referer;  // Save the referer to redirect back after auth
  const authUrl = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify+email&state=${encodeURIComponent(state)}`;
  res.redirect(authUrl);
});

router.get("/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    res.redirect("/")
    return;
  }

  const formData = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "authorization_code",
    code: code,
    redirect_uri: REDIRECT_URI,
  });

  try {
    const tokenResponse = await axios.post("https://discord.com/api/oauth2/token", formData.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const accessToken = tokenResponse.data.access_token;
    const userResponse = await axios.get("https://discord.com/api/v10/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (userResponse.data) {
      req.session.user = userResponse.data;
    }
    // Here you can store the user info in a session or database as needed
    try {
      var data = fs.readFileSync(pathToUsers, "utf8")
    } catch (err) {
      console.error(err)
    }
    const users = JSON.parse(data)
    var user = users.find(user => user.discordId === userResponse.data.id);
    if (!user) {
      const customer = await stripe.customers.create({
        email: userResponse.data.email,
        name: userResponse.data.username,
      });
      user = {
        discordId: req.session.user.id,
        subscriptionStatus: 'inactive',
        stripeCustomerId: customer.id,
        subscriptionId: '',
      };

      users.push(user);
      try {
        fs.writeFileSync(pathToUsers, JSON.stringify(users, null, 2));
      } catch (writeError) {
        console.error('Error writing to users file:', writeError);
        return res.status(500).send('Internal Server Error');
      }
    }
    console.log('User info:', userResponse.data);
    // Redirect back to the original page
    res.redirect(state || '/');
  } catch (error) {
    console.error('Error during token exchange or fetching user info:', error.response ? error.response.data : error.message);
    res.status(500).send('Authentication failed');
  }
});

export default router;
