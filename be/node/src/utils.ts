// Shuffle an array and return the shuffled array.
const shuffle = <T>(arr: T[]): T[] => {
  const shuffled = [...arr]; // Create a copy of the array
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
  }
  return shuffled;
};

export default {
  shuffle,
};
