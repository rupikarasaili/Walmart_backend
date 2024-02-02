import { IsNotEmpty } from 'class-validator';

export class CardDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  date: string;

  @IsNotEmpty()
  cvv: string;

  @IsNotEmpty()
  number: string;
}

export class CartProduct {
  @IsNotEmpty()
  productId: string;

  @IsNotEmpty()
  quantity: string;
}

export class AddToCartDto {
  card: CardDto;
  products: CartProduct[];
}
