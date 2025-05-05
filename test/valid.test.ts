import { DataBase, DataBaseItem } from '../src/types-and-interfaces';
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
const userToUpdateTemplate = {
    username: 'NEW Jest Test User name',
    hobbies: [`Testing applications on port ${process.env.PORT!}`, 'Changing myself names'],
};

afterAll((done) => {
    dataBase.close(done);
});

describe('Test valid CRUD requests', () => {

    test('Get an empty data base', (done) => {

        requestOptionsTemplate.path = defaultPathTemplate;
        requestOptionsTemplate.method = 'GET';

        const testRequest = request(requestOptionsTemplate, (testCaseResponse) => {
            
            let data = '';
    
            testCaseResponse.on('data', (chunk) => {
                data += String(chunk);
            });
    
            testCaseResponse.on('end', () => {

                testResponse = testCaseResponse;
                const testResponseBody = JSON.parse(data) as object;
                const expectedBody = {};

                expect(testResponse.statusCode).toBe(Number(process.env.CODE_SUCCESS!));
                expect(testResponseBody).toEqual(expectedBody);
                
                done();
    
            });
    
        });

        testRequest.end();

    });

    test('Create a new test user', (done) => {

        requestOptionsTemplate.path = defaultPathTemplate;
        requestOptionsTemplate.method = 'POST';
        const preparedBody = JSON.stringify(newUserTemplate);

        const testRequest = request(requestOptionsTemplate, (testCaseResponse) => {
            
            let data = '';
    
            testCaseResponse.on('data', (chunk) => {
                data += String(chunk);
            });
    
            testCaseResponse.on('end', () => {

                testResponse = testCaseResponse;
                const testResponseBody = JSON.parse(data) as DataBaseItem;
                userIdForTestScenario = testResponseBody.id;
                const expectedBody = {
                    id: userIdForTestScenario,
                    ...newUserTemplate,
                };
                
                expect(testResponse.statusCode).toBe(Number(process.env.CODE_CREATE!));
                expect(testResponseBody).toEqual(expectedBody);
                
                done();
    
            });
    
        });

        testRequest.write(preparedBody);
        testRequest.end();

    });

    test('Get a data base containing the test user', (done) => {

        requestOptionsTemplate.path = defaultPathTemplate;
        requestOptionsTemplate.method = 'GET';

        const testRequest = request(requestOptionsTemplate, (testCaseResponse) => {
            
            let data = '';
    
            testCaseResponse.on('data', (chunk) => {
                data += String(chunk);
            });
    
            testCaseResponse.on('end', () => {

                testResponse = testCaseResponse;
                const testResponseBody = JSON.parse(data) as DataBase;
                const expectedBody = {
                    [userIdForTestScenario]: {
                        id: userIdForTestScenario,
                        ...newUserTemplate,
                    },
                };

                expect(testResponse.statusCode).toBe(Number(process.env.CODE_SUCCESS!));
                expect(testResponseBody).toEqual(expectedBody);
                
                done();
    
            });
    
        });

        testRequest.end();

    });

    test('Update the test user\'s name and hobbies', (done) => {

        requestOptionsTemplate.path = `${defaultPathTemplate}/${userIdForTestScenario}`;
        requestOptionsTemplate.method = 'PUT';
        const preparedBody = JSON.stringify(userToUpdateTemplate);

        const testRequest = request(requestOptionsTemplate, (testCaseResponse) => {
            
            let data = '';
    
            testCaseResponse.on('data', (chunk) => {
                data += String(chunk);
            });
    
            testCaseResponse.on('end', () => {

                testResponse = testCaseResponse;
                const testResponseBody = JSON.parse(data) as DataBaseItem;
                const expectedBody = {
                    id: userIdForTestScenario,
                    ...userToUpdateTemplate,
                    age: newUserTemplate.age,
                };
                
                expect(testResponse.statusCode).toBe(Number(process.env.CODE_SUCCESS!));
                expect(testResponseBody).toEqual(expectedBody);
                
                done();
    
            });
    
        });

        testRequest.write(preparedBody);
        testRequest.end();

    });

    test('Get the updated test user', (done) => {

        requestOptionsTemplate.path = `${defaultPathTemplate}/${userIdForTestScenario}`;
        requestOptionsTemplate.method = 'GET';

        const testRequest = request(requestOptionsTemplate, (testCaseResponse) => {
            
            let data = '';
    
            testCaseResponse.on('data', (chunk) => {
                data += String(chunk);
            });
    
            testCaseResponse.on('end', () => {

                testResponse = testCaseResponse;
                const testResponseBody = JSON.parse(data) as DataBaseItem;
                const expectedBody = {
                    id: userIdForTestScenario,
                    ...userToUpdateTemplate,
                    age: newUserTemplate.age,
                };

                expect(testResponse.statusCode).toBe(Number(process.env.CODE_SUCCESS!));
                expect(testResponseBody).toEqual(expectedBody);
                
                done();
    
            });
    
        });

        testRequest.end();

    });

    test('Delete the test user', (done) => {

        requestOptionsTemplate.path = `${defaultPathTemplate}/${userIdForTestScenario}`;
        requestOptionsTemplate.method = 'DELETE';

        const testRequest = request(requestOptionsTemplate, (testCaseResponse) => {

            testResponse = testCaseResponse;

            expect(testResponse.statusCode).toBe(Number(process.env.CODE_DELETE!));
            done();
    
        });

        testRequest.end();

    });

    test('Ensure that the data base is empty again', (done) => {

        requestOptionsTemplate.path = defaultPathTemplate;
        requestOptionsTemplate.method = 'GET';

        const testRequest = request(requestOptionsTemplate, (testCaseResponse) => {
            
            let data = '';
    
            testCaseResponse.on('data', (chunk) => {
                data += String(chunk);
            });
    
            testCaseResponse.on('end', () => {

                testResponse = testCaseResponse;
                const testResponseBody = JSON.parse(data) as object;
                const expectedBody = {};

                expect(testResponse.statusCode).toBe(Number(process.env.CODE_SUCCESS!));
                expect(testResponseBody).toEqual(expectedBody);
                
                done();
    
            });
    
        });

        testRequest.end();

    });

});