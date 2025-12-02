// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://trydelete.app',
	integrations: [
		starlight({
			title: 'Delete Learn',
			description: 'Relationship education, the Zerodha Varsity way. Research-backed, no fluff.',
			logo: {
				light: './src/assets/logo-light.svg',
				dark: './src/assets/logo-dark.svg',
				replacesTitle: true,
			},
			social: {
				instagram: 'https://instagram.com/trydelete.app',
				'x.com': 'https://twitter.com/trydeleteapp',
			},
			// Force dark mode only - hide theme selector
			components: {
				ThemeProvider: './src/components/ForceDarkTheme.astro',
				ThemeSelect: './src/components/EmptyComponent.astro',
			},
			customCss: ['./src/styles/custom.css'],
			sidebar: [
				{
					label: 'Start Here',
					items: [
						{ label: 'Welcome', slug: 'learn' },
					],
				},
				{
					label: 'Module 1: Know Yourself First',
					autogenerate: { directory: 'learn/module-1-know-yourself' },
				},
				{
					label: 'Module 2: The Science of Attraction',
					autogenerate: { directory: 'learn/module-2-attraction' },
				},
				{
					label: 'Module 4: The Neurodivergent Lens',
					autogenerate: { directory: 'learn/module-4-neurodivergent' },
				},
			],
			head: [
				{
					tag: 'link',
					attrs: {
						rel: 'icon',
						href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>×</text></svg>",
					},
				},
			],
			disable404Route: true,
		}),
	],
});
