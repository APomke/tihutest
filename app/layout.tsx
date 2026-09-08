import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pelican-test-gallery.lidongaws.chatgpt.site'),
  title: '鹈鹕测试馆 — AI 测试结果公共展厅',
  description: '浏览、比较并投票选择你最喜欢的 AI 鹈鹕测试结果。',
  openGraph: {
    title: '鹈鹕测试馆',
    description: 'AI 测试结果公共展厅',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '鹈鹕测试馆',
    description: 'AI 测试结果公共展厅',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
