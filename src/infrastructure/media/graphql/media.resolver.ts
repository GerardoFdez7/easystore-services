import { Query, Resolver } from '@nestjs/graphql';
import MediaService from '../media.service';
import { MediaAuthResponse } from './types/media.dto';
import {
  CurrentUser,
  JwtPayload,
  RequirePermission,
} from '@shared/presentation/decorators';
import {
  FeatureEnum,
  PermissionActionEnum,
} from '@shared/aggregates/value-objects';

@Resolver()
export default class MediaResolver {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Generates secure authentication token for media upload
   * Requires valid JWT authentication
   * @param user - Current authenticated user from JWT token
   * @returns Secure ImageKit authentication parameters
   */
  @RequirePermission(FeatureEnum.CATALOG, PermissionActionEnum.CREATE)
  @Query(() => MediaAuthResponse)
  getMediaUploadToken(@CurrentUser() user: JwtPayload): MediaAuthResponse {
    return this.mediaService.generateSecureUploadToken(user);
  }
}
