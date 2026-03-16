export interface ExecutionPeriodProps {
  startDate: Date;
  endDate: Date;
}

export class ExecutionPeriod {
  readonly startDate: Date;
  readonly endDate: Date;

  constructor(props: ExecutionPeriodProps) {
    if (props.startDate >= props.endDate) {
      throw new Error('Execution start date must be before end date');
    }
    this.startDate = new Date(props.startDate.getTime());
    this.endDate = new Date(props.endDate.getTime());
  }

  equals(other: ExecutionPeriod): boolean {
    return (
      this.startDate.getTime() === other.startDate.getTime() &&
      this.endDate.getTime() === other.endDate.getTime()
    );
  }
}
