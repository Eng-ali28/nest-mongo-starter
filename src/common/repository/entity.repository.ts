import { BadRequestException } from '@nestjs/common';
import mongoose, { Document, FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';
import { MagicQueryDto, PaginateDto } from '../dto';

export abstract class EntityRepository<T extends Document> {
    constructor(protected readonly entityModel: Model<T>) {}

    async findOne(entityFilterQuery: FilterQuery<T>, option: QueryOptions<T> = {}): Promise<T | null> {
        return this.entityModel.findOne(entityFilterQuery, {}, option).exec();
    }

    async find(entityFilterQuery: FilterQuery<T>, option: QueryOptions<T> = {}): Promise<T[]> {
        return this.entityModel.find(entityFilterQuery, {}, option);
    }

    async findWithPagination({
        filterQuery,
        option,
        paginateDto,
    }: {
        filterQuery?: FilterQuery<T>;
        option?: QueryOptions<T>;
        paginateDto?: PaginateDto;
    }): Promise<{ data: T[]; count: number }> {
        let query = this.entityModel.find(filterQuery, {}, option);

        if (paginateDto.pageSize || paginateDto.pageNumber) {
            const { pageNumber = 1, pageSize = 10 } = paginateDto;

            const limit = pageSize;
            const skip = (pageNumber - 1) * limit;

            query = query.limit(limit).skip(skip);
        }

        const result = await query.exec();
        const count = await this.entityModel.countDocuments(filterQuery);

        return { data: result, count };
    }

    async create(createEntityData: unknown): Promise<T> {
        try {
            const entity = new this.entityModel(createEntityData);

            return (await entity.save()) as T;
        } catch (error) {
            if (error instanceof mongoose.mongo.MongoError) {
                if (error.code === 11000) {
                    throw new BadRequestException('Duplicate key error. Document already exists!');
                } else {
                    throw new BadRequestException('An error occurred:', error);
                }
            }
        }
    }

    async findOneAndUpdate(
        entityFilterQuery: FilterQuery<T>,
        updateEntityData: UpdateQuery<unknown>,
        options?: QueryOptions<T>,
    ): Promise<T | null> {
        return this.entityModel.findOneAndUpdate(entityFilterQuery, updateEntityData, { ...options, new: true });
    }

    async deleteMany(entityFilterQuery: FilterQuery<T>): Promise<boolean> {
        const deleteResult = await this.entityModel.deleteMany(entityFilterQuery);
        return deleteResult.deletedCount >= 1;
    }
}
