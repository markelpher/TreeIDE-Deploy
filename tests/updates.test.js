import { isUpdateNewer } from '../src/main/ipc/updates.js';

describe('isUpdateNewer', () => {
    it('returns true only when latest is strictly greater', () => {
        expect(isUpdateNewer('2.0.50', '2.0.49')).toBe(true);
        expect(isUpdateNewer('2.1.0', '2.0.99')).toBe(true);
        expect(isUpdateNewer('3.0.0', '2.9.9')).toBe(true);
    });

    it('returns false for equal or older versions', () => {
        expect(isUpdateNewer('2.0.49', '2.0.49')).toBe(false);
        expect(isUpdateNewer('2.0.48', '2.0.49')).toBe(false);
        expect(isUpdateNewer('1.9.0', '2.0.49')).toBe(false);
    });

    it('handles v-prefixed versions', () => {
        expect(isUpdateNewer('v2.0.50', '2.0.49')).toBe(true);
        expect(isUpdateNewer('2.0.49', 'v2.0.49')).toBe(false);
    });
});