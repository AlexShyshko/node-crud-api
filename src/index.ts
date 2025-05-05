import dotenv from 'dotenv';
import { Server as NodeHttpServer } from 'http';
import { BalancerMapPort } from './types-and-interfaces';
import { serverUtils } from './server-utils/server-utils';
import cluster from 'cluster';
import { mc } from './message-colorizer/message-colorizer';
import { availableParallelism } from 'os';

let dataBase: NodeHttpServer, loadBalancer: NodeHttpServer, applicationInstance: NodeHttpServer, applicationInstancesCount: number;
let applicationServersReady = false;

try {
	dotenv.config();

	if (process.env.CLUSTER_MODE === process.env.CLUSTER_MODE_VALUE) {
		if (cluster.isPrimary) {
			printGreeting();
			printHelp();

			const parallelProcessesCount = availableParallelism();
			applicationInstancesCount = parallelProcessesCount - 1;
			const loadBalancerPort = process.env.PORT!;
			const dataBasePort = String(Number(loadBalancerPort) + parallelProcessesCount);
			const balancerMapPort: BalancerMapPort = new Map();
			let listeningWorkers = 0;

			for (let i = 0; i < applicationInstancesCount; i++) {
				const clusterPort = String(Number(loadBalancerPort) + (i + 1));
				const workerProcess = cluster.fork({ PORT: clusterPort, DESTINATION_PORT: dataBasePort });
				const workerProcessId = workerProcess.id;
				balancerMapPort.set(workerProcessId, clusterPort);

				workerProcess.on('message', (message: string) => {
					if (message === 'Listening appliction instance is ready') {
						listeningWorkers += 1;

						if (listeningWorkers === applicationInstancesCount) {
							applicationServersReady = true;
						}
					}
				});
			}

			serverUtils.setBalancerEndIndex(applicationInstancesCount);
			serverUtils.setBalancerMapPort(balancerMapPort);
			serverUtils.setDestinationPort(dataBasePort);

			/*dataBase = */ serverUtils
				.getDataBaseServer(dataBasePort, process.env.HOST!)
				.then((result) => {
					dataBase = result;
				})
				.catch((e: unknown) => {
					console.log(mc.colorize(e as object, 'red'));
				})
				.finally();

			/*loadBalancer = */ serverUtils
				.getLoadBalancer(loadBalancerPort, process.env.HOST!)
				.then((result) => {
					loadBalancer = result;
				})
				.catch((e: unknown) => {
					console.log(mc.colorize(e as object, 'red'));
				})
				.finally();
		} else {
			/*applicationInstance = */ serverUtils
				.getApplicationInstance(process.env.PORT!, process.env.HOST!)
				.then((result) => {
					applicationInstance = result;

					process.send!('Listening appliction instance is ready');
				})
				.catch((e: unknown) => {
					console.log(mc.colorize(e as object, 'red'));
				})
				.finally();
		}
	} else {
		printGreeting();
		printHelp();

		/*dataBase = */ serverUtils
			.getDataBaseServer(process.env.PORT!, process.env.HOST!)
			.then((result) => {
				dataBase = result;
			})
			.catch((e: unknown) => {
				console.log(mc.colorize(e as object, 'red'));
			})
			.finally();
	}

	function printGreeting() {
		console.log(`\n${mc.colorize('Hello,', 'green')} ${mc.colorize(process.env.APPLICATION_USERNAME!, 'yellow')}\n`);
	}

	function printHelp() {
		const helpText = `
			${mc.colorize('Before checking the task, make sure that you use NodeJS version', 'red')} ${mc.colorize(process.env.NODE_VERSION!, 'red_bgc')}${mc.colorize('. Different version may not work properly!', 'red')}
			${mc.colorize('The application supports these predefined scripts:', 'green')}
			${mc.colorize('npm run start:dev', 'blue_bgc')} ${mc.colorize('- a single cluster mode.', 'green')}
			${mc.colorize('npm run start:prod', 'blue_bgc')} ${mc.colorize('- the same bundled in one js file.', 'green')}
			${mc.colorize('npm run start:multi', 'blue_bgc')} ${mc.colorize('- a multi cluster mode with a load balancer.', 'green')}
			${mc.colorize('npm run start:multi-prod', 'blue_bgc')} ${mc.colorize('- the same bundled in one js file.', 'green')}
			${mc.colorize('npm run test:valid', 'blue_bgc')} ${mc.colorize('- valid CRUD requests.', 'green')}
			${mc.colorize('npm run test:invalid', 'blue_bgc')} ${mc.colorize('- invalid CRUD requests.', 'green')}
			${mc.colorize('npm run test:multi', 'blue_bgc')} ${mc.colorize('- various CRUD requests to the load balancer.', 'green')}
			${mc.colorize('An optional argument', 'green')} ${mc.colorize('APPLICATION_USERNAME', 'yellow')} ${mc.colorize('is acceptable', 'green')} ${mc.colorize('npx cross-env APPLICATION_USERNAME=your_username ts-node-dev src/index.ts', 'blue_bgc')}
			${mc.colorize('Below is a list of all available', 'green')} ${mc.colorize('methods', 'yellow')}${mc.colorize(',', 'green')} ${mc.colorize('endpoints', 'magenta')} ${mc.colorize('and', 'green')} ${mc.colorize('payload types', 'cyan')} ${mc.colorize('with request examples:', 'green')} ${mc.colorize('correct', 'blue_bgc')} ${mc.colorize('and', 'green')} ${mc.colorize('incorrect', 'red_bgc')}
			${mc.colorize('You can use', 'green')} ${mc.colorize('command examples', 'blue_bgc')} ${mc.colorize('to speed up the review.', 'green')} ${mc.colorize('In this case replace', 'yellow')} ${mc.colorize('<TEMPLATE>', 'blue_bgc')} ${mc.colorize('with actual data.', 'yellow')}
			${mc.colorize('If you have any questions, ask me in discord:', 'red')} ${mc.colorize('alexshyshko', 'red_bgc')}

			${mc.colorize('Available methods:', 'green')}

			${mc.colorize('PATCH', 'yellow')}
			${mc.colorize('api/users', 'magenta')}
			${mc.colorize('creates 10 random users', 'green')}
			${mc.colorize('METHOD: PATCH', 'blue_bgc')}
			${mc.colorize('PATH: localhost:4000/api/users', 'blue_bgc')}
			${mc.colorize('METHOD: PATCH', 'red_bgc')}
			${mc.colorize('PATH: localhost:4000/invalid-api/invalid-users', 'red_bgc')}

			${mc.colorize('GET', 'yellow')}
			${mc.colorize('api/users', 'magenta')}
			${mc.colorize('api/users/<USER ID>', 'magenta')}
			${mc.colorize('requests users', 'green')}
			${mc.colorize('METHOD: GET', 'blue_bgc')}
			${mc.colorize('PATH: localhost:4000/api/users/<USER ID>', 'blue_bgc')}
			${mc.colorize('METHOD: GET', 'red_bgc')}
			${mc.colorize('PATH: localhost:4000/api/users/<INVALID USER ID>', 'red_bgc')}

			${mc.colorize('POST', 'yellow')}
			${mc.colorize('api/users', 'magenta')}
			${mc.colorize('{\nusername: string,\nage: number,\nhobbies: string[],\n}', 'cyan')}
			${mc.colorize('creates a new user', 'green')}
			${mc.colorize('METHOD: POST', 'blue_bgc')}
			${mc.colorize('PATH: localhost:4000/api/users', 'blue_bgc')}
			${mc.colorize('PAYLOAD:\n{\n"username": "new name",\n"age": 55,\n"hobbies": ["VALID FORMAT HOBBY: ARRAY"],\n}', 'blue_bgc')}
			${mc.colorize('METHOD: POST', 'red_bgc')}
			${mc.colorize('PATH: localhost:4000/api/users', 'red_bgc')}
			${mc.colorize('PAYLOAD:\n{\n"username": "new name",\n"age": 55,\n"hobbies": { "INVALID FORMAT HOBBY": "OBJECT" },\n}', 'red_bgc')}

			${mc.colorize('PUT', 'yellow')}
			${mc.colorize('api/users/<USER ID>', 'magenta')}
			${mc.colorize('{\nusername?: string,\nage?: number,\nhobbies?: string[],\n}', 'cyan')}
			${mc.colorize('edits an existing user', 'green')}
			${mc.colorize('METHOD: PUT', 'blue_bgc')}
			${mc.colorize('PATH: localhost:4000/api/users/<USER ID>', 'blue_bgc')}
			${mc.colorize('PAYLOAD:\n{\n"username": "VALID FORMAT NAME: STRING"\n}', 'blue_bgc')}
			${mc.colorize('METHOD: PUT', 'red_bgc')}
			${mc.colorize('PATH: localhost:4000/api/users/<USER ID>', 'red_bgc')}
			${mc.colorize('PAYLOAD:\n{\n"username": { "INVALID FORMAT NAME": "OBJECT" }\n}', 'red_bgc')}

			${mc.colorize('DELETE', 'yellow')}
			${mc.colorize('api/users/<USER ID>', 'magenta')}
			${mc.colorize('removes an existing user', 'green')}
			${mc.colorize('METHOD: DELETE', 'blue_bgc')}
			${mc.colorize('PATH: localhost:4000/api/users/<USER ID>', 'blue_bgc')}
			${mc.colorize('METHOD: DELETE', 'red_bgc')}
			${mc.colorize('PATH: localhost:4000/api/users/<INVALID USER ID>', 'red_bgc')}
        `;

		const truncatedText = helpText.replace(/^\n+|\n+$/g, '');
		const untabbedText = truncatedText.replace(/^[ \t]+/gm, '');

		console.log(untabbedText);
	}
} catch (e) {
	console.log(mc.colorize(e as object, 'red'));
}

export { dataBase, loadBalancer, applicationInstance, applicationServersReady, applicationInstancesCount };
