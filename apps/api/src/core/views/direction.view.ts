import { DirectionEntity } from '../entities/Direction.entity';

export class DirectionView {
  id: string;
  title: string;
  abriviation: string;
  departements?: any[];
  departement_cheif?: any;
  agreementCount?: number;

  static from(entity: DirectionEntity): DirectionView {
    return Object.assign(new DirectionView(), entity);
  }

  static fromMany(entities: DirectionEntity[]): DirectionView[] {
    return entities.map(DirectionView.from);
  }
}
