import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity('vendor_stats')
export class VendorStatsEntity{
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column({type:'date',unique:true})
    date:Date;

    @Column()
    nb_vendors:number;
}