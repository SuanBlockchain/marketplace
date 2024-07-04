import '@suan//styles/globals.css';
import { MeshProvider } from '@meshsdk/react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import NextNProgress from 'nextjs-progressbar';
import { NotificationContextProvider } from '@suan//store/notification-context';
import { ProjectInfoContextProvider } from '@suan//store/projectinfo-context';
import { WalletContextProvider } from '@marketplaces/utils-2';
import { LoginFromContextProvider } from '@suan//store/login-from';
import '../styles/globals.css';
import { Toaster } from 'sonner';
import { MyAppProps } from '@suan/components/common/types';
import { Layouts } from '@suan/components/common/Layouts';
import TelegramFloatingButton from '@suan//components/TelegramFloatingButton';
import { Amplify } from 'aws-amplify';

import config from '../src/aws-exports';
import Script from 'next/script';

Amplify.configure(config);

function MyApp({ Component, pageProps }: MyAppProps) {
  const Layout = Layouts[Component.Layout] ?? ((page) => page);
  const router = useRouter();

  useEffect(() => {}, [router.pathname]);

  return (
    <MeshProvider>
      <Head>
        <title>Cuadro de mando Inversionista-Terrasacha</title>
        <meta
          name="description"
          //content="Cuadro de mando de Inversionista en Suan"
          content="Cuadro de mando de Inversionista en Terrasacha"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <LoginFromContextProvider>
        <NotificationContextProvider>
          <WalletContextProvider>
            <ProjectInfoContextProvider>
              <div>
                <NextNProgress
                  color="#69A1B3"
                  startPosition={0.3}
                  stopDelayMs={200}
                  height={4}
                  showOnShallow={true}
                  options={{ easing: 'ease', speed: 500 }}
                />
                <Layout>
                  <Component {...pageProps} />
                  <TelegramFloatingButton></TelegramFloatingButton>
                </Layout>
                <Toaster richColors></Toaster>
              </div>
            </ProjectInfoContextProvider>
          </WalletContextProvider>
        </NotificationContextProvider>
      </LoginFromContextProvider>
    </MeshProvider>
  );
}
export default MyApp;
