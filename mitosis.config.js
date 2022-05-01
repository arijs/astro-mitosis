module.exports = {
	baseDir: 'src/mitosis',
	files: '**/*.lite.tsx',
	dest: 'src',
	targets: [
		'react',
		'vue',
		'svelte',
		'solid',
	],
	options: {
		react: {
			// stylesType?: 'emotion' | 'styled-components' | 'styled-jsx' | 'react-native';
			stylesType: 'styled-jsx',
			// stateType?: 'useState' | 'mobx' | 'valtio' | 'solid' | 'builder';
			stateType: 'useState',
			// format?: 'lite' | 'safe';
			format: 'lite',
			// type?: 'dom' | 'native';
			type: 'dom',
		},
	},
};
