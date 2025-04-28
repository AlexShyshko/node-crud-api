import dotenv from 'dotenv';
dotenv.config();

console.log('APPLICATION_USERNAME = ' + (process.env.APPLICATION_USERNAME as string));
console.log('API = ' + (`${process.env.HOST!}:${process.env.PORT!}${process.env.API_BASE_PATH!}${process.env.API_USERS_PATH!}`));

process.stdin.on('data', (input) => {
	console.log('Input = ' + String(input));
});