/* eslint-disable @typescript-eslint/no-var-requires */

const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const tailwindcssNesting = require('tailwindcss/nesting');

const config = {
	plugins: [
		tailwindcssNesting(),
		tailwindcss(),
		//But others, like autoprefixer, need to run after,
		autoprefixer
	]
};

module.exports = config;
