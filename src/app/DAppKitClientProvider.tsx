'use client';

import { useState, useEffect } from 'react';
import { DAppKitProvider } from '@mysten/dapp-kit-react';
import { dAppKit } from './dapp-kit';

export function DAppKitClientProvider({ children }: { children: React.ReactNode }) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	return <DAppKitProvider dAppKit={dAppKit}>{children}</DAppKitProvider>;
}
