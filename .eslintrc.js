module.exports = {
	root: true,
	parser: 'babel-eslint',
	parserOptions: {
		sourceType: 'module'
	},
	env: {
		browser: true,
		node: true
	},
	extends: 'standard',
	globals: {
		__static: true
	},
	plugins: [
		'html'
	],
	'rules': {
		// allow paren-less arrow functions
		'arrow-parens': 0,
		// allow async-await
		'generator-star-spacing': 0,
		// allow tabs
		'no-tabs': 0,
		'indent': 0,
		'operator-linebreak': ['error', 'before'],
		'no-undef-init': 0,
		'comma-dangle': 0,
		// allow debugger during development
		'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
	}
}
