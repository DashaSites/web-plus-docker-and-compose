import { IsBoolean, IsNumber } from 'class-validator';

export class CreateOfferDto {
  @IsBoolean()
  hidden: boolean;

  @IsNumber()
  amount: number;

  @IsNumber()
  itemId: number;
}
