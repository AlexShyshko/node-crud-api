import { ServerUtilsInterface } from '../types-and-interfaces';
import { createServer, RequestListener, IncomingMessage, ServerResponse, STATUS_CODES } from 'http';
import { API } from '../api/api';

class ServerUtils implements ServerUtilsInterface {

    public getNewDefaultServer = () => {

        const newServer = createServer();
        newServer.on('request', this.#getDefaultRequestListener());
        newServer.listen({ port: process.env.PORT, host: process.env.HOST });
        
        return newServer;

    };

    #getDefaultRequestListener = (): RequestListener => {

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
                    response.statusMessage = apiResponse.statusMessage;
                    response.writeHead(apiResponse.statusCode, {'content-type': process.env.CONTENT_TYPE});
                    const responseBody = JSON.stringify(apiResponse.body);
                    response.end(responseBody);
    
                });
    
                request.on('error', (requestError) => {
    
                    response.statusMessage = STATUS_CODES[Number(process.env.CODE_SERVER_ERROR)]!;
                    response.writeHead(Number(process.env.CODE_SERVER_ERROR), {'content-type': process.env.CONTENT_TYPE});
                    const responseBody = JSON.stringify({ Error: requestError.message });
                    response.end(responseBody);
    
                });

            } catch (e) {

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

}

const serverUtils = new ServerUtils();

export { serverUtils };