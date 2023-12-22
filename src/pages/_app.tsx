// src/app/_app.tsx
import { AppProps } from 'next/app';
import { getDatabase } from '@/lib/sqlite';

function MyApp({ Component, pageProps }: AppProps) {
    // Ensure the database is initialized when the app starts
    getDatabase();

    return <Component {...pageProps} />;
}

export default MyApp;
