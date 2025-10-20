/**
 * @file src/routes/setup/+page.server.ts
 * @description Server-side load function for the setup page.
 * It now protects the route from being accessed after setup is complete.
 */

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

// Find workspace root by looking for package.json with workspaces
function findWorkspaceRoot(): string {
	let current = process.cwd();

	// Try up to 5 levels up
	for (let i = 0; i < 5; i++) {
		const pkgPath = join(current, 'package.json');
		if (existsSync(pkgPath)) {
			const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
			// Workspace root has "workspaces" field
			if (pkg.workspaces) {
				return current;
			}
		}
		const parent = resolve(current, '..');
		if (parent === current) break; // Reached root
		current = parent;
	}

	// Fallback: if we're in apps/setup-wizard, go up 2 levels
	if (process.cwd().includes('/apps/setup-wizard')) {
		return resolve(process.cwd(), '../..');
	}

	return process.cwd();
}

const workspaceRoot = findWorkspaceRoot();

// Read package.json from workspace root
const pkgJsonPath = join(workspaceRoot, 'package.json');
const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
const pkgVersion = pkgJson.version;

// Read inlang settings from workspace root
const inlangSettingsPath = join(workspaceRoot, 'project.inlang/settings.json');
const inlangSettings = JSON.parse(readFileSync(inlangSettingsPath, 'utf8'));

/**
 * Check if setup is truly complete (not just file exists, but has valid values)
 */
function isSetupTrulyComplete(): boolean {
	try {
		const privateConfigPath = join(workspaceRoot, 'config', 'private.ts');

		if (!existsSync(privateConfigPath)) {
			return false;
		}

		const configContent = readFileSync(privateConfigPath, 'utf8');

		// Check if essential values are filled (not empty strings)
		// Pattern matches: JWT_SECRET_KEY: '' or JWT_SECRET_KEY: ""
		const hasValidJwtSecret = configContent.includes('JWT_SECRET_KEY') && !/JWT_SECRET_KEY:\s*['"]{2}\s*[,}]/.test(configContent);
		const hasValidDbHost = configContent.includes('DB_HOST') && !/DB_HOST:\s*['"]{2}\s*[,}]/.test(configContent);
		const hasValidDbName = configContent.includes('DB_NAME') && !/DB_NAME:\s*['"]{2}\s*[,}]/.test(configContent);

		return hasValidJwtSecret && hasValidDbHost && hasValidDbName;
	} catch (error) {
		console.error('Error checking setup status:', error);
		return false;
	}
}

export const load: PageServerLoad = async ({ locals, cookies }) => {
	// --- SECURITY ---
	// If setup is already complete (config has actual values), redirect away immediately.
	// This is the primary protection for this route.
	if (isSetupTrulyComplete()) {
		throw redirect(302, '/login');
	}

	// Clear any existing session cookies to ensure fresh start
	// This prevents issues when doing a fresh database setup
	cookies.delete('auth_session', { path: '/' });

	// Get available system languages from inlang settings (direct import, no parsing needed)
	const availableLanguages: string[] = inlangSettings.locales || ['en', 'de'];

	// Pass theme data and PKG_VERSION from server to client
	return {
		theme: locals.theme,
		darkMode: locals.darkMode,
		availableLanguages, // Pass the languages from settings.json
		settings: {
			PKG_VERSION: pkgVersion
		}
	};
};
