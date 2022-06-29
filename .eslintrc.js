module.exports = {
	env: {
		es2021: true,
		node: true,
	},
	extends: [
		'airbnb-base',
		'plugin:@typescript-eslint/recommended',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	plugins: [
		'@typescript-eslint',
	],
	rules: {
		indent: [
			'error',
			'tab',
		],
		'import/extensions': [
			'error',
			{
				ignorePackages: true,
				pattern: {
					ts: 'never',
					js: 'never',
				},
			},
		],
		'import/no-unresolved': 'off',
		'linebreak-style': 'off',
		'max-len': [
			'error',
			200,
		],
		'no-shadow': 'off',
		'no-tabs': 'off',
		semi: 'off',
	},
};
