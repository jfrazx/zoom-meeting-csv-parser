import { isArray } from './helpers';

export const flattenFilter = <T>(
  values: T[] | T[][],
  cb: FlattenFilter,
  results: T[] = [],
): T[] => {
  for (const element of values) {
    if (isArray(element)) {
      flattenFilter(element, cb, results);
    } else if (cb(element)) {
      results.push(element);
    }
  }

  return results;
};

type FlattenFilter = (value: any) => boolean;
