import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-09-30.acacia',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { items } = req.body;

            // Calculate total amount
            const amount = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0) * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency: 'eur',
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                    cart: JSON.stringify(items),
                },
            });

            res.status(200).json({ clientSecret: paymentIntent.client_secret });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}