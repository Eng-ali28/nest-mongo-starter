import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserDto } from './dto/update-user.dto';

import { User } from './schemas/user.schema';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import TimeService from 'src/common/util/time.service';

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {}

    async getUserById(userId: string): Promise<User> {
        const user = await this.usersRepository.findOne({ _id: userId });

        if (!user) throw new NotFoundException('User not found');

        return user;
    }

    async getUserByEmail(email: string): Promise<User> {
        const user = await this.usersRepository.findOne({ email: email });

        if (!user) throw new NotFoundException('User not found');

        return user;
    }

    async getUsers(): Promise<User[]> {
        return await this.usersRepository.find({});
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        return await this.usersRepository.create({
            createUserDto,
        });
    }

    async updateUser(userId: string, userUpdates: UpdateUserDto): Promise<User> {
        return await this.usersRepository.findOneAndUpdate({ userId }, userUpdates);
    }
}