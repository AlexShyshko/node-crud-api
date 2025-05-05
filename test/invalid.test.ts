import { DataBaseItem, ErrorResponseBody } from '../src/types-and-interfaces';
import { dataBase } from '../src/index';
import { request, RequestOptions, IncomingMessage } from 'http';

let testResponse: IncomingMessage;
let userIdForTestScenario: string;
const defaultPathTemplate = `/${process.env.API_BASE_PATH!}/${process.env.API_USERS_PATH!}`;
const requestOptionsTemplate: RequestOptions = {
    hostname: process.env.HOST!,
    port: process.env.PORT!,
    headers: {
        'Conten-Type': process.env.CONTENT_TYPE!,
    },
};
const newUserTemplate = {
    username: 'Jest Test User name',
    age: Number(process.env.PORT!),
    hobbies: [`Testing applications on port ${process.env.PORT!}`],
};

const invalidPathTemplate = `/invalid-${process.env.API_BASE_PATH!}/invalid-${process.env.API_USERS_PATH!}`;
const nonExistentUserIdForTestScenario = '5c7de414-31ff-43ea-ba91-8fcbf92441a6';
const invalidUserIdForTestScenario = 'invalid_id';
const partiallyValidToUpdateTemplate = {
    username: 'Jest Test User name',
    age: Number(process.env.PORT!),
    hobbies: ['INVALID_HOBBY_ARRAY_WITH_EMPTY_STRING', ''],
};
const invalidToUpdateTemplate = {
    username: {NAME_NO_STRING: 'NAME_NO_STRING'},
    age: 'ERROR TEXT',
    hobbies: ['INVALID_HOBBY_ARRAY_WITH_NO_STRING', {HOBBY_NO_STRING: 'HOBBY_NO_STRING'}],
};

beforeAll((done) => {

    requestOptionsTemplate.path = defaultPathTemplate;
    requestOptionsTemplate.method = 'POST';
    const preparedBody = JSON.stringify(newUserTemplate);

    const testRequest = request(requestOptionsTemplate, (beforeAllResponse) => {

        let data = '';

        beforeAllResponse.on('data', (chunk) => {
            data += String(chunk);
        });

        beforeAllResponse.on('end', () => {

            testResponse = beforeAllResponse;
            const testResponseBody = JSON.parse(data) as DataBaseItem;
            userIdForTestScenario = testResponseBody.id;

            done();

        });

    });

    testRequest.write(preparedBody);
    testRequest.end();

});

afterAll((done) => {
    dataBase.close(done);
});

describe('Test invalid CRUD requests', () => {

    test('Attempt to reach a wrong endpoint', (done) => {

        requestOptionsTemplate.path = invalidPathTemplate;
        requestOptionsTemplate.method = 'PATCH';

        const testRequest = request(requestOptionsTemplate, (testCaseResponse) => {
            
            let data = '';
    
            testCaseResponse.on('data', (chunk) => {
                data += String(chunk);
            });
    
            testCaseResponse.on('end', () => {

                testResponse = testCaseResponse;
                const testResponseBody = JSON.parse(data) as ErrorResponseBody;
                const expectedBody = {
                    Error: `Wrong endpoint: ${invalidPathTemplate}. Use the correct endpoint: /${process.env.API_BASE_PATH!}/${process.env.API_USERS_PATH!}`,
                };

                expect(testResponse.statusCode).toBe(Number(process.env.CODE_NON_EXIST!));
                expect(testResponseBody).toEqual(expectedBody);
                
                done();
    
            });
    
        });

        testRequest.end();

    });

    test('Attempt to reach a non-existent user', (done) => {

        requestOptionsTemplate.path = `${defaultPathTemplate}/${nonExistentUserIdForTestScenario}`;
        requestOptionsTemplate.method = 'GET';

        const testRequest = request(requestOptionsTemplate, (testCaseResponse) => {
            
            let data = '';
    
            testCaseResponse.on('data', (chunk) => {
                data += String(chunk);
            });
    
            testCaseResponse.on('end', () => {

                testResponse = testCaseResponse;
                const testResponseBody = JSON.parse(data) as ErrorResponseBody;
                const expectedBody = {
                    Error: `ID not found: ${nonExistentUserIdForTestScenario}`,
                };

                expect(testResponse.statusCode).toBe(Number(process.env.CODE_NON_EXIST!));
                expect(testResponseBody).toEqual(expectedBody);
                
                done();
    
            });
    
        });

        testRequest.end();

    });

    test('Attempt to create a partially valid user', (done) => {

        requestOptionsTemplate.path = defaultPathTemplate;
        requestOptionsTemplate.method = 'POST';
        const preparedBody = JSON.stringify(partiallyValidToUpdateTemplate);

        const testRequest = request(requestOptionsTemplate, (testCaseResponse) => {
            
            let data = '';
    
            testCaseResponse.on('data', (chunk) => {
                data += String(chunk);
            });
    
            testCaseResponse.on('end', () => {

                testResponse = testCaseResponse;
                const testResponseBody = JSON.parse(data) as ErrorResponseBody;
                const expectedBody = {
                    Error: 'Invalid properties: hobbies',
                };

                expect(testResponse.statusCode).toBe(Number(process.env.CODE_INVALID!));
                expect(testResponseBody).toEqual(expectedBody);
                
                done();
    
            });
    
        });

        testRequest.write(preparedBody);
        testRequest.end();

    });

    test('Attempt to update a user with fully invalid properties', (done) => {

        requestOptionsTemplate.path = `${defaultPathTemplate}/${userIdForTestScenario}`;
        requestOptionsTemplate.method = 'PUT';
        const preparedBody = JSON.stringify(invalidToUpdateTemplate);

        const testRequest = request(requestOptionsTemplate, (testCaseResponse) => {
            
            let data = '';
    
            testCaseResponse.on('data', (chunk) => {
                data += String(chunk);
            });
    
            testCaseResponse.on('end', () => {

                testResponse = testCaseResponse;
                const testResponseBody = JSON.parse(data) as ErrorResponseBody;
                const expectedBody = {
                    Error: 'Invalid properties: username, age, hobbies',
                };

                expect(testResponse.statusCode).toBe(Number(process.env.CODE_INVALID!));
                expect(testResponseBody).toEqual(expectedBody);
                
                done();
    
            });
    
        });

        testRequest.write(preparedBody);
        testRequest.end();

    });

    test('Attempt to delete a user having invalid id', (done) => {

        requestOptionsTemplate.path = `${defaultPathTemplate}/${invalidUserIdForTestScenario}`;
        requestOptionsTemplate.method = 'DELETE';

        const testRequest = request(requestOptionsTemplate, (testCaseResponse) => {

            let data = '';
    
            testCaseResponse.on('data', (chunk) => {
                data += String(chunk);
            });
    
            testCaseResponse.on('end', () => {

                testResponse = testCaseResponse;
                const testResponseBody = JSON.parse(data) as ErrorResponseBody;
                const expectedBody = {
                    Error: `Invalid user ID: ${invalidUserIdForTestScenario}`,
                };
                
                expect(testResponse.statusCode).toBe(Number(process.env.CODE_INVALID!));
                expect(testResponseBody).toEqual(expectedBody);
                
                done();
    
            });
    
        });

        testRequest.end();

    });

    test('Attempt to request an unsupported method', (done) => {

        requestOptionsTemplate.path = defaultPathTemplate;
        requestOptionsTemplate.method = 'OPTIONS';

        const testRequest = request(requestOptionsTemplate, (testCaseResponse) => {
            
            let data = '';
    
            testCaseResponse.on('data', (chunk) => {
                data += String(chunk);
            });
    
            testCaseResponse.on('end', () => {

                testResponse = testCaseResponse;
                const testResponseBody = JSON.parse(data) as ErrorResponseBody;
                const expectedBody = {
                    Error: 'Unsupported method: OPTIONS',
                };

                expect(testResponse.statusCode).toBe(Number(process.env.CODE_INVALID_METHOD!));
                expect(testResponseBody).toEqual(expectedBody);
                
                done();
    
            });
    
        });

        testRequest.end();

    });

});