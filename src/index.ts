import dotenv from 'dotenv';
import { BalancerMapPort } from './types-and-interfaces';
import { serverUtils } from './server-utils/server-utils';
import cluster from 'cluster';
import { mc } from './message-colorizer/message-colorizer';
import { availableParallelism } from 'os';

try {

	dotenv.config();

	if (process.env.CLUSTER_MODE === process.env.CLUSTER_MODE_VALUE) {

		if (cluster.isPrimary) {

			printGreeting();

			const parallelProcessesCount = availableParallelism();
			const applicationInstancesCount = parallelProcessesCount - 1;
			const loadBalancerPort = process.env.PORT!;
			const dataBasePort = String(Number(loadBalancerPort) + parallelProcessesCount);
			const balancerMapPort: BalancerMapPort = new Map();

			for (let i = 0; i < applicationInstancesCount; i++) {

				const clusterPort = String(Number(loadBalancerPort) + (i + 1));
				const workerProcessId = cluster.fork({ PORT: clusterPort, DESTINATION_PORT: dataBasePort }).id;
				balancerMapPort.set(workerProcessId, clusterPort);

			}

			serverUtils.setBalancerEndIndex(applicationInstancesCount);
			serverUtils.setBalancerMapPort(balancerMapPort);
			serverUtils.setDestinationPort(dataBasePort);
			/*const dataBase = */serverUtils.getDataBaseServer(dataBasePort, process.env.HOST!);
			/*const loadBalancer = */serverUtils.getLoadBalancer(loadBalancerPort, process.env.HOST!);

		} else {

			/*const applicationInstance = */serverUtils.getApplicationInstance(process.env.PORT!, process.env.HOST!);

		}

	} else {

		printGreeting();
		serverUtils.getDataBaseServer(process.env.PORT!, process.env.HOST!);

	}

	function printGreeting() {
		console.log(`${mc.colorize('Hello,', 'green')} ${mc.colorize(process.env.APPLICATION_USERNAME!, 'yellow')}`);
	}

} catch (e) {
	console.log(mc.colorize(e as object, 'red'));
}
