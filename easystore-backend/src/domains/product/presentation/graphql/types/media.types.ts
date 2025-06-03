import {
  Field,
  ObjectType,
  InputType,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import { MediaTypeEnum } from '../../../aggregates/value-objects';

// Query types for media
registerEnumType(MediaTypeEnum, {
  name: 'MediaTypeEnum',
});

@ObjectType('Media')
export class MediaType {
  @Field(() => Int)
  id: number;

  @Field()
  url: string;

  @Field(() => Int)
  position: number;

  @Field(() => MediaTypeEnum)
  mediaType: MediaTypeEnum;

  @Field(() => Int, { nullable: true })
  productId?: number;

  @Field(() => Int, { nullable: true })
  variantId?: number;
}

// Input types for creating media
@InputType()
export class CreateMediaInput {
  @Field()
  url: string;

  @Field(() => Int)
  position: number;

  @Field(() => MediaTypeEnum)
  mediaType: MediaTypeEnum;
}

// Input types for updating media
@InputType()
export class UpdateMediaInput {
  @Field({ nullable: true })
  url?: string;

  @Field(() => Int, { nullable: true })
  position?: number;

  @Field(() => MediaTypeEnum, { nullable: true })
  mediaType?: MediaTypeEnum;
}
