import {
  Field,
  ObjectType,
  InputType,
  Int,
  ID,
  registerEnumType,
} from '@nestjs/graphql';
import { MediaTypeEnum } from '../../../aggregates/value-objects';

// Query types for media
registerEnumType(MediaTypeEnum, {
  name: 'MediaTypeEnum',
});

@ObjectType('Media')
export class MediaType {
  @Field()
  url: string;

  @Field(() => Int)
  position: number;

  @Field(() => MediaTypeEnum)
  mediaType: MediaTypeEnum;

  @Field(() => ID, { nullable: true })
  productId?: string;

  @Field(() => ID, { nullable: true })
  variantId?: string;
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
