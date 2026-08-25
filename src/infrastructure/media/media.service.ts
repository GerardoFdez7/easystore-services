import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImageKit from 'imagekit';
import { JwtPayload } from '@common/decorators';

@Injectable()
export default class MediaService {
  private imagekit: ImageKit;

  constructor(configService: ConfigService) {
    this.imagekit = new ImageKit({
      publicKey: configService.getOrThrow<string>('IMAGEKIT_PUBLIC_KEY'),
      privateKey: configService.getOrThrow<string>('IMAGEKIT_PRIVATE_KEY'),
      urlEndpoint: configService.getOrThrow<string>('IMAGEKIT_URL_ENDPOINT'),
    });
  }

  /**
   * Generates secure ImageKit upload token for authenticated users
   * This is a secure wrapper around ImageKit's getAuthenticationParameters
   * @param user - The authenticated user from JWT token
   * @returns ImageKit authentication parameters (token, expire, signature, publicKey)
   */
  generateSecureUploadToken(user: JwtPayload): {
    token: string;
    expire: number;
    signature: string;
    publicKey: string;
  } {
    if (!user) {
      throw new UnauthorizedException(
        'Valid authentication required for media upload',
      );
    }

    // Generate ImageKit authentication parameters
    // Client will use these to authenticate uploads directly to ImageKit
    const authParams = this.imagekit.getAuthenticationParameters();

    return {
      ...authParams,
      publicKey: this.imagekit.options.publicKey,
    };
  }
}
