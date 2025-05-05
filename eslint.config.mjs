import { defineConfig } from 'eslint/config';
import jsPlugin from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import pluginJest from 'eslint-plugin-jest';

export default defineConfig([
	{
		name: 'Custom ESLint TS config',
		files: ['src/**/*.ts'], // ['src/**/*.ts', 'test/**/*.ts'],
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
            '@typescript-eslint/non-nullable-type-assertion-style': 'off',
			'@typescript-eslint/no-unnecessary-condition': 'off',
			'@typescript-eslint/no-unnecessary-type-assertion': 'off'
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
		name: 'Custom ESLint Jest TS config',
		files: ['test/**/*.ts'],
		plugins: {
			jest: pluginJest,
		},
		languageOptions: {
			globals: pluginJest.environments.globals.globals,
			ecmaVersion: 'latest',
			parser: tsParser,
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			...pluginJest.configs['flat/recommended'].rules,
			'jest/no-done-callback': 'off',
		},
	},
	{
		name: 'Custom ESLint JS config',
		files: ['src/**/*.js', 'test/**/*.js'],
		...jsPlugin.configs.recommended,
	},
]);
