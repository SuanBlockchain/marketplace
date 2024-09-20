import '@cauca//styles/globals.css';
/* import { MeshProvider } from '@meshsdk/react'; */
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import NextNProgress from 'nextjs-progressbar';
import { NotificationContextProvider } from '@cauca//store/notification-context';
import { ProjectInfoContextProvider } from '@cauca//store/projectinfo-context';
import { WalletContextProvider } from '@marketplaces/utils-2';
import { LoginFromContextProvider } from '@cauca//store/login-from';
import '../styles/globals.css';
import { Toaster } from 'sonner';
import { MyAppProps } from '@cauca/components/common/types';
import { Layouts } from '@cauca/components/common/Layouts';
import TelegramFloatingButton from '@cauca//components/TelegramFloatingButton';
import { Amplify } from 'aws-amplify';

import config from '../src/aws-exports';
import Script from 'next/script';
import { MeshProvider } from '@meshsdk/react';

Amplify.configure(config);

function MyApp({ Component, pageProps }: MyAppProps) {
  const Layout = Layouts[Component.Layout] ?? ((page) => page);
  const router = useRouter();

  useEffect(() => {}, [router.pathname]);

  return (
    <>
      <Head>
        <title>Cuadro de mando Inversionista - Suan</title>
        <meta
          name="description"
          content="Cuadro de mando de Inversionista en Suan"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <LoginFromContextProvider>
        <NotificationContextProvider>
        <MeshProvider>
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
        </MeshProvider>
        </NotificationContextProvider>
      </LoginFromContextProvider>
      </>
  );
}
export default MyApp;
