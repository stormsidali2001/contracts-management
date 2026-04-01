import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AgreementEntity } from './Agreement.entity';

@Entity('vendors')
@Index('vendor-fulltext-idx', ['num', 'nif', 'nrc', 'company_name', 'address', 'mobile_phone_number', 'home_phone_number'], { fulltext: true })
export class VendorEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  num: string; //numero de fournisseur

  @Column({ type: 'varchar', unique: true })
  company_name: string; // raison sociale : le nom de l'entreprise

  @Column({ type: 'varchar', unique: true })
  nif: string; //numero d'identification fascale

  @Column({ type: 'varchar', unique: true })
  nrc: string; // numero de registre de commerce

  @Column()
  address: string;

  @Column()
  mobile_phone_number: string;

  @Column()
  home_phone_number: string;

  @Column({ type: 'date' })
  createdAt: Date;

  @OneToMany((type) => AgreementEntity, (ag) => ag.vendor)
  agreements: AgreementEntity[];
}
