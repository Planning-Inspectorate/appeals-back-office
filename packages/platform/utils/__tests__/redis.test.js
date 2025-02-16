import { parseRedisConnectionString } from '../redis.js';

describe('redis', () => {
	describe('parseRedisConnectionString', () => {
		const tests = [
			{
				name: 'empty string',
				str: '',
				want: {},
				error: true
			},
			{
				name: 'too few parts',
				str: 'some.example.org:6380,password=some_password,ssl=True',
				want: {},
				error: true
			},
			{
				name: 'too many parts',
				str: 'some.example.org:6380,password=some_password,ssl=True,abortConnect=False,pingInterval=20000,extra=thing',
				want: {},
				error: true
			},
			{
				name: 'no port',
				str: 'some.example.org,password=some_password,ssl=True,abortConnect=False',
				want: {},
				error: true
			},
			{
				name: 'port not int',
				str: 'some.example.org:port,password=some_password,ssl=True,abortConnect=False',
				want: {},
				error: true
			},
			{
				name: 'invalid password part',
				str: 'some.example.org:port,password2=some_password,ssl=True,abortConnect=False',
				want: {},
				error: true
			},
			{
				name: 'valid config without ping settings is parsed',
				str: 'some.example.org:1234,password=some_password,ssl=True,abortConnect=False',
				want: {
					host: 'some.example.org',
					port: 1234,
					password: 'some_password',
					ssl: true,
					abortConnect: false,
					pingInterval: 300000
				}
			},
			{
				name: 'valid config with ping settings is parsed',
				str: 'some.example.org:1234,password=some_password,ssl=True,abortConnect=False,pingInterval=20000',
				want: {
					host: 'some.example.org',
					port: 1234,
					password: 'some_password',
					ssl: true,
					abortConnect: false,
					pingInterval: 20000
				}
			},
			{
				name: 'invalid pingInterval',
				str: 'some.example.org:1234,password=some_password,ssl=True,abortConnect=False,pingInterval=not-a-number',
				want: {},
				error: true
			},
			{
				name: 'case insentive for true/false',
				str: 'some.example.org:1234,password=some_password,ssl=true,abortConnect=FaLse',
				want: {
					host: 'some.example.org',
					port: 1234,
					password: 'some_password',
					ssl: true,
					abortConnect: false,
					pingInterval: 300000
				}
			}
		];
		it.each(tests)('$name', ({ str, want, error }) => {
			// this is OK because we always run one check
			/* eslint-disable jest/no-conditional-expect */
			if (error) {
				expect(() => parseRedisConnectionString(str)).toThrow();
			} else {
				const got = parseRedisConnectionString(str);
				expect(got).toEqual(want);
			}
			/* eslint-enable jest/no-conditional-expect */
		});
	});
});
