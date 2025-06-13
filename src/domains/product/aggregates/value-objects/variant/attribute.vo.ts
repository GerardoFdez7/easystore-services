import { z } from 'zod';
import { Id } from '../';

const attributeSchema = z.object({
  key: z.string().min(1, { message: 'Key must be at least 1 character' }),
  value: z.string().min(1, { message: 'Value must be at least 1 character' }),
});

export type AttributeProps = {
  id?: string;
  key: string;
  value: string;
};

export class Attribute {
  private readonly props: AttributeProps;

  private constructor(props: AttributeProps) {
    this.props = props;
  }

  public static create(key: string, value: string, id?: string): Attribute {
    const attributeId = id ? Id.create(id) : Id.generate();
    const atributeData = { id: attributeId.getValue(), key, value };
    attributeSchema.parse(atributeData);
    return new Attribute(atributeData);
  }

  public getKey(): string {
    return this.props.key;
  }

  public getValue(): string {
    return this.props.value;
  }

  public getAttribute(): AttributeProps {
    return {
      id: this.props.id,
      key: this.props.key,
      value: this.props.value,
    };
  }

  public equals(atribute: Attribute): boolean {
    return (
      this.props.key === atribute.props.key &&
      this.props.value === atribute.props.value
    );
  }
}
