export class Departement {
  readonly id: string;
  title: string;
  abriviation: string;
  readonly directionId: string;
  readonly userCount: number; // carried when loaded for delete-guard

  private constructor(props: {
    id: string;
    title: string;
    abriviation: string;
    directionId: string;
    userCount: number;
  }) {
    this.id = props.id;
    this.title = props.title;
    this.abriviation = props.abriviation;
    this.directionId = props.directionId;
    this.userCount = props.userCount;
  }

  static create(props: {
    id: string;
    title: string;
    abriviation: string;
    directionId: string;
    userCount?: number;
  }): Departement {
    return new Departement({ ...props, userCount: props.userCount ?? 0 });
  }

  rename(title: string, abriviation: string): void {
    this.title = title;
    this.abriviation = abriviation;
  }

  hasEmployees(): boolean {
    return this.userCount > 0;
  }
}
