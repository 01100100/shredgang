import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import CheckoutForm from './CheckoutForm';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Initialize Stripe outside of a component to avoid recreating on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const Cart: React.FC = () => {
    const { cart, dispatch } = useCart();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isCheckout, setIsCheckout] = useState<boolean>(false);

    // Calculate total amount
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Function to initiate checkout by creating a Payment Intent
    const initiateCheckout = async () => {
        try {
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items: cart }),
            });

            const data = await response.json();

            if (data.error) {
                console.error('Error creating Payment Intent:', data.error);
                return;
            }

            if (!data.clientSecret) {
                console.error('Client Secret not found in response:', data);
                return;
            }

            setClientSecret(data.clientSecret);
            setIsCheckout(true);
        } catch (error) {
            console.error('Error initiating checkout:', error);
        }
    };

    return (
        <div className="cart">
            <h2>Basket 🛒</h2>
            {cart.map((item) => (
                <div key={item.id} className="cart-item">
                    <span>{item.title}</span>
                    <span>{item.quantity}</span>
                    <span>€{(item.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item })}>
                        Remove
                    </button>
                </div>
            ))}
            <div className="cart-total">
                <span>Total: €{total.toFixed(2)}</span>
            </div>
            {!isCheckout ? (
                <button
                    onClick={initiateCheckout}
                    className="sb-component sb-component-block sb-component-button sb-component-button-secondary sb-component-button-icon"
                >
                    <span className="p-2">Proceed to Checkout</span>
                </button>
            ) : (
                clientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutForm clientSecret={clientSecret} />
                    </Elements>
                )
            )}
        </div>
    );
};

export default Cart;