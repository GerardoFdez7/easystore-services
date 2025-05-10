import { z } from 'zod';

const attributeSchema = z.object({
  key: z.string().min(1, { message: 'Key must be at least 1 character' }),
  value: z.string().min(1, { message: 'Value must be at least 1 character' }),
});

export type AttributeProps = {
  key: string;
  value: string;
};

export class Attribute {
  private readonly props: AttributeProps;

  private constructor(props: AttributeProps) {
    this.props = props;
  }

  public static create(key: string, value: string): Attribute {
    const atributeData = { key, value };
    attributeSchema.parse(atributeData);
    return new Attribute(atributeData);
  }

  public getKey(): string {
    return this.props.key;
  }

  public getValue(): string {
    return this.props.value;
  }

  public equals(atribute: Attribute): boolean {
    return (
      this.props.key === atribute.props.key &&
      this.props.value === atribute.props.value
    );
  }
}
