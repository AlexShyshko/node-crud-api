import dotenv from 'dotenv';
dotenv.config();
import { DataBase, DataBaseItem, ErrorResponseBody } from '../src/types-and-interfaces';
import { dataBase, loadBalancer, applicationInstance, applicationServersReady, applicationInstancesCount } from '../src/index';
import { request, RequestOptions, IncomingMessage } from 'http';
import { mc } from '../src/message-colorizer/message-colorizer';
import cluster from 'cluster';

let testResponse: IncomingMessage;
let testDataBase: DataBase;
let listOfUserIdForTestScenario: string[] = [];
const defaultPathTemplate = `/${process.env.API_BASE_PATH!}/${process.env.API_USERS_PATH!}`;
const requestOptionsTemplate: RequestOptions = {
	hostname: process.env.HOST!,
	port: process.env.PORT!,
	headers: {
		'Content-Type': process.env.CONTENT_TYPE!,
	},
};
const dataBaseItemTestTemplate = {
	id: expect.any(String),
	username: expect.any(String),
	age: expect.any(Number),
	hobbies: expect.any(Array),
};
const validFullUserTemplate = {
	username: 'Jest Test User name',
	age: Number(process.env.PORT!),
	hobbies: [`Testing applications on port ${process.env.PORT!}`],
};
const validNotFullUserTemplate = {
	username: 'NEW Jest Test User name',
	hobbies: [`Testing applications on port ${process.env.PORT!}`, 'Changing myself names'],
};

const invalidPathTemplate = `/invalid-${process.env.API_BASE_PATH!}/invalid-${process.env.API_USERS_PATH!}`;
const nonExistentUserIdForTestScenario = '5c7de414-31ff-43ea-ba91-8fcbf92441a6';
const invalidUserIdForTestScenario = 'invalid_id';
const partiallyValidUserTemplate = {
	username: 'Jest Test User name',
	age: Number(process.env.PORT!),
	hobbies: ['INVALID_HOBBY_ARRAY_WITH_EMPTY_STRING', ''],
};
const invalidUserTemplate = {
	username: { NAME_NO_STRING: 'NAME_NO_STRING' },
	age: 'ERROR TEXT',
	hobbies: ['INVALID_HOBBY_ARRAY_WITH NO_STRING', { HOBBY_NO_STRING: 'HOBBY_NO_STRING' }],
};

beforeAll((done) => {

	if (cluster.isWorker) {

		setTimeout(() => {
			console.log(mc.colorize('Exit the auxiliary worker process', 'green_bgc'));
			process.exit(0);
		}, Number(process.env.BIG_TEST_TIMEOUT!));

	} else {

		setTimeout(() => {
			done();
		}, Number(process.env.MIDDLE_TEST_TIMEOUT!));

	}

}, Number(process.env.TIMEOUT_TO_WAIT_ALL_TESTS!));

afterAll((done) => {

	if (cluster.isWorker) {
		applicationInstance.close(done);
	} else {

		console.log(mc.colorize('Test completed', 'green_bgc'));
		console.log(mc.colorize('Waiting for auxiliary worker processes exit', 'yellow_bgc'));

		dataBase.close(() => {
			loadBalancer.close(done);
		});

	}

}, Number(process.env.BIG_TEST_TIMEOUT!));

describe('Test various CRUD requests to the load balancer', () => {

	test('Create 10 random users', (done) => {

		requestOptionsTemplate.path = defaultPathTemplate;
		requestOptionsTemplate.method = 'PATCH';

		const testRequest = request(requestOptionsTemplate, (testCaseResponse) => {

			let data = '';

			testCaseResponse.on('data', (chunk) => {
				data += String(chunk);
			});

			testCaseResponse.on('end', () => {

				testResponse = testCaseResponse;
				const testResponseBody = JSON.parse(data) as DataBase;
				testDataBase = testResponseBody;
				listOfUserIdForTestScenario = Object.keys(testResponseBody);

				expect(testResponse.statusCode).toBe(Number(process.env.CODE_SUCCESS!));
				Object.values(testResponseBody).forEach((user) => {
					expect(user).toEqual(expect.objectContaining(dataBaseItemTestTemplate));
				});

				done();

			});
		});

		testRequest.end();

	});

	test('Get all users', (done) => {

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
				const expectedBody = testDataBase;

				expect(testResponse.statusCode).toBe(Number(process.env.CODE_SUCCESS!));
				expect(testResponseBody).toEqual(expectedBody);

				done();

			});

		});

		testRequest.end();

	});

	test('Get user #1', (done) => {

		requestOptionsTemplate.path = `${defaultPathTemplate}/${listOfUserIdForTestScenario[0]}`;
		requestOptionsTemplate.method = 'GET';

		const testRequest = request(requestOptionsTemplate, (testCaseResponse) => {

			let data = '';

			testCaseResponse.on('data', (chunk) => {
				data += String(chunk);
			});

			testCaseResponse.on('end', () => {

				testResponse = testCaseResponse;
				const testResponseBody = JSON.parse(data) as DataBase;
				const expectedBody = testDataBase[listOfUserIdForTestScenario[0]];

				expect(testResponse.statusCode).toBe(Number(process.env.CODE_SUCCESS!));
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

	test('Create a new test user', (done) => {

		requestOptionsTemplate.path = defaultPathTemplate;
		requestOptionsTemplate.method = 'POST';
		const preparedBody = JSON.stringify(validFullUserTemplate);

		const testRequest = request(requestOptionsTemplate, (testCaseResponse) => {

			let data = '';

			testCaseResponse.on('data', (chunk) => {
				data += String(chunk);
			});

			testCaseResponse.on('end', () => {

				testResponse = testCaseResponse;
				const testResponseBody = JSON.parse(data) as DataBaseItem;
				const testResponseResultId = testResponseBody.id;
				const expectedBody = {
					id: testResponseResultId,
					...validFullUserTemplate,
				};
				testDataBase = {
					...testDataBase,
					[testResponseResultId]: expectedBody,
				};

				expect(testResponse.statusCode).toBe(Number(process.env.CODE_CREATE!));
				expect(testResponseBody).toEqual(expectedBody);

				done();

			});

		});

		testRequest.write(preparedBody);
		testRequest.end();

	});

	test('Attempt to create a partially valid user', (done) => {

		requestOptionsTemplate.path = defaultPathTemplate;
		requestOptionsTemplate.method = 'POST';
		const preparedBody = JSON.stringify(partiallyValidUserTemplate);

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

	test('Update user\'s #2 name and hobbies', (done) => {

		requestOptionsTemplate.path = `${defaultPathTemplate}/${listOfUserIdForTestScenario[1]}`;
		requestOptionsTemplate.method = 'PUT';
		const preparedBody = JSON.stringify(validNotFullUserTemplate);

		const testRequest = request(requestOptionsTemplate, (testCaseResponse) => {

			let data = '';

			testCaseResponse.on('data', (chunk) => {
				data += String(chunk);
			});

			testCaseResponse.on('end', () => {

				testResponse = testCaseResponse;
				const testResponseBody = JSON.parse(data) as DataBaseItem;
				const testResponseResultId = testResponseBody.id;
				const expectedBody = {
                    id: testResponseResultId,
                    ...validNotFullUserTemplate,
                    age: testDataBase[testResponseResultId].age,
				};
				testDataBase = {
					...testDataBase,
					[testResponseResultId]: expectedBody,
				};

				expect(testResponse.statusCode).toBe(Number(process.env.CODE_SUCCESS!));
				expect(testResponseBody).toEqual(expectedBody);

				done();

			});

		});

		testRequest.write(preparedBody);
		testRequest.end();

	});
	
	test('Attempt to update user #3 with fully invalid properties', (done) => {

		requestOptionsTemplate.path = `${defaultPathTemplate}/${listOfUserIdForTestScenario[2]}`;
		requestOptionsTemplate.method = 'PUT';
		const preparedBody = JSON.stringify(invalidUserTemplate);

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

	test('Delete user #4', (done) => {

		requestOptionsTemplate.path = `${defaultPathTemplate}/${listOfUserIdForTestScenario[3]}`;
		requestOptionsTemplate.method = 'DELETE';

		const testRequest = request(requestOptionsTemplate, (testCaseResponse) => {

			testResponse = testCaseResponse;
			const { [listOfUserIdForTestScenario[3]]: deletedProperty, ...newDb } = testDataBase;
			testDataBase = newDb;

			expect(testResponse.statusCode).toBe(Number(process.env.CODE_DELETE!));
			done();
	
		});

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

	test('Check the data base consistency', (done) => {

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
				const expectedBody = testDataBase;

				expect(testResponse.statusCode).toBe(Number(process.env.CODE_SUCCESS!));
				expect(testResponseBody).toEqual(expectedBody);

				done();

			});

		});

		testRequest.end();

	});
	
});
