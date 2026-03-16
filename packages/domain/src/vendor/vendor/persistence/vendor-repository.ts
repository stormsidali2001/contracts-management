import { Vendor } from '../vendor';

export interface VendorRepository {
  findById(id: string): Promise<Vendor | null>;
  findByNum(num: string): Promise<Vendor | null>;
  findAll(): Promise<Vendor[]>;
  save(vendor: Vendor): Promise<void>;
  delete(id: string): Promise<void>;
}
