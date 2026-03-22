import { describe, it, expect } from '@jest/globals';
import { Vendor } from './vendor.aggregate';
import { VendorCreatedEvent } from './events/vendor-created.event';
import { VendorUpdatedEvent } from './events/vendor-updated.event';
import { VendorDeletedEvent } from './events/vendor-deleted.event';

function makeProps(
  overrides: Partial<Parameters<typeof Vendor.create>[0]> = {},
) {
  return {
    id: 'vendor-1',
    num: 'V-001',
    company_name: 'Acme Corp',
    nif: 'NIF-123',
    nrc: 'NRC-456',
    address: '10 Main Street',
    mobile_phone_number: '0550000000',
    home_phone_number: '0210000000',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

function createVendor(
  overrides: Partial<Parameters<typeof Vendor.create>[0]> = {},
) {
  return Vendor.create(makeProps(overrides));
}

describe('Vendor (Aggregate Root)', () => {
  describe('create', () => {
    it('happy path – should set all props correctly', () => {
      // Act
      const vendor = createVendor();

      // Assert
      expect(vendor.id).toBe('vendor-1');
      expect(vendor.num).toBe('V-001');
      expect(vendor.company_name).toBe('Acme Corp');
      expect(vendor.nif).toBe('NIF-123');
      expect(vendor.nrc).toBe('NRC-456');
    });

    it('happy path – should emit VendorCreatedEvent with vendor id', () => {
      // Act
      const vendor = createVendor();

      // Assert
      const events = vendor.pullEvents();
      expect(events).toHaveLength(1);
      const event = events[0] as VendorCreatedEvent;
      expect(event).toBeInstanceOf(VendorCreatedEvent);
      expect(event.vendorId).toBe('vendor-1');
    });
  });

  describe('reconstitute', () => {
    it('happy path – should not emit any events', () => {
      const vendor = Vendor.reconstitute(makeProps());
      expect(vendor.pullEvents()).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('happy path – should update provided fields and emit VendorUpdatedEvent', () => {
      // Arrange
      const vendor = createVendor();
      vendor.pullEvents(); // clear creation event

      // Act
      vendor.update({ company_name: 'New Corp', address: '99 New Street' });

      // Assert
      expect(vendor.company_name).toBe('New Corp');
      expect(vendor.address).toBe('99 New Street');
      expect(vendor.num).toBe('V-001'); // unchanged

      const events = vendor.pullEvents();
      expect(events).toHaveLength(1);
      const event = events[0] as VendorUpdatedEvent;
      expect(event).toBeInstanceOf(VendorUpdatedEvent);
      expect(event.vendorId).toBe('vendor-1');
    });

    it('happy path – should emit VendorUpdatedEvent even when updating a single field', () => {
      // Arrange
      const vendor = createVendor();
      vendor.pullEvents();

      // Act
      vendor.update({ nif: 'NIF-NEW' });

      // Assert
      expect(vendor.nif).toBe('NIF-NEW');
      const events = vendor.pullEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(VendorUpdatedEvent);
    });
  });

  describe('markDeleted', () => {
    it('happy path – should emit VendorDeletedEvent with vendor id', () => {
      // Arrange
      const vendor = createVendor();
      vendor.pullEvents();

      // Act
      vendor.markDeleted();

      // Assert
      const events = vendor.pullEvents();
      expect(events).toHaveLength(1);
      const event = events[0] as VendorDeletedEvent;
      expect(event).toBeInstanceOf(VendorDeletedEvent);
      expect(event.vendorId).toBe('vendor-1');
    });
  });

  describe('canBeDeleted', () => {
    it('happy path – should return true when vendor has no agreements', () => {
      const vendor = createVendor();
      expect(vendor.canBeDeleted(0)).toBe(true);
    });

    it('failure path – should return false when vendor has one or more agreements', () => {
      const vendor = createVendor();
      expect(vendor.canBeDeleted(1)).toBe(false);
      expect(vendor.canBeDeleted(5)).toBe(false);
    });
  });
});
