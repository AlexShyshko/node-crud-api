import dotenv from 'dotenv';
import { serverUtils } from './server-utils/server-utils';

try {

	dotenv.config();
	serverUtils.getNewDefaultServer();



} catch (e) {
	console.log(e);
}
