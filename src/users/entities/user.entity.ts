import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Password } from './password.entity';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  firstName: string;

  @Column('varchar')
  lastName: string;

  @Column('varchar')
  phoneNumber: string;

  @Column('varchar')
  email: string;

  @Column('boolean', { default: false })
  verified: boolean;

  @Column('boolean', { default: false })
  suspended: boolean;

  @Column('boolean', { default: false })
  isAdmin: boolean;

  @OneToMany((type) => Product, (product) => product.owner)
  products: Product[];

  @OneToMany((type) => Password, (password) => password.user)
  passwords: Password[];

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedA: string;
}
