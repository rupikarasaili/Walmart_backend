import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'payment_methods' })
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  name: string;

  @Column('varchar')
  number: string;

  @Column('varchar')
  expiresAt: string;

  @Column('integer')
  cvv: number;

  @CreateDateColumn()
  createdAt: Date;
}
