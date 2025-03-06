import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { preload } from 'react-dom';
import { BASE_PATH } from '@/lib/utils';
import ProgressProvider from './ProgressBar';
import { SITE_NAME, APP_URL, present } from '@/lib/utils';
import "./globals.css";

if (!APP_URL) {
  throw new Error('Missing APP_URL.');
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const metadata: Metadata = {
  title: {
    template: `%s - ${SITE_NAME}`,
    default: SITE_NAME,
  },
  description: '遊蕩犬相關資料圖表，整理來自政府等來源的公開資料，包括各縣市數量統計、公立收容所出入狀況、熱區餵養數字等，提供選項操作並視覺化，也可以輸出表格',
  metadataBase: new URL(APP_URL),
};

const googleVerificationCode = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFY;

if (present(googleVerificationCode)) {
  metadata.verification = {
    google: googleVerificationCode,
  }
}

export { metadata };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  preload(`${BASE_PATH}/assets/GeistMonoDigits.woff2`, { as: 'font' });
  preload(`${BASE_PATH}/assets/BootleqSpace.woff2`, { as: 'font' });

  return (
    <html lang="zh-TW">
      <body
        className={`${geistSans.variable} antialiased`}
      >
        <ProgressProvider>
          {children}
        </ProgressProvider>
      </body>
    </html>
  );
}
