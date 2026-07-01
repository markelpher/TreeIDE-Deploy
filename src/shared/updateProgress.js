/**
 * Normalizes electron-updater download progress so the UI never moves backward
 * when differential/blockmap stages reset the reported percent.
 * @param {number} previousPercent
 * @param {{ percent?: number, transferred?: number, total?: number }} progress
 * @returns {number}
 */
export function normalizeDownloadPercent(previousPercent, progress) {
    let next = Number(progress?.percent);
    const transferred = Number(progress?.transferred);
    const total = Number(progress?.total);

    if (Number.isFinite(transferred) && Number.isFinite(total) && total > 0) {
        next = (transferred / total) * 100;
    }

    if (!Number.isFinite(next)) {
        next = previousPercent;
    }

    const clamped = Math.max(0, Math.min(100, Math.round(next)));
    const previous = Number.isFinite(previousPercent) ? previousPercent : 0;
    return Math.max(previous, clamped);
}