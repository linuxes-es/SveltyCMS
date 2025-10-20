
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/setup" | "/api/setup/complete" | "/api/setup/email-test" | "/api/setup/install-driver" | "/api/setup/seed" | "/api/setup/test-database";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/api": Record<string, never>;
			"/api/setup": Record<string, never>;
			"/api/setup/complete": Record<string, never>;
			"/api/setup/email-test": Record<string, never>;
			"/api/setup/install-driver": Record<string, never>;
			"/api/setup/seed": Record<string, never>;
			"/api/setup/test-database": Record<string, never>
		};
		Pathname(): "/" | "/api" | "/api/" | "/api/setup" | "/api/setup/" | "/api/setup/complete" | "/api/setup/complete/" | "/api/setup/email-test" | "/api/setup/email-test/" | "/api/setup/install-driver" | "/api/setup/install-driver/" | "/api/setup/seed" | "/api/setup/seed/" | "/api/setup/test-database" | "/api/setup/test-database/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}