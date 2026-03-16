export interface FiscalIdentifiersProps {
  nif: string;
  nrc: string;
}

export class FiscalIdentifiers {
  readonly nif: string;
  readonly nrc: string;

  constructor(props: FiscalIdentifiersProps) {
    if (!props.nif || props.nif.trim().length === 0) {
      throw new Error('NIF must not be empty');
    }
    if (!props.nrc || props.nrc.trim().length === 0) {
      throw new Error('NRC must not be empty');
    }
    this.nif = props.nif.trim();
    this.nrc = props.nrc.trim();
  }

  equals(other: FiscalIdentifiers): boolean {
    return this.nif === other.nif && this.nrc === other.nrc;
  }
}
