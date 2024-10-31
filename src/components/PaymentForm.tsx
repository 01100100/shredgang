// import React, { useState } from 'react';
// import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// const PaymentForm = ({ totalAmount }) => {
//     const stripe = useStripe();
//     const elements = useElements();
//     const [error, setError] = useState(null);
//     const [loading, setLoading] = useState(false);

//     const handleSubmit = async (event) => {
//         event.preventDefault();
//         setLoading(true);

//         const { error, paymentMethod } = await stripe.createPaymentMethod({
//             type: 'card',
//             card: elements.getElement(CardElement),
//         });

//         if (error) {
//             setError(error.message);
//             setLoading(false);
//             return;
//         }

//         const response = await fetch('/api/checkout_sessions', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ paymentMethodId: paymentMethod.id, amount: totalAmount }),
//         });

//         const session = await response.json();

//         if (session.error) {
//             setError(session.error);
//             setLoading(false);
//             return;
//         }

//         const { error: confirmError } = await stripe.confirmCardPayment(session.client_secret);

//         if (confirmError) {
//             setError(confirmError.message);
//             setLoading(false);
//             return;
//         }

//         setLoading(false);
//         alert('Payment successful!');
//     };

//     return (
//         <form onSubmit={handleSubmit}>
//             <CardElement />
//             {error && <div>{error}</div>}
//             <button type="submit" disabled={!stripe || loading}>
//                 {loading ? 'Processing...' : 'Pay Now'}
//             </button>
//         </form>
//     );
// };

// export default PaymentForm;