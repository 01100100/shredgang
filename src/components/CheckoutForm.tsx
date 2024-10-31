import React, { useEffect, useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

const CheckoutForm = ({ clientSecret }: { clientSecret: string }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements) {
            return;
        }

        setLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/success`,
            },
        });

        if (error) {
            console.error(error.message);
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            <button
                type="submit"
                disabled={!stripe || loading}
                className="sb-component sb-component-block sb-component-button sb-component-button-primary"
            >
                {loading ? 'Processing...' : 'Pay Now'}
            </button>
        </form>
    );
};

export default CheckoutForm;