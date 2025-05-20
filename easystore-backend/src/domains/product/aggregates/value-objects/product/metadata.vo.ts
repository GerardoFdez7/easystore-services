import { z } from 'zod';

const metadataSchema = z.object({
  deleted: z.boolean().default(false),
  deletedAt: z.date().nullable(),
  scheduledForHardDeleteAt: z.date().nullable(),
});

export type MetadataProps = {
  deleted: boolean;
  deletedAt?: Date | null;
  scheduledForHardDeleteAt?: Date | null;
};

export class Metadata {
  private readonly deleted: boolean;
  private readonly deletedAt: Date | null;
  private readonly scheduledForHardDeleteAt: Date | null;

  private constructor(props: MetadataProps) {
    this.deleted = props.deleted;
    this.deletedAt = props.deletedAt || null;
    this.scheduledForHardDeleteAt = props.scheduledForHardDeleteAt || null;
  }

  public static create(props: MetadataProps): Metadata {
    metadataSchema.parse(props);
    return new Metadata(props);
  }

  public getDeleted(): boolean {
    return this.deleted;
  }

  public getDeletedAt(): Date | null {
    return this.deletedAt;
  }

  public getScheduledForHardDeleteAt(): Date | null {
    return this.scheduledForHardDeleteAt;
  }

  public getValue(): MetadataProps {
    return {
      deleted: this.deleted,
      deletedAt: this.deletedAt,
      scheduledForHardDeleteAt: this.scheduledForHardDeleteAt,
    };
  }

  public equals(metadata: Metadata): boolean {
    return (
      this.deleted === metadata.deleted &&
      this.deletedAt === metadata.deletedAt &&
      this.scheduledForHardDeleteAt === metadata.scheduledForHardDeleteAt
    );
  }
}
