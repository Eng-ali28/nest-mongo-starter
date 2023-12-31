import { Body, Controller, Get, Param, Patch, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserByAdminDto, UpdateUserDto } from './dto/update-user.dto';

import { User } from './schemas/user.schema';
import { UsersService } from './users.service';
import { CurrentUser, MagicQueryDto, ParseMongoIdPipe } from 'src/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import ValidateImageTypePipe from 'src/common/pipes/image/validateSingleImageType';
import ImageInterceptor from 'src/common/interceptors/file-upload/singleImageUpload.interceptor';
import AdminAuth from 'src/common/decorators/auth/admin-auth.decorator';
import Auth from 'src/common/decorators/auth/regular-auth.decorator';
import { USER } from '../auth/types/authUser.types';
import { UpdateUserPasswordDto } from './dto/update-password.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Auth()
    @Get(':id')
    async getUser(@Param('id', ParseMongoIdPipe) userId: string): Promise<User> {
        return await this.usersService.getUserById(userId);
    }

    @AdminAuth()
    @Get()
    async getUsers(@Query() maigcQuery: MagicQueryDto): Promise<{ data: User[]; count: number }> {
        return await this.usersService.getUsers(maigcQuery);
    }

    @AdminAuth()
    @Post()
    async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
        return await this.usersService.createUser(createUserDto);
    }

    @Auth()
    @Put()
    async updateUser(@CurrentUser(USER.ID) userId: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
        return await this.usersService.updateUser(userId, updateUserDto);
    }

    @Auth()
    @Put('update_password')
    async updateUserPassword(
        @CurrentUser(USER.ID) userId: string,
        @Body() updateUserPasswordDto: UpdateUserPasswordDto,
    ): Promise<User> {
        return await this.usersService.updateUserPassword(userId, updateUserPasswordDto);
    }

    @AdminAuth()
    @Put('admin/:id')
    async updateUserAdmin(
        @Param('id', ParseMongoIdPipe) userId: string,
        @Body() updateUserByAdminDto: UpdateUserByAdminDto,
    ): Promise<User> {
        return await this.usersService.updateUserByAdmin(userId, updateUserByAdminDto);
    }

    @AdminAuth()
    @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }), ImageInterceptor)
    @Put('set_image_admin/:id')
    async setImageAdmin(
        @Param('id', ParseMongoIdPipe) userId: string,
        @UploadedFile(new ValidateImageTypePipe(true)) file: Express.Multer.File,
    ): Promise<User> {
        return await this.usersService.setUserImage(userId, file.path);
    }

    @Auth()
    @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }), ImageInterceptor)
    @Put('set_image/:id')
    async setImage(
        @CurrentUser(USER.ID) userId: string,
        @UploadedFile(new ValidateImageTypePipe(true)) file: Express.Multer.File,
    ): Promise<User> {
        return await this.usersService.setUserImage(userId, file.path);
    }
}
