import { Injectable, InternalServerErrorException, Logger,BadRequestException, ForbiddenException, forwardRef, Inject, NotFoundException } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { ConnectedUserResetPassword, CreateUserDTO, UpdateUserDTO } from "src/core/dtos/user.dto";
import { DepartementEntity } from "src/core/entities/Departement.entity";
import { DirectionEntity } from "src/core/entities/Direction.entity";
import { NotificationEntity } from "src/core/entities/Notification.entity";
import { PasswordTokenEntity } from "src/core/entities/PasswordToken";
import { UserEntity } from "src/core/entities/User.entity";
import { Entity } from "src/core/types/entity.enum";
import { Operation } from "src/core/types/operation.enum";
import { PaginationResponse } from "src/core/types/paginationResponse.interface";
import { UserRole } from "src/core/types/UserRole.enum";
import { DirectionService } from "src/direction/services/direction.service";
import { StatsParamsDTO } from "src/statistics/models/statsPramsDTO.interface";
import { DataSource, FindManyOptions, FindOptionsWhere, Repository, UpdateResult } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { NotificationBody, UserNotificationService } from "./user-notification.service";

@Injectable()
export class UserService{
    private logger = new Logger(UserService.name);
    constructor(
        @InjectRepository(UserEntity) private userRepository:Repository<UserEntity>,
        private readonly directionService:DirectionService,
        @InjectDataSource() private readonly dataSource:DataSource,
        @Inject(forwardRef(()=>UserNotificationService)) private readonly notificationService:UserNotificationService
        ){}
    async create(newUser:CreateUserDTO):Promise<UserEntity>{
        const {departementId = null,directionId = null,...userData} = newUser;  
        let direction:DirectionEntity,departement:DepartementEntity;
        if(directionId && departementId){
            direction = await this.directionService.findDirectionWithDepartement(directionId,departementId)
            if(!direction){
                throw new  BadRequestException("direction not found");
            }
            departement = direction.departements.length > 0 ? direction.departements[0]:null;
            if(!departement){
                throw new  BadRequestException("departement is not in direction");
            }
        }
        const res = await  this.userRepository.save({...userData,direction,departement});
        console.log('testoooooooo',direction)
        //send notification to admins
        const adminUsers = await this.userRepository.createQueryBuilder('u')
        .where('u.role = :userRole',{userRole:UserRole.ADMIN})
        .getMany();
        const extraMessage = departement && direction ?`au ${departement.abriviation} de ${direction.abriviation}`:"";
        const notifications:NotificationBody[] = adminUsers.map(u=>({userId:u.id,message:`l'utilisateur ${res.email} de type ${res.role} est ajouté ${extraMessage} avec success`}));
        
        if(notifications.length > 0) await this.notificationService.sendNotifications(notifications);
        await this.notificationService.emitDataToAdminsOnly({entity:res.role as unknown as Entity,operation:Operation.INSERT,departementId:departementId,directionId,entityId:res.id,departementAbriviation:departement?.abriviation ?? "",directionAbriviation:direction?.abriviation ?? ""})
        await this.notificationService.IncrementUsersStats({type:res.role as unknown as Entity,operation:Operation.INSERT});
        return res;
    }
    async findBy(options:FindOptionsWhere<UserEntity>):Promise<UserEntity>{
        return this.userRepository.findOneBy(options)
    }
    async  getUserPassword(id:string):Promise<UserEntity>{
        return await this.userRepository.createQueryBuilder('u')
        .select('u.password')
        .where('u.id = :userId',{userId:id})
        .getOne();
    }
    async findByEmailWithToken(email:string):Promise<UserEntity>{
        return this.userRepository.createQueryBuilder('u')
        .where('u.email = :email',{email})
        .leftJoinAndSelect('u.password_token','password_token')
        .getOne();
    }
    async findByIdWithToken(userId:string):Promise<UserEntity>{
        return this.userRepository.createQueryBuilder('u')
        .where('u.id = :userId',{userId})
        .leftJoinAndSelect('u.password_token','password_token')
        .getOne();
    }
    async findByEmailOrUsername({email,username}:{email:string,username:string}):Promise<UserEntity>{
        try{
            return this.userRepository.createQueryBuilder('user')
            .select(['user.password','user.email','user.username','user.id','user.firstName','user.lastName','user.imageUrl','user.role','user.departementId','user.directionId','user.recieve_notifications','user.active'])
            .where('user.username = :username or user.email = :email',{username,email})
            .getOne();
        }catch(err){
            throw new InternalServerErrorException(err);
        }
    }
    async findAndUpdate(userId:string,partialEntity: QueryDeepPartialEntity<UserEntity>):Promise<UpdateResult>{
        return this.userRepository.update({id:userId},partialEntity);
    }
    async findAll(
            offset:number = 0 ,
            limit:number = 10 ,
            orderBy:string = undefined ,
            searchQuery:string = undefined , 
            departementId:string = undefined,
            directionId:string = undefined ,
            active:"active" | "not_active" = undefined , 
            role:UserRole = undefined
        ):Promise<PaginationResponse<UserEntity>>{
        let query =    this.userRepository.createQueryBuilder('user')
        .skip(offset)
        .take(limit);

        if(searchQuery && searchQuery.length >= 2){
            query = query
            .andWhere(`(
                MATCH(user.email) AGAINST ('${searchQuery}' IN BOOLEAN MODE)
                or MATCH(user.firstName) AGAINST ('${searchQuery}' IN BOOLEAN MODE)
                or MATCH(user.lastName) AGAINST ('${searchQuery}' IN BOOLEAN MODE)
                or MATCH(user.username) AGAINST ('${searchQuery}' IN BOOLEAN MODE)
            )`)
           
        }
        if(departementId){
            query = query 
            .andWhere('user.departementId = :departementId',{departementId})
            
        }
        if(directionId){
            query = query 
            .andWhere('user.directionId = :directionId',{directionId})
            
        }
        if(active){
            query = query 
            .andWhere('user.active = :active',{active:active === "active"?true:false})
        }
        if(role){
            query = query 
            .andWhere('user.role = :role',{role})
        }

        if(orderBy){
            query = query.orderBy(`${orderBy}`);
        }
        const res = await query.getManyAndCount();

        return {
            total:res[1],
            data:res[0]
        }
    }   
  
    async updateUserUniqueCheck(id:string,newUser:UpdateUserDTO , currentUserId:string):Promise<UpdateResult>{
       
            const currentUser = await this.userRepository.findOneBy({id:currentUserId})
            if(!currentUser) throw new InternalServerErrorException("connected user not found")
            const userDb = await this.userRepository.createQueryBuilder('user')
            .select(['user.password','user.email','user.username','user.id','user.firstName','user.lastName','user.imageUrl','user.role','user.departementId','user.directionId'])
            .where('user.username = :username or user.email = :email',{username:newUser.username,email:newUser.email})
            .leftJoinAndSelect('user.departement','dp')
            .leftJoinAndSelect("user.direction",'dr')
            .getOne();
            const departement = userDb?.departement;
            const direction = userDb?.direction;
            if(!userDb) throw new NotFoundException("l'utilisateur n'existe pas")
            if(currentUser.role !== UserRole.ADMIN && userDb.id  !== currentUser.id) throw new ForbiddenException("permission denied")
            if(userDb && userDb.id !== id) throw new ForbiddenException("username et l'email   exists deja")
             const {imageUrl} = newUser
             if(!imageUrl) delete newUser.imageUrl
             const res = await  this.userRepository.update(id,{...newUser})
             await this.notificationService.emitDataToAdminsOnly({
                entity:userDb.role as unknown as Entity,
                entityId:id,
                operation:Operation.UPDATE,
                departementId:userDb.departementId,
                directionId:userDb.directionId,
                departementAbriviation:userDb?.departement?.abriviation ?? "",
                directionAbriviation:userDb?.direction?.abriviation ?? ""
             })
             const adminUsers = await this.userRepository.createQueryBuilder('u')
             .where('u.role = :userRole',{userRole:UserRole.ADMIN})
             .getMany();
             const extraMessage = departement && direction ?`au ${departement.abriviation} de ${direction.abriviation}`:"";
             const notifications:NotificationBody[] = adminUsers.map(u=>({userId:u.id,message:`l'utilisateur ${userDb.email} de type ${userDb.role}  ${extraMessage} est mis a jour avec success`}));
             
             if(notifications.length > 0) await this.notificationService.sendNotifications(notifications);
             await this.notificationService.emitDataToAdminsOnly({entity:userDb.role as unknown as Entity,operation:Operation.UPDATE,departementId:departement?.id,directionId:direction?.id,entityId:userDb.id,departementAbriviation:departement?.abriviation ?? "",directionAbriviation:direction?.abriviation ?? ""})
             await this.notificationService.IncrementUsersStats({type:userDb.role as unknown as Entity,operation:Operation.UPDATE});

             return res;
    }

   

    async findByIdWithDepartementAndDirection(id:string){
        return this.userRepository.createQueryBuilder("u")
        .where('u.id = :id',{id})
        .leftJoinAndSelect("u.departement","dp")
        .leftJoinAndSelect("u.direction","dr")
        .getOne()
    }
    async findAllBy(options:FindOptionsWhere<UserEntity> | FindOptionsWhere<UserEntity>[]){
        return this.userRepository.find({where:options})
    }
    async getUserTypesStats({startDate,endDate}:StatsParamsDTO,user:UserEntity){
        let query =   this.userRepository.createQueryBuilder('u')
        .select('count(u.id)','total')
        .addSelect('u.role','role')
        .groupBy('u.role')

      

        if(startDate){
            query = query.andWhere('u.created_at >= :startDate',{startDate})
        }

        if(endDate){
            query = query.andWhere('u.created_at <= :endDate',{endDate})
        }


        const stats = await query.getRawMany();

        const response:any = {
            juridical:0,
            employee:0,
            admin:0,
            total:0
        }
        stats.forEach(st=>{
            response[(st.role as unknown as String).toLowerCase()] = parseInt(st.total);
        })
        response.total = response.juridical + response.admin + response.employee;
        return response;
    }

    async updateUserPasswordToken(token:string,userId:string){
        await this.dataSource.transaction(async manager =>{
            const userRepository = manager.getRepository(UserEntity);
            const passwordTokenRepository = manager.getRepository(PasswordTokenEntity);
            const tokenDb = await passwordTokenRepository.save({token,expiresIn:new Date(Date.now()+1000*60*15)});
           await userRepository.update(userId,{password_token:tokenDb})
         
        })
    }
    async deleteUserPasswordToken(id:string,userId:string){
      
         await this.dataSource.transaction(async manager =>{

             const userRepository = manager.getRepository(UserEntity);
             const passwordTokenRepository = manager.getRepository(PasswordTokenEntity);
             await userRepository.update(userId,{password_token:null})
             await  passwordTokenRepository.delete(id);

         }
         )
        

    }
    async deleteUserPasswordTokenAndUpdatePassword(id:string,userId:string,password:string,directionId:string,departementId:string,userRole:UserRole){
         await this.dataSource.transaction(async manager =>{

             const userRepository = manager.getRepository(UserEntity);
             const passwordTokenRepository = manager.getRepository(PasswordTokenEntity);
             await userRepository.update(userId,{password_token:null,password})
             await  passwordTokenRepository.delete(id);
           
           
         }
         
         )
         const userDb = await this.userRepository.createQueryBuilder('u')
         .where('u.id = :userId',{userId})
         .leftJoinAndSelect('u.departement','dp')
         .leftJoinAndSelect('u.direction','dr')
         .getOne();
         await this.notificationService.emitDataToAdminsOnly({
            entity:userRole as unknown as Entity ,
            entityId:userId,
            operation:Operation.UPDATE,
            directionId,
            departementId,
            departementAbriviation:userDb?.departement?.abriviation ?? "",
            directionAbriviation:userDb?.direction?.abriviation ?? ""
         })
         const adminUsers = await this.userRepository.createQueryBuilder('u')
         .where('u.role = :userRole',{userRole:UserRole.ADMIN})
         .getMany();
         const departement = userDb?.departement;
         const direction = userDb?.direction;
         const extraMessage = departement && direction ?`au ${departement.abriviation} de ${direction.abriviation}`:"";
         const notifications:NotificationBody[] = adminUsers.map(u=>({userId:u.id,message:`l'utilisateur ${userDb.email} de type ${userDb.role}  ${extraMessage} est mise a jour avec success`}));
         
         if(notifications.length > 0) await this.notificationService.sendNotifications(notifications);
         await this.notificationService.emitDataToAdminsOnly({entity:userDb.role as unknown as Entity,operation:Operation.UPDATE,departementId:departement?.id,directionId:direction?.id,entityId:userDb.id,departementAbriviation:departement?.abriviation ?? "",directionAbriviation:direction?.abriviation ?? ""})
         await this.notificationService.IncrementUsersStats({type:userDb.role as unknown as Entity,operation:Operation.UPDATE});

           

    }

    async updateUserPassword(id:string , hashed_password:string){
        return await this.userRepository.update(id,{password:hashed_password})
    }
    async recieveNotifications( userId:string,recieve_notifications:boolean){
        const userDb = await this.userRepository.createQueryBuilder('u')
        .where('u.id = :userId',{userId})
        .leftJoinAndSelect('u.departement','dp')
        .leftJoinAndSelect('u.direction','dr')
        .getOne()
        //@ts-ignore
            await this.userRepository.update(userId,{recieve_notifications:()=>"!recieve_notifications"})
            await this.notificationService.emitDataToAdminsOnly({
                entity:userDb.role as unknown as Entity ,
                entityId:userId,
                operation:Operation.UPDATE,
                directionId:userDb.directionId,
                departementId:userDb.departementId,
                departementAbriviation:userDb?.departement?.abriviation ?? "",
                directionAbriviation:userDb?.direction?.abriviation ?? ""
                
                

             })
            return !recieve_notifications;
    }

    async deleteUser(userId:string){
        const userDb = await this.userRepository.createQueryBuilder('u')
        .where('u.id = :userId',{userId})
        .leftJoinAndSelect('u.departement','dp')
        .leftJoinAndSelect("u.direction",'dr')
        .getOne();
        const departement = userDb?.departement;
        const direction = userDb?.direction;
        Logger.debug(userId+"---->"+JSON.stringify(userDb),'deleteUser')
        if(!userDb) throw new NotFoundException("l'utilisateur n'est pas trouvé")

       
        await this.dataSource.transaction(async manager =>{

            Logger.debug("transaction started----------------","deleteUser/transaction")

            const userRepository = manager.getRepository(UserEntity);
            const notificationRepository = manager.getRepository(NotificationEntity)

          
            await notificationRepository.createQueryBuilder()
            .delete()
            .where('notifications.userId = :userId',{userId})
            .execute();
            await userRepository.createQueryBuilder()
            .delete()
            .where('users.id = :userId',{userId})
            .execute();
            Logger.debug("transaction ended------------","deleteUser/transaction")
            
        })
        await this.notificationService.emitDataToAdminsOnly({
            entity:userDb.role as unknown as Entity ,
            entityId:userDb.role,
            operation:Operation.DELETE,
            directionId:direction?.id,
            departementId:departement?.id,
            departementAbriviation:userDb?.departement?.abriviation ?? "",
            directionAbriviation:userDb?.direction?.abriviation ?? ""
         })
         const adminUsers = await this.userRepository.createQueryBuilder('u')
         .where('u.role = :userRole',{userRole:UserRole.ADMIN})
         .getMany();
         const extraMessage = departement && direction ?`au ${departement.abriviation} de ${direction.abriviation}`:"";
         const notifications:NotificationBody[] = adminUsers.map(u=>({userId:u.id,message:`l'utilisateur ${userDb.email} de type ${userDb.role} est supprimé ${extraMessage} avec success`}));
         
         if(notifications.length > 0) await this.notificationService.sendNotifications(notifications);
         await this.notificationService.emitDataToAdminsOnly({entity:userDb.role as unknown as Entity,operation:Operation.DELETE,departementId:departement?.id,directionId:direction?.id,entityId:userDb.id,departementAbriviation:departement?.abriviation ?? "",directionAbriviation:direction?.abriviation ?? ""})
         await this.notificationService.IncrementUsersStats({type:userDb.role as unknown as Entity,operation:Operation.DELETE});
    }

    
  

}