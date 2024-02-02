import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'password' })
export class Password {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  password: string;

  @CreateDateColumn()
  createdAt: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @ManyToOne((type) => User, (user) => user.passwords)
  user: User;
}
