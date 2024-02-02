import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditsModule } from '../audits/audits.module';
import { Cart } from './entities/cart.entity';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Product, Cart]), AuditsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
