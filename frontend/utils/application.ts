import { Application } from '@/types';

/**
 * Formats an amount to a human-readable format.
 * @param amount The amount to format. Can be of type number or string.
 * @returns The formatted amount.
 */
export function formatAmount(amount: number | string): string {
  const amountNumber = Number(amount ?? '0');
  return amountNumber.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Determines whether an application has been returned for changes.
 * An application is considered returned when its latest audit log reflects
 * a transition from `under_review` back to `draft` with a reviewer comment.
 *
 * @param app - The application to check.
 * @returns `true` if the application has been returned for changes.
 */
export function isReturnedForChanges(app: Application): boolean {
  const log = [...app.audit_logs].sort((x, y) => y.id - x.id)[0];
  return (
    app.status === 'draft' &&
    app.audit_logs.length > 0 &&
    log.from_status === 'under_review' &&
    log.to_status === 'draft' &&
    (log.comment || '').trim() !== ''
  );
}

/**
 * Returns the number of times an application has been returned for changes.
 * Counts all audit log entries reflecting a transition from `under_review`
 * back to `draft` that include a reviewer comment.
 *
 * @param app - The application to count return comments for.
 * @returns The number of return-for-changes comments.
 */
export function getReturnCommentCount(app: Application): number {
  return app.audit_logs.filter(
    (log) =>
      log.from_status === 'under_review' &&
      log.to_status === 'draft' &&
      (log.comment || '').trim() !== ''
  ).length;
}
