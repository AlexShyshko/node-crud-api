import { defineConfig } from 'eslint/config';
import jsPlugin from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default defineConfig([
	{
		name: 'Custom ESLint TS config',
		files: ['src/**/*.ts', 'tests/**/*.ts'],
		plugins: {
			'@typescript-eslint': tsPlugin,
		},
		rules: {
			...tsPlugin.configs['strict-type-checked'].rules,
			...tsPlugin.configs['stylistic-type-checked'].rules,
			semi: 'error',
			'prefer-const': 'error',
			'no-constant-binary-expression': 'error',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/non-nullable-type-assertion-style': 'off'
		},
		languageOptions: {
			ecmaVersion: 'latest',
			parser: tsParser,
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		name: 'Custom ESLint JS config',
		files: ['src/**/*.js', 'tests/**/*.js'],
		...jsPlugin.configs.recommended,
	},
]);
