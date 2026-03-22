import { DirectionView } from '@contracts/types';
import { Direction } from 'src/direction/domain/direction';
import { DepartementMapper } from './departement.mapper';

export class DirectionMapper {
  static from(source: Direction): DirectionView {
    return {
      id: source.id,
      title: source.title,
      abriviation: source.abriviation,
      agreementCount: source.agreementCount,
      departements: source.departements.map((d) => DepartementMapper.from(d)),
    };
  }

  static fromMany(sources: Direction[]): DirectionView[] {
    return sources.map(DirectionMapper.from);
  }
}
