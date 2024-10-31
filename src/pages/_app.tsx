import '../css/main.css';
import { AppProps } from 'next/app';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CartProvider } from '../context/CartContext';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <Elements stripe={stripePromise}>
        <Component {...pageProps} />
      </Elements>
    </CartProvider>
  );
}

export default MyApp;