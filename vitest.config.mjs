import { defineConfig } from 'vitest/config';

// Block sources are .js files with JSX (the WordPress convention), so the
// transform has to be told to parse JSX in .js too. The automatic runtime
// matches what wp-scripts uses for the production build.
export default defineConfig( {
	oxc: {
		include: /\.[jt]sx?$/,
		exclude: [],
		lang: 'jsx',
		jsx: { runtime: 'automatic', importSource: 'react' },
	},
	test: {
		environment: 'jsdom',
		include: [ 'src/**/*.test.js' ],
	},
} );
