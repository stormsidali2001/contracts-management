import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import {
  Direction,
  DirectionId,
  OrganizationTitle,
  Abbreviation,
  Departement,
  DepartementId,
} from '@contracts/domain';

export class DirectionMapper {
  static toDomain(entity: DirectionEntity): Direction {
    const departements = (entity.departements ?? []).map(
      (d) => DepartementMapper.toDomain(d, entity.id),
    );
    return Direction.reconstitute({
      id: new DirectionId(entity.id),
      title: new OrganizationTitle(entity.title),
      abriviation: new Abbreviation(entity.abriviation),
      departementChiefId: (entity.departement_cheif as any)?.id ?? null,
      departements,
    });
  }

  static toPersistence(domain: Direction): Partial<DirectionEntity> {
    return {
      id: domain.getId().value,
      title: domain.title.value,
      abriviation: domain.abriviation.value,
    };
  }
}

export class DepartementMapper {
  static toDomain(entity: DepartementEntity, directionId?: string): Departement {
    const resolvedDirectionId =
      directionId ?? (entity.direction as any)?.id ?? (entity as any).directionId;
    return Departement.reconstitute({
      id: new DepartementId(entity.id),
      title: new OrganizationTitle(entity.title),
      abriviation: new Abbreviation(entity.abriviation),
      directionId: new DirectionId(resolvedDirectionId),
    });
  }

  static toPersistence(domain: Departement): Partial<DepartementEntity> {
    return {
      id: domain.getId().value,
      title: domain.title.value,
      abriviation: domain.abriviation.value,
      direction: { id: domain.directionId.value } as any,
    };
  }
}
