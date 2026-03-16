import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventEntity } from "src/core/entities/Event.entity";
import { EventController } from "./controllers/Event.controller";
import { EventService } from "./services/Event.service";
import { TypeOrmAuditEventRepository } from "src/audit/typeorm-audit-event.repository";

@Module({
    imports:[TypeOrmModule.forFeature([EventEntity])],
    controllers:[EventController],
    providers:[
        EventService,
        { provide: 'IAuditEventRepository', useClass: TypeOrmAuditEventRepository },
    ],
    exports:[EventService]
})
export class EventModule{}