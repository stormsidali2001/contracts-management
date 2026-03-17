import { Departement } from 'src/direction/domain/departement';
import { DepartementEntity } from '../entities/Departement.entity';
import { stripPrivateKeys } from './strip-private-keys.util';

type DepartementLike = DepartementEntity | Departement;

export class DepartementView {
  id: string;
  title: string;
  abriviation: string;
  direction?: any;
  users?: number;

  static from(source: DepartementLike): DepartementView {
    const view = Object.assign(new DepartementView(), stripPrivateKeys(source));
    // domain Departement uses `userCount`; DB results use `users` via loadRelationCountAndMap
    if ('userCount' in source) view.users = (source as Departement).userCount;
    return view;
  }

  static fromMany(sources: DepartementLike[]): DepartementView[] {
    return sources.map(DepartementView.from);
  }
}
