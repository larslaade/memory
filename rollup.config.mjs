import { terser } from 'rollup-plugin-terser';

export default {
	input: 'src/js/memory.js',
	output: {
		compact: true,
		file: 'js/memory.min.js',
		format: 'iife'
	},
	plugins: [
		terser()
	]
};
