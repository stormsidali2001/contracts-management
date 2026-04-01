import { DepartementView } from '@contracts/types';
import { Departement } from 'src/direction/domain/departement';

export class DepartementPresenter {
  static from(source: Departement): DepartementView {
    return {
      id: source.id,
      title: source.title,
      abriviation: source.abriviation,
      users: source.userCount,
    };
  }

  static fromMany(sources: Departement[]): DepartementView[] {
    return sources.map(DepartementPresenter.from);
  }
}
