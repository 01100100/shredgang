import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
    render() {
        return (
            <Html>
                <Head>
                    <script
                        defer
                        src="/stats.js"
                        data-website-id="594da294-d5ae-4dc2-837a-811a49afed78"
                        data-host-url="https://stats.shredgang.cc"
                    ></script>
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;