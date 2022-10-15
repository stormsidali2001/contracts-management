import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventEntity } from "src/core/entities/Event.entity";
import { EventController } from "./controllers/Event.controller";
import { EventService } from "./services/Event.service";

@Module({
    imports:[TypeOrmModule.forFeature([EventEntity])],
    controllers:[EventController],
    providers:[EventService],
    exports:[EventService]
})
export class EventModule{}