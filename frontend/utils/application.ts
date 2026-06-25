/**
 * Formats an amount to a human-readable format.
 * @param amount The amount to format. Can be of type number or string.
 * @returns The formatted amount.
 */
export function formatAmount(amount: number | string): string {
    const amountNumber = Number(amount ?? '0');
    return amountNumber.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })
}
