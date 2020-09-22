/* eslint @typescript-eslint/explicit-module-boundary-types: 0 */
/* eslint @typescript-eslint/ban-types: 0  */

import { Transforms, ArrayTransform, Participant } from '../../interfaces';

export const isType = (type: string, compare: any) => typeof compare === type;
export const inObject = (field: string, object: any) => field in object;
export const isArray = (value: any): value is any[] => Array.isArray(value);
export const isFunction = (value: any): value is Function =>
  isType('function', value);

export const assign = (object: object, key: string, data: any) =>
  Object.assign(Object.create(null), object, { [key]: data });

export const isNullish = (value: any): value is null | undefined =>
  value === null || value === undefined;

export const isString = (value: any): value is string =>
  isType('string', value);

export const isObject = (value: any): value is object =>
  value && !isArray(value) && isType('object', value);

export const isArrayTransform = (value: Transforms): value is ArrayTransform =>
  value.length === 1;

export const isParticipant = (value: any): value is Participant =>
  isObject(value);
