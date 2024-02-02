import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { USER_TYPE } from '../enums/user.enum';

export class CreateUserDto {
  @IsNotEmpty()
  public firstName: string;

  @IsNotEmpty()
  public lastName: string;

  @IsEmail()
  public email: string;

  @IsNotEmpty()
  public phoneNumber: string;

  @IsNotEmpty()
  public password: string;

  @IsOptional()
  @IsEnum(USER_TYPE)
  public type: USER_TYPE;
}
