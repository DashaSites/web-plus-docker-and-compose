import { IsArray, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  name: string;

  @IsOptional()
  description?: string;

  @IsUrl()
  image: string;

  @IsArray()
  itemsId: number[];
}
