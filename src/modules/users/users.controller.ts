import { Controller, Get, Param, Req, UseGuards} from "@nestjs/common";
import { UserService } from "./users.service";
import { AuthGuard } from "../../auth/guards/jwt-auth.guard";



@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
@UseGuards(AuthGuard)
async getUserData(@Param('id') userId: string, @Req() req) {
  const requestingUserId = req.user['userId'];

  if (requestingUserId !== userId) {
    return { status: 'error', message: 'Unauthorized' };
  }

  return await this.userService.getUserById(userId);
}
}