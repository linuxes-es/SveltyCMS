/**
 * @file apps/setup-wizard/src/app.d.ts
 * @description TypeScript type definitions for the Setup Wizard app
 */

/// <reference types="@sveltejs/kit" />

declare global {
	namespace App {
		interface Locals {
			// Setup wizard doesn't need complex auth/session
			// Just basic theme support
			theme: string;
			darkMode: boolean;
		}

		interface PageData {
			theme?: string;
			darkMode?: boolean;
			availableLanguages?: string[];
			settings?: {
				PKG_VERSION?: string;
			};
		}

		interface Error {
			message: string;
			code?: string;
		}

		interface Platform {}
	}
}

export {};
