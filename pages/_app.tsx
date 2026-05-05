import type { AppProps } from "next/app";
import "@/app/globals.css";
import { ServiceWorkerRegister } from "@/app/ServiceWorkerRegister";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ServiceWorkerRegister />
      <Component {...pageProps} />
    </>
  );
}
