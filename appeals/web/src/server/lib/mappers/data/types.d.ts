import { MappedInstructions } from '../types';

export type InitialiseAndMapDataFactory = <
	TInnerParams extends Record<string, unknown>,
	TSubMapperParams,
	TSubmapper extends (params: TSubMapperParams) => MappedInstructions,
	TTargetKey extends string
>(
	getSubmapperParams: (innerParams: TInnerParams) => TSubMapperParams,
	submaps: Record<string, TSubMapper>,
	getAppealType: (innerParams: TInnerParams) => string,
	targetKey: TTargetKey
) => (
	innerParams: TInnerParams,
	filterKeys?: string[]
) => Promise<Record<TTargetKey, MappedInstructions>>;
