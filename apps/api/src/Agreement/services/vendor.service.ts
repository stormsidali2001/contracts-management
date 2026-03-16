import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateVendorDTO, UpdateVendorDTO } from 'src/core/dtos/vendor.dto';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { Entity } from 'src/core/types/entity.enum';
import { Operation } from 'src/core/types/operation.enum';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { StatsParamsDTO } from 'src/statistics/models/statsPramsDTO.interface';
import { UserNotificationService } from 'src/user/user-notification.service';
import { FindOptionsWhere } from 'typeorm';
import { VendorRepository } from '../vendor.repository';

@Injectable()
export class VendorService {
  constructor(
    private readonly vendorRepository: VendorRepository,
    private notificationService: UserNotificationService,
  ) {}

  async createVendor(vendor: CreateVendorDTO): Promise<VendorEntity> {
    const {
      address,
      home_phone_number,
      mobile_phone_number,
      createdAt,
      ...uniques
    } = vendor;
    let condition = '';
    const uniquesKeys = Object.keys(uniques);
    uniquesKeys.forEach((k, index) => {
      if (!uniques[k]) delete uniques[k];
      if (uniques[k])
        condition += `v.${k} = :${k} ${
          index !== uniquesKeys.length - 1 ? 'or ' : ''
        }`;
    });

    const vendorDb = await this.vendorRepository.findOneByUniqueCondition(
      condition,
      uniques,
    );
    if (vendorDb)
      throw new ForbiddenException(
        'nif , nrc , company_name  ,num doit etre unique',
      );

    const createdVendor = await this.vendorRepository.createWithStats(
      {
        address,
        createdAt: createdAt ? createdAt : new Date(),
        home_phone_number,
        mobile_phone_number,
        ...uniques,
      },
      createdAt,
    );

    await this.notificationService.sendEventToAllUsers({
      entity: Entity.VENDOR,
      operation: Operation.INSERT,
      entityId: createdVendor.id,
      createdAt: new Date(),
    });

    return createdVendor;
  }

  async findBy(options: FindOptionsWhere<VendorEntity>) {
    return this.vendorRepository.findOneBy(options);
  }

  async findAll(
    offset: number = 0,
    limit: number = 10,
    orderBy: string = undefined,
    searchQuery: string = undefined,
  ): Promise<PaginationResponse<VendorEntity>> {
    return this.vendorRepository.findPaginated(
      offset,
      limit,
      orderBy,
      searchQuery,
    );
  }

  async findByIdWithRelations(id: string) {
    return this.vendorRepository.findByIdWithRelations(id);
  }

  async updateVendor(id: string, newVendor: UpdateVendorDTO) {
    const { address, home_phone_number, mobile_phone_number, ...uniques } =
      newVendor;
    let condition = '';
    const uniquesKeys = Object.keys(uniques);
    uniquesKeys.forEach((k, index) => {
      if (!uniques[k]) delete uniques[k];
      if (uniques[k])
        condition += `v.${k} = :${k} ${
          index !== uniquesKeys.length - 1 ? 'or ' : ''
        }`;
    });

    const vendorDb = await this.vendorRepository.findOneByUniqueCondition(
      condition,
      uniques,
    );
    if (vendorDb && vendorDb.id !== id)
      throw new ForbiddenException(
        'nif , nrc , company_name  ,num doit etre unique',
      );

    const res = await this.vendorRepository.save({ ...newVendor, id });
    await this.notificationService.sendEventToAllUsers({
      entity: Entity.VENDOR,
      operation: Operation.UPDATE,
      entityId: res.id,
      createdAt: new Date(),
      departementAbriviation: '',
      directionId: null,
      departementId: null,
      directionAbriviation: '',
    });

    return res;
  }

  async getVendorsStats({ startDate, endDate }: StatsParamsDTO) {
    console.log('k....k', startDate, endDate);
    return this.vendorRepository.getVendorStats(startDate, endDate);
  }

  async deleteVendor(vendorId: string) {
    const vendorDb = await this.vendorRepository.findByIdWithAgreementCount(
      vendorId,
    );

    if (!vendorDb) throw new NotFoundException('fournisseur non trouvé');
    const agreementCount = (vendorDb as any).agreementCount as number;
    if (agreementCount > 0)
      throw new NotFoundException(
        `le fournisseur ne peut pas etre supprimer car il a ${agreementCount} accords`,
      );

    await this.vendorRepository.delete(vendorId);
    await this.notificationService.sendEventToAllUsers({
      entity: Entity.VENDOR,
      operation: Operation.DELETE,
      entityId: vendorDb.id,
      createdAt: new Date(),
      departementAbriviation: '',
      directionId: null,
      departementId: null,
      directionAbriviation: '',
    });
  }
}
