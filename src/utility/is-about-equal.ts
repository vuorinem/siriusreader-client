export const isAboutEqual = (a: number, b: number, threshold = 0.1) => {
  return Math.abs(a - b) < threshold;
};
