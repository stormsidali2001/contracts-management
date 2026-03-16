"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const vendor_1 = require("../vendor");
// ─── Helpers ────────────────────────────────────────────────────────────────
function makeVendor(overrides = {}) {
    return vendor_1.Vendor.create({
        id: 'f1e2d3c4-b5a6-7890-fedc-ba9876543210',
        num: 'VND-001',
        name: 'Entreprise Nationale de Construction',
        nif: '123456789012345',
        nrc: '98765432100123',
        address: '12 Rue des Frères Bouadou, Alger',
        mobilePhone: '0661234567',
        homePhone: '021234567',
        ...overrides,
    });
}
// ─── Tests ──────────────────────────────────────────────────────────────────
(0, vitest_1.describe)('Vendor (Aggregate Root)', () => {
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('happy path – should create vendor with all fields correctly set', () => {
            // Act
            const vendor = makeVendor();
            // Assert
            (0, vitest_1.expect)(vendor.number.value).toBe('VND-001');
            (0, vitest_1.expect)(vendor.companyName.value).toBe('Entreprise Nationale de Construction');
            (0, vitest_1.expect)(vendor.fiscalIdentifiers.nif).toBe('123456789012345');
            (0, vitest_1.expect)(vendor.fiscalIdentifiers.nrc).toBe('98765432100123');
            (0, vitest_1.expect)(vendor.address.value).toBe('12 Rue des Frères Bouadou, Alger');
            (0, vitest_1.expect)(vendor.phoneNumbers.mobilePhone).toBe('0661234567');
            (0, vitest_1.expect)(vendor.phoneNumbers.homePhone).toBe('021234567');
            (0, vitest_1.expect)(vendor.createdAt.value).toBeInstanceOf(Date);
        });
        (0, vitest_1.it)('happy path – should trim whitespace from company name', () => {
            const vendor = makeVendor({ name: '  Sonatrach  ' });
            (0, vitest_1.expect)(vendor.companyName.value).toBe('Sonatrach');
        });
        (0, vitest_1.it)('failure path – should throw when company name is empty', () => {
            (0, vitest_1.expect)(() => makeVendor({ name: '' }))
                .toThrowError('Company name must not be empty');
        });
        (0, vitest_1.it)('failure path – should throw when vendor number is empty', () => {
            (0, vitest_1.expect)(() => makeVendor({ num: '' }))
                .toThrowError('Vendor number must not be empty');
        });
        (0, vitest_1.it)('failure path – should throw when NIF is empty', () => {
            (0, vitest_1.expect)(() => makeVendor({ nif: '' }))
                .toThrowError('NIF must not be empty');
        });
        (0, vitest_1.it)('failure path – should throw when NRC is empty', () => {
            (0, vitest_1.expect)(() => makeVendor({ nrc: '' }))
                .toThrowError('NRC must not be empty');
        });
    });
    (0, vitest_1.describe)('update', () => {
        (0, vitest_1.it)('happy path – should update company name', () => {
            // Arrange
            const vendor = makeVendor();
            // Act
            vendor.update({ name: 'Sonatrach Spa' });
            // Assert
            (0, vitest_1.expect)(vendor.companyName.value).toBe('Sonatrach Spa');
        });
        (0, vitest_1.it)('happy path – should update only provided fields, leaving others unchanged', () => {
            // Arrange
            const vendor = makeVendor();
            const originalNif = vendor.fiscalIdentifiers.nif;
            // Act
            vendor.update({ nrc: '11111111111111' });
            // Assert
            (0, vitest_1.expect)(vendor.fiscalIdentifiers.nrc).toBe('11111111111111');
            (0, vitest_1.expect)(vendor.fiscalIdentifiers.nif).toBe(originalNif);
        });
        (0, vitest_1.it)('happy path – should update both phone numbers together', () => {
            const vendor = makeVendor();
            vendor.update({ mobilePhone: '0770000000', homePhone: '023000000' });
            (0, vitest_1.expect)(vendor.phoneNumbers.mobilePhone).toBe('0770000000');
            (0, vitest_1.expect)(vendor.phoneNumbers.homePhone).toBe('023000000');
        });
        (0, vitest_1.it)('failure path – should throw when updating to an empty company name', () => {
            const vendor = makeVendor();
            (0, vitest_1.expect)(() => vendor.update({ name: '' }))
                .toThrowError('Company name must not be empty');
        });
        (0, vitest_1.it)('failure path – should throw when updating NIF to empty string', () => {
            const vendor = makeVendor();
            (0, vitest_1.expect)(() => vendor.update({ nif: '' }))
                .toThrowError('NIF must not be empty');
        });
    });
    (0, vitest_1.describe)('canBeDeleted', () => {
        (0, vitest_1.it)('happy path – returns true when vendor has zero agreements', () => {
            (0, vitest_1.expect)(makeVendor().canBeDeleted(0)).toBe(true);
        });
        (0, vitest_1.it)('failure path – returns false when vendor has active agreements', () => {
            (0, vitest_1.expect)(makeVendor().canBeDeleted(3)).toBe(false);
        });
    });
});
//# sourceMappingURL=vendor.test.js.map