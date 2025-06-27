type Generate = (
	specFile: string,
	endpointsFiles: string[],
	spec: unknown
) =>
	| false
	| {
			success: boolean;
			data: any;
	  };

declare module 'swagger-autogen' {
	export default function Init(options: { openapi: string; disableLogs: boolean }): Generate;
}
