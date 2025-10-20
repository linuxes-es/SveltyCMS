/**
 * @file src/widgets/core/richText/tiptap.lazy.ts
 * @description Lazy-loaded Tiptap Editor Configuration
 *
 * This file provides async loading for all TipTap dependencies to reduce
 * the initial bundle size. The editor and all extensions are only loaded
 * when the richText widget is actually used.
 *
 * @optimization Bundle size: ~250KB of editor code is now lazy-loaded
 */

import type { Editor } from '@tiptap/core';
import { getTextDirection } from '@utils/utils';

/**
 * Lazy loads all TipTap dependencies and creates the editor instance.
 * Only called when the richText widget input component is mounted.
 *
 * @param element The HTML element to bind the editor to
 * @param content The initial HTML content for the editor
 * @param language The current language code (e.g., 'en', 'ar') for text direction
 * @returns Promise<Editor> The configured Tiptap editor instance
 */
export async function createEditorAsync(element: HTMLElement, content: string, language: string): Promise<Editor> {
	// Lazy load all TipTap dependencies in parallel
	const [
		{ Editor, Extension },
		StarterKit,
		Link,
		Placeholder,
		{ Table },
		{ TableCell },
		{ TableHeader },
		{ TableRow },
		{ TextAlign },
		{ Underline },
		{ Youtube },
		{ CharacterCount },
		{ Color },
		{ FontFamily },
		ImageResize,
		TextStyle
	] = await Promise.all([
		import('@tiptap/core'),
		import('@tiptap/starter-kit').then((m) => m.default),
		import('@tiptap/extension-link').then((m) => m.default),
		import('@tiptap/extension-placeholder').then((m) => m.default),
		import('@tiptap/extension-table'),
		import('@tiptap/extension-table-cell'),
		import('@tiptap/extension-table-header'),
		import('@tiptap/extension-table-row'),
		import('@tiptap/extension-text-align'),
		import('@tiptap/extension-underline'),
		import('@tiptap/extension-youtube'),
		import('@tiptap/extension-character-count'),
		import('@tiptap/extension-color'),
		import('@tiptap/extension-font-family'),
		import('./extensions/ImageResize').then((m) => m.default),
		import('./extensions/TextStyle').then((m) => m.default)
	]);

	// Create and return the editor with all extensions
	return new Editor({
		element,
		extensions: [
			StarterKit,
			TextStyle,
			FontFamily,
			Color,
			ImageResize,
			Underline,
			Link.configure({
				openOnClick: false
			}),
			Placeholder.configure({
				placeholder: ({ node }) => {
					if (node.type.name === 'heading') return 'Write a heading…';
					return 'Start writing your awesome content…';
				},
				includeChildren: true,
				emptyEditorClass: 'is-editor-empty'
			}),
			Table.configure({
				resizable: true
			}),
			TableRow,
			TableHeader,
			TableCell,
			TextAlign.configure({
				types: ['heading', 'paragraph', 'image']
			}),
			Youtube.configure({
				modestBranding: true,
				HTMLAttributes: {
					class: 'w-full aspect-video'
				}
			}),
			CharacterCount,
			// Custom extension for the Tab key
			Extension.create({
				name: 'Tab',
				addKeyboardShortcuts() {
					return {
						Tab: ({ editor: e }) => e.commands.insertContent('\t')
					};
				}
			})
		],
		content,
		editorProps: {
			attributes: {
				class: 'prose dark:prose-invert max-w-none focus:outline-none',
				dir: getTextDirection(language)
			}
		}
	});
}

/**
 * Type-only export for backwards compatibility
 * The actual Editor type is imported dynamically
 */
export type { Editor } from '@tiptap/core';
