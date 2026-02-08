import Head from "next/head";
import NextWidget from "../components/NextWidget";

export default function Home() {
  return (
    <>
      <Head>
        <title>Next.js Remote App</title>
        <meta name="description" content="Next.js remote micro-frontend app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '960px', margin: '0 auto' }}>
        <h1>▲ Next.js Remote App</h1>
        <p>This is the standalone Next.js remote app running on port 5003.</p>
        <NextWidget />
      </div>
    </>
  );
}
