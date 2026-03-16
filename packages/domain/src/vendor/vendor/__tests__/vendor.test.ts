import { describe, it, expect } from 'vitest';
import { Vendor } from '../vendor';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeVendor(overrides: Partial<Parameters<typeof Vendor.create>[0]> = {}): Vendor {
  return Vendor.create({
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

describe('Vendor (Aggregate Root)', () => {

  describe('create', () => {
    it('happy path – should create vendor with all fields correctly set', () => {
      // Act
      const vendor = makeVendor();

      // Assert
      expect(vendor.number.value).toBe('VND-001');
      expect(vendor.companyName.value).toBe('Entreprise Nationale de Construction');
      expect(vendor.fiscalIdentifiers.nif).toBe('123456789012345');
      expect(vendor.fiscalIdentifiers.nrc).toBe('98765432100123');
      expect(vendor.address.value).toBe('12 Rue des Frères Bouadou, Alger');
      expect(vendor.phoneNumbers.mobilePhone).toBe('0661234567');
      expect(vendor.phoneNumbers.homePhone).toBe('021234567');
      expect(vendor.createdAt.value).toBeInstanceOf(Date);
    });

    it('happy path – should trim whitespace from company name', () => {
      const vendor = makeVendor({ name: '  Sonatrach  ' });
      expect(vendor.companyName.value).toBe('Sonatrach');
    });

    it('failure path – should throw when company name is empty', () => {
      expect(() => makeVendor({ name: '' }))
        .toThrowError('Company name must not be empty');
    });

    it('failure path – should throw when vendor number is empty', () => {
      expect(() => makeVendor({ num: '' }))
        .toThrowError('Vendor number must not be empty');
    });

    it('failure path – should throw when NIF is empty', () => {
      expect(() => makeVendor({ nif: '' }))
        .toThrowError('NIF must not be empty');
    });

    it('failure path – should throw when NRC is empty', () => {
      expect(() => makeVendor({ nrc: '' }))
        .toThrowError('NRC must not be empty');
    });
  });

  describe('update', () => {
    it('happy path – should update company name', () => {
      // Arrange
      const vendor = makeVendor();

      // Act
      vendor.update({ name: 'Sonatrach Spa' });

      // Assert
      expect(vendor.companyName.value).toBe('Sonatrach Spa');
    });

    it('happy path – should update only provided fields, leaving others unchanged', () => {
      // Arrange
      const vendor = makeVendor();
      const originalNif = vendor.fiscalIdentifiers.nif;

      // Act
      vendor.update({ nrc: '11111111111111' });

      // Assert
      expect(vendor.fiscalIdentifiers.nrc).toBe('11111111111111');
      expect(vendor.fiscalIdentifiers.nif).toBe(originalNif);
    });

    it('happy path – should update both phone numbers together', () => {
      const vendor = makeVendor();

      vendor.update({ mobilePhone: '0770000000', homePhone: '023000000' });

      expect(vendor.phoneNumbers.mobilePhone).toBe('0770000000');
      expect(vendor.phoneNumbers.homePhone).toBe('023000000');
    });

    it('failure path – should throw when updating to an empty company name', () => {
      const vendor = makeVendor();

      expect(() => vendor.update({ name: '' }))
        .toThrowError('Company name must not be empty');
    });

    it('failure path – should throw when updating NIF to empty string', () => {
      const vendor = makeVendor();

      expect(() => vendor.update({ nif: '' }))
        .toThrowError('NIF must not be empty');
    });
  });

  describe('canBeDeleted', () => {
    it('happy path – returns true when vendor has zero agreements', () => {
      expect(makeVendor().canBeDeleted(0)).toBe(true);
    });

    it('failure path – returns false when vendor has active agreements', () => {
      expect(makeVendor().canBeDeleted(3)).toBe(false);
    });
  });
});
