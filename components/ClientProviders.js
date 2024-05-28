"use client";

import { SessionProvider } from "next-auth/react";
import { ContentProvider } from '../context/ContentContext';
import AuthWrapper from './Authwrapper';

export default function ClientProviders({ children }) {
  return (
    <SessionProvider>
      <ContentProvider>
        <AuthWrapper>{children}</AuthWrapper>
      </ContentProvider>
    </SessionProvider>
  );
}
