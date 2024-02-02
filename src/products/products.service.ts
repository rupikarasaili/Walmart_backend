import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';

import * as crypto from 'crypto';
import { scrypt } from 'crypto';
import { promisify } from 'util';
import { AuditsService } from '../audits/audits.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { Cart } from './entities/cart.entity';
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    private readonly configurationService: ConfigurationService,
    private readonly auditsService: AuditsService,
  ) {}

  async createProduct(user: User, createProductDto: CreateProductDto) {
    const category = await this.categoryRepository.findOne({
      where: {
        id: createProductDto.category,
      },
    });

    const product = await this.productRepository.save({
      category: category,
      name: createProductDto.name,
      description: createProductDto.description,
      imageUrl: createProductDto.imageUrl,
      price: createProductDto.price,
      inStock: createProductDto.inStock,
      owner: {
        id: user.id,
      },
    } as any);

    await this.auditsService.create(
      'PRODUCT',
      `Product created by ${user.email} with id: ${product.id}`,
    );

    return product;
  }

  async findAllProduct() {
    return this.productRepository.find({
      relations: ['category'],
    });
  }

  async findOneProduct(id: string) {
    return await this.productRepository.findOne({
      where: {
        id,
      },
      relations: ['category'],
    });
  }

  async updateProduct(
    user: User,
    id: string,
    updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productRepository.findOne({
      where: {
        id,
      },
      relations: ['category'],
    });

    if (!product) {
      throw new BadRequestException('No such product');
    }

    if (updateProductDto.category) {
      const category = await this.categoryRepository.findOne({
        where: {
          id: updateProductDto.category,
        },
      });

      // updating category
      if (product.category.id !== updateProductDto.category) {
        await this.productRepository.update(
          { id: id },
          {
            category: {
              id: updateProductDto.category,
            },
          },
        );
      }
    }

    const { category, ..._updateProductDto } = updateProductDto;

    await this.productRepository.update(
      {
        id: id,
      },
      {
        ..._updateProductDto,
      },
    );

    await this.auditsService.create(
      'PRODUCT',
      `Product updated by ${user.email} with id: ${product.id}`,
    );

    return await this.productRepository.findOne({
      where: {
        id,
      },
      relations: ['category'],
    });
  }

  async removeProduct(user: User, id: string) {
    const product = await this.productRepository.findOne({
      where: {
        id: id,
        owner: {
          id: user.id,
        },
      },
    });

    if (!product) {
      throw new NotFoundException();
    }

    await this.productRepository.delete({
      id: id,
    });

    await this.auditsService.create(
      'PRODUCT',
      `Product deleted by ${user.email} with id: ${product.id}`,
    );

    return { deleted: true };
  }

  async createCategory(user: User, createCategoryDto: CreateCategoryDto) {
    const category = await this.categoryRepository.save({
      name: createCategoryDto.name,
    });

    await this.auditsService.create(
      'CATEGORY',
      `Category created by ${user.email} with id: ${category.id}`,
    );

    return category;
  }

  async editCategory(
    user: User,
    id: string,
    editCategoryDto: CreateCategoryDto,
  ) {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
      },
    });

    if (!category) {
      throw new BadRequestException('No such category');
    }

    await this.categoryRepository.update(
      { id },
      {
        name: editCategoryDto.name,
      },
    );

    await this.auditsService.create(
      'CATEGORY',
      `Category updated by ${user.email} with id: ${id}`,
    );

    return await this.categoryRepository.findOne({
      where: {
        id,
      },
    });
  }

  async deleteCategory(user: User, id: string) {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
      },
    });

    if (!category) {
      throw new BadRequestException('No such category');
    }

    await this.productRepository.delete({
      category: {
        id,
      },
    });

    await this.categoryRepository.delete({
      id,
    });

    await this.auditsService.create(
      'CATEGORY',
      `Category deleted by ${user.email} with id: ${id}`,
    );

    return await this.categoryRepository.findOne({
      where: {
        id,
      },
    });
  }

  async buy(user: User, cart: AddToCartDto) {
    const { card, products } = cart;

    const encryptedCard = (await this.encrypt(JSON.stringify(card))).toString();

    return await this.cartRepository.save({
      card: encryptedCard,
      products: products,
    });
  }

  async findAllCategories() {
    return await this.categoryRepository.find({});
  }

  async encrypt(text) {
    const password = this.configurationService.encryptedKey;
    var algorithm = 'aes256';

    const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
    var cipher = crypto.createCipher(algorithm, key);
    var encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
   
    return encrypted;
  }

  async decrypt(encryptedText) {
    const password = this.configurationService.encryptedKey;

    var algorithm = 'aes256';
    const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
    var decipher = crypto.createDecipher(algorithm, key);

    var decrypted =
      decipher.update(encryptedText, 'hex', 'utf8') + decipher.final('utf8');

    return decrypted;
  }
}
