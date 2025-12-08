import got from 'got';

async function testConnection() {
	try {
		console.log('Attempting to connect to https://localhost:3999/appeals/case-submission...');
		const response = await got.post('https://localhost:3999/appeals/case-submission', {
			json: { test: 'data' },
			throwHttpErrors: false, // We want to see the response, even if 400/500
			https: { rejectUnauthorized: false }
		});
		console.log('Response status:', response.statusCode);
		console.log('Connection successful!');
	} catch (error) {
		console.error('Connection failed:', error.message);
		if (error.code) console.error('Error code:', error.code);
	}
}

testConnection();
