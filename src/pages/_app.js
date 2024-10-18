import '../css/main.css';

import HeartBackground from '../components/HeartBackground';

function MyApp({ Component, pageProps }) {
    return (
        <>
            <HeartBackground />
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;