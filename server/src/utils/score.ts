/**
 * Calculate the performance score for a submission.
 *
 * Formula:  views × 1  +  likes × 5  +  comments × 10
 */
export function calculateScore(
  views: number,
  likes: number,
  comments: number
): number {
  return views * 1 + likes * 5 + comments * 10;
}
