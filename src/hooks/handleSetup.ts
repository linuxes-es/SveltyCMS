/**
 * @file src/hooks/handleSetup.ts
 * @description Middleware to manage the initial application setup process
 *
 * ### Setup Flow (Standalone Setup Wizard)
 * 1. **Not Configured**: Config file missing → Redirect to standalone setup wizard (port 5174)
 * 2. **Configured**: Config exists with values → Allow normal CMS operation
 *
 * ### Behavior
 * - Checks if config/private.ts exists and has valid values
 * - Redirects to standalone setup wizard app if setup not complete
 * - No need to block /setup routes (they don't exist in main CMS anymore)
 *
 * ### Prerequisites
 * - handleSystemState has confirmed system is operational
 * - This hook runs before authentication/authorization
 *
 * @note Setup wizard is now a separate NX workspace app (apps/setup-wizard)
 */

import { redirect, type Handle } from '@sveltejs/kit';
import { isSetupComplete } from '@utils/setupCheck';
import { logger } from '@utils/logger.svelte';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// --- CONSTANTS ---

/**
 * URL of the standalone setup wizard application
 * In development: http://localhost:5174
 * In production: Configure via SETUP_WIZARD_URL environment variable
 */
const SETUP_WIZARD_URL = process.env.SETUP_WIZARD_URL || 'http://localhost:5174';

// --- MAIN HOOK ---

export const handleSetup: Handle = async ({ event, resolve }) => {
	// --- Step 1: Quick Config Check (Synchronous, cached per request) ---
	if (event.locals.__setupConfigExists === undefined) {
		event.locals.__setupConfigExists = isSetupComplete();
	}
	const configExists = event.locals.__setupConfigExists;

	if (!configExists) {
		if (!event.locals.__setupLogged) {
			logger.warn('Config file missing. System requires initial setup.');
			logger.info(`Redirecting to standalone setup wizard: ${SETUP_WIZARD_URL}`);
			event.locals.__setupLogged = true;
		}
		// Redirect to standalone setup wizard application
		throw redirect(302, SETUP_WIZARD_URL);
	}

	// --- Step 2: Config Exists - Verify It Has Valid Values ---
	// Vite might create private.ts with empty strings on first run
	// We need to verify the config actually has values

	const privateConfigPath = join(process.cwd(), 'config', 'private.ts');
	const configContent = readFileSync(privateConfigPath, 'utf8');

	// Check if essential values are filled (not empty strings)
	// Pattern matches: JWT_SECRET_KEY: '' or JWT_SECRET_KEY: ""
	const hasValidJwtSecret = configContent.includes('JWT_SECRET_KEY') && !/JWT_SECRET_KEY:\s*['"]{2}\s*[,}]/.test(configContent);
	const hasValidDbHost = configContent.includes('DB_HOST') && !/DB_HOST:\s*['"]{2}\s*[,}]/.test(configContent);
	const hasValidDbName = configContent.includes('DB_NAME') && !/DB_NAME:\s*['"]{2}\s*[,}]/.test(configContent);

	const configHasValues = hasValidJwtSecret && hasValidDbHost && hasValidDbName;

	if (!configHasValues) {
		// Config file exists but has no values - treat as not configured
		if (!event.locals.__setupLogged) {
			logger.warn('Config file exists but has empty values. System requires setup.');
			logger.info(`Redirecting to standalone setup wizard: ${SETUP_WIZARD_URL}`);
			event.locals.__setupLogged = true;
		}
		// Redirect to standalone setup wizard application
		throw redirect(302, SETUP_WIZARD_URL);
	}

	// --- Step 3: Config Has Values - Setup Was Completed ---
	// Continue with normal request handling
	// No need to block /setup routes - they don't exist in main CMS anymore

	return resolve(event);
};
