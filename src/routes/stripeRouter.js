import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
const usersFilePath = path.join('src/data/users.json');


dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.get('/checkout', (req, res) => {
  res.render('checkout', { user: req.session.user || null })});
;

router.post('/create-checkout-session', async (req, res) => {
const priceId = req.body.priceId;
const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
const price = await stripe.prices.retrieve(priceId);

if (!price.product) {
  return res.status(400).json({ error: 'No product found for the given price ID' });
}

// Retrieve the product object using the product ID
const product = await stripe.products.retrieve(price.product);
const metadata = product.metadata;
const customerId = users.find(u => u.discordId === req.session.user.id).stripeCustomerId;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [
        {
          price: priceId, // Replace with your actual price ID
          quantity: 1
        },
      ],
      payment_intent_data: {
        metadata:metadata
      },
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/payments?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get('host')}/payments?session_id={CHECKOUT_SESSION_ID}`,
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/create-subscription-session', async (req, res) => {
  try {
    const priceId = req.body.priceId;
    const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    const customerId = users.find(u => u.discordId === req.session.user.id).stripeCustomerId;
    const origin = req.headers.referer;
    req.session.origin = origin; // Save the origin URL in the session
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
    });
    const existingSubscription = subscriptions.data.find(subscription => 
      subscription.items.data.some(item => item.price.id === priceId)
    );
    if (existingSubscription) {
      return res.status(400).json({ error: 'You already have an active subscription to this product' }) ;
    }


    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [
        {
          price: priceId, // Replace with your actual price ID
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.protocol}://${req.get('host')}/payments?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get('host')}/payments?session_id={CHECKOUT_SESSION_ID}`,
    });
    
    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

//If needed, you can add a success and cancel route to redirect the user back to the original page
/* router.get('/success', (req, res) => {
  const state = req.query.origin
  res.redirect(state);
});

router.get('/cancel', (req, res) => {
  const state = req.query.origin
  console.log(state)
  res.redirect(state);
}); */

export default router;