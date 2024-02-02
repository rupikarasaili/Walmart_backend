import { IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  public email: string;

  @IsNotEmpty()
  public password: string;
}
