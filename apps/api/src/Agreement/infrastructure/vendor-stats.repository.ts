import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VendorStatsEntity } from 'src/core/entities/VendorStats.entity';
import { Repository } from 'typeorm';
@Injectable()
export class VendorStatsRepository {
  constructor(
    @InjectRepository(VendorStatsEntity)
    private readonly repo: Repository<VendorStatsEntity>,
  ) {}

  async incrementForDate(date: Date): Promise<void> {
    const dateOnly = date.toISOString().slice(0, 10);
    const existing = await this.repo.findOneBy({ date: dateOnly as any });
    if (existing) {
      await this.repo.update(
        { id: existing.id },
        { nb_vendors: () => 'nb_vendors + 1' },
      );
    } else {
      await this.repo.save({ date: dateOnly as any, nb_vendors: 1 });
    }
  }
}
