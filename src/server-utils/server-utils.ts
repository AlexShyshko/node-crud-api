import { ServerUtilsInterface } from '../types-and-interfaces';
import { Server as NodeHttpServer, createServer, RequestListener, IncomingMessage, ServerResponse, request as NodeHttpServerRequest , STATUS_CODES } from 'http';
import { API } from '../api/api';
import { mc } from '../message-colorizer/message-colorizer';
import cluster from 'cluster';

class ServerUtils implements ServerUtilsInterface {

    #loadBalancerWorkerIndex: number;
    #loadBalancerWorkerIndexEnd: number;
    #destinationPort: string;
    #balancerMapPort: Map<number, string>;

    constructor() {
        this.#loadBalancerWorkerIndex = 0;
        this.#loadBalancerWorkerIndexEnd = 0;
        this.#destinationPort = '';
        this.#balancerMapPort = new Map();
    };

    public getDataBaseServer = (port: string, host: string) => {
        
        return new Promise((resolve) => {

            const newServer = createServer();
            newServer.on('request', this.#getDataBaseRequestListener());
            newServer.listen({ port: port, host: host });
    
            newServer.on('listening', () => {

                console.log(`${mc.colorize('A new data base server created: ', 'green')}${mc.colorize(host + ':' + port, 'yellow')}`);
                resolve(newServer);

            });

        }) as Promise<NodeHttpServer>;

    };

    public getLoadBalancer = (port: string, host: string) => {

        return new Promise((resolve) => {

            const newServer = createServer();
            newServer.on('request', this.#getLoadBalancerRequestListener());
            newServer.listen({ port: port, host: host });

            newServer.on('listening', () => {

                console.log(`${mc.colorize('A new load balancer created: ', 'green')}${mc.colorize(host + ':' + port, 'yellow')}`);
                resolve(newServer);

            });

        }) as Promise<NodeHttpServer>;

    };

    public getApplicationInstance = (port: string, host: string) => {

        return new Promise((resolve) => {

            const newServer = createServer();
            newServer.on('request', this.#getApplicationInstanceRequestListener());
            newServer.listen({ port: port, host: host });

            newServer.on('listening', () => {

                console.log(`${mc.colorize('A new application instance created: ', 'green')}${mc.colorize(host + ':' + port, 'yellow')}`);
                resolve(newServer);

            });
            
        }) as Promise<NodeHttpServer>;

    };

    #getDataBaseRequestListener = (): RequestListener => {

        return (request: IncomingMessage, response: ServerResponse) => {

            try {

                const requestMethod = request.method!;
                const requestUrl = request.url!;
                let body = '';
    
                request.on('data', (chunk) => {
                    body += String(chunk);
                });
    
                request.on('end', () => {
    
                    const apiResponse = API.processRequest(requestMethod, requestUrl, body);
                    console.log(`${mc.colorize('API Response: \n', 'green')}${mc.colorize(apiResponse, 'yellow')}`);
                    response.statusMessage = apiResponse.statusMessage;
                    response.writeHead(apiResponse.statusCode, {'content-type': process.env.CONTENT_TYPE});
                    const responseBody = JSON.stringify(apiResponse.body);
                    response.end(responseBody);
    
                });
    
                request.on('error', (requestError) => {

                    console.log(mc.colorize(requestError as object, 'red'));
                    response.statusMessage = STATUS_CODES[Number(process.env.CODE_SERVER_ERROR)]!;
                    response.writeHead(Number(process.env.CODE_SERVER_ERROR), {'content-type': process.env.CONTENT_TYPE});
                    const responseBody = JSON.stringify({ Error: requestError.message });
                    response.end(responseBody);
    
                });

            } catch (e) {

                console.log(mc.colorize(e as object, 'red'));

                if (e instanceof Error) {

                    response.statusMessage = STATUS_CODES[Number(process.env.CODE_SERVER_ERROR)]!;
                    response.writeHead(Number(process.env.CODE_SERVER_ERROR), {'content-type': process.env.CONTENT_TYPE});
                    const responseBody = JSON.stringify({ Error: e.message });
                    response.end(responseBody);

                } else {

                    response.statusMessage = STATUS_CODES[Number(process.env.CODE_SERVER_ERROR)]!;
                    response.writeHead(Number(process.env.CODE_SERVER_ERROR), {'content-type': process.env.CONTENT_TYPE});
                    const responseBody = JSON.stringify({ Error: 'Unknown server error' });
                    response.end(responseBody);

                }

            }

        };

    };

    #getLoadBalancerRequestListener = (): RequestListener => {

        return (request: IncomingMessage, response: ServerResponse) => {

            try {

                const workerKeys = Object.keys(cluster.workers!);
                const currentWorkerIndex = workerKeys[this.#loadBalancerWorkerIndex];
                const currentWorkerId = cluster.workers![currentWorkerIndex]?.id;

                const requestOptions = {
                    hostname: process.env.HOST!,
                    port: this.#balancerMapPort.get(currentWorkerId!),
                    path: request.url,
                    method: request.method,
                    headers: request.headers,
                };

                const proxyRequest = NodeHttpServerRequest(requestOptions, (proxyResponse) => {
                    
                    response.statusMessage = proxyResponse.statusMessage!;
                    response.writeHead(proxyResponse.statusCode!, proxyResponse.headers);
                    
                    proxyResponse.pipe(response);

                });
                
                console.log(`${mc.colorize('Request to', 'green')} ${mc.colorize(process.env.HOST! + ':' + process.env.PORT!, 'yellow')} ${mc.colorize('is redirected to', 'green')} ${mc.colorize(process.env.HOST! + ':' + requestOptions.port!, 'yellow')}`);

                request.pipe(proxyRequest);

                this.#loadBalancerWorkerIndex += 1;

                if (this.#loadBalancerWorkerIndex === this.#loadBalancerWorkerIndexEnd) {
                    this.#loadBalancerWorkerIndex = 0;
                }

            } catch (e) {

                console.log(mc.colorize(e as object, 'red'));

                if (e instanceof Error) {

                    response.statusMessage = STATUS_CODES[Number(process.env.CODE_SERVER_ERROR)]!;
                    response.writeHead(Number(process.env.CODE_SERVER_ERROR), {'content-type': process.env.CONTENT_TYPE});
                    const responseBody = JSON.stringify({ Error: e.message });
                    response.end(responseBody);

                } else {

                    response.statusMessage = STATUS_CODES[Number(process.env.CODE_SERVER_ERROR)]!;
                    response.writeHead(Number(process.env.CODE_SERVER_ERROR), {'content-type': process.env.CONTENT_TYPE});
                    const responseBody = JSON.stringify({ Error: 'Unknown server error' });
                    response.end(responseBody);

                }

            }

        };

    };

    #getApplicationInstanceRequestListener = (): RequestListener => {

        return (request: IncomingMessage, response: ServerResponse) => {

            try {

                const requestOptions = {
                    hostname: process.env.HOST!,
                    port: process.env.DESTINATION_PORT!,
                    path: request.url,
                    method: request.method,
                    headers: request.headers,
                };

                const proxyRequest = NodeHttpServerRequest(requestOptions, (proxyResponse) => {
                    
                    response.statusMessage = proxyResponse.statusMessage!;
                    response.writeHead(proxyResponse.statusCode!, proxyResponse.headers);

                    proxyResponse.pipe(response);

                });

                console.log(`${mc.colorize('Response from', 'green')} ${mc.colorize(process.env.HOST! + ':' + process.env.PORT!, 'yellow')}${mc.colorize(':', 'green')}`);

                request.pipe(proxyRequest);

            } catch (e) {

                console.log(mc.colorize(e as object, 'red'));

                if (e instanceof Error) {

                    response.statusMessage = STATUS_CODES[Number(process.env.CODE_SERVER_ERROR)]!;
                    response.writeHead(Number(process.env.CODE_SERVER_ERROR), {'content-type': process.env.CONTENT_TYPE});
                    const responseBody = JSON.stringify({ Error: e.message });
                    response.end(responseBody);

                } else {

                    response.statusMessage = STATUS_CODES[Number(process.env.CODE_SERVER_ERROR)]!;
                    response.writeHead(Number(process.env.CODE_SERVER_ERROR), {'content-type': process.env.CONTENT_TYPE});
                    const responseBody = JSON.stringify({ Error: 'Unknown server error' });
                    response.end(responseBody);

                }

            }

        };

    };

    setBalancerEndIndex = (number: number) => {
        this.#loadBalancerWorkerIndexEnd = number;
    };

    setDestinationPort = (port: string) => {
        this.#destinationPort = port;
    };

    setBalancerMapPort = (map: Map<number, string>) => {
        this.#balancerMapPort = map;
    };

}

const serverUtils = new ServerUtils();

export { serverUtils };