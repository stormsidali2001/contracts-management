import { Direction } from 'src/direction/domain/direction';
import { DirectionEntity } from '../entities/Direction.entity';
import { DepartementView } from './departement.view';
import { stripPrivateKeys } from './strip-private-keys.util';

type DirectionLike = DirectionEntity | Direction;

export class DirectionView {
  id: string;
  title: string;
  abriviation: string;
  departements?: any[];
  departement_cheif?: any;
  agreementCount?: number;

  static from(source: DirectionLike): DirectionView {
    const view = Object.assign(new DirectionView(), stripPrivateKeys(source));
    if (view.departements?.length) {
      view.departements = view.departements.map((d) => DepartementView.from(d));
    }
    return view;
  }

  static fromMany(sources: DirectionLike[]): DirectionView[] {
    return sources.map(DirectionView.from);
  }
}
