import { IsNotEmpty } from 'class-validator';

export class UpdateUserProfileDto {
  @IsNotEmpty()
  public firstName: string;

  @IsNotEmpty()
  public lastName: string;

  @IsNotEmpty()
  public email: string;

  @IsNotEmpty()
  public phoneNumber: string;

  public password: string;
}
