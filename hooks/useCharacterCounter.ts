export function useCharacterCounter(value: string, min: number = 0, max: number = Infinity) {
  const length = value?.length || 0;
  const remaining = max !== Infinity ? max - length : null;
  const isTooShort = length < min;
  const isTooLong = length > max;
  const isWithinRange = length >= min && length <= max;

  return {
    length,
    remaining,
    isTooShort,
    isTooLong,
    isWithinRange
  };
}
