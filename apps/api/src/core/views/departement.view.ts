import { DepartementEntity } from '../entities/Departement.entity';

export class DepartementView {
  id: string;
  title: string;
  abriviation: string;
  direction?: any;
  users?: number;

  static from(entity: DepartementEntity): DepartementView {
    return Object.assign(new DepartementView(), entity);
  }

  static fromMany(entities: DepartementEntity[]): DepartementView[] {
    return entities.map(DepartementView.from);
  }
}
