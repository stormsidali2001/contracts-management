import {Global, Module} from '@nestjs/common'
import {SocketStateService} from './SocketState.service'

@Global()
@Module({
    providers:[SocketStateService],
    exports:[SocketStateService]
})
export  class SocketStateModule{}