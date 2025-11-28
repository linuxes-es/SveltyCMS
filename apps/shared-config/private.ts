/**
 * @file apps/shared-config/private.ts
 * @description Placeholder for private configuration.
 * This file is overwritten during the setup process.
 */
import { createPrivateConfig } from './schemas.js';

export const privateEnv = createPrivateConfig({
	DB_TYPE: 'mongodb',
	DB_HOST: 'localhost',
	DB_PORT: 27017,
	DB_NAME: 'sveltycms',
	DB_USER: '',
	DB_PASSWORD: '',
	DB_RETRY_ATTEMPTS: 5,
	DB_RETRY_DELAY: 3000,
	JWT_SECRET_KEY: 'placeholder',
	ENCRYPTION_KEY: 'placeholder',
	MULTI_TENANT: false
});
