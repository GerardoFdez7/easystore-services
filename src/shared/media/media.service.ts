import { Injectable, UnauthorizedException } from '@nestjs/common';
import ImageKit from 'imagekit';
import { JwtPayload } from '@common/decorators';

@Injectable()
export default class MediaService {
  private imagekit: ImageKit;

  constructor() {
    this.imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }

  /**
   * Generates secure ImageKit upload token for authenticated users
   * This is a secure wrapper around ImageKit's getAuthenticationParameters
   * @param user - The authenticated user from JWT token
   * @returns ImageKit authentication parameters (token, expire, signature)
   */
  generateSecureUploadToken(user: JwtPayload): {
    token: string;
    expire: number;
    signature: string;
  } {
    if (!user) {
      throw new UnauthorizedException(
        'Valid authentication required for media upload',
      );
    }

    // Generate ImageKit authentication parameters
    // Client will use these to authenticate uploads directly to ImageKit
    return this.imagekit.getAuthenticationParameters();
  }
}
