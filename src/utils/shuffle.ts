export function shuffle<T>(array: T[]): T[] {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    // [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    const temp = shuffledArray[i]!;
    shuffledArray[i] = shuffledArray[j]!;
    shuffledArray[j] = temp;
  }
  return shuffledArray;
}
