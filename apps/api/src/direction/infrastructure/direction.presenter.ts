import { DirectionView } from '@contracts/types';
import { Direction } from 'src/direction/domain/direction';
import { DepartementPresenter } from './departement.presenter';

export class DirectionPresenter {
  static from(source: Direction): DirectionView {
    return {
      id: source.id,
      title: source.title,
      abriviation: source.abriviation,
      agreementCount: source.agreementCount,
      departements: source.departements.map((d) =>
        DepartementPresenter.from(d),
      ),
    };
  }

  static fromMany(sources: Direction[]): DirectionView[] {
    return sources.map(DirectionPresenter.from);
  }
}
