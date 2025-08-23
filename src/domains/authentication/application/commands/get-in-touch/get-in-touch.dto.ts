export class GetInTouchDTO {
  public readonly fullName: string;
  public readonly businessEmail: string;
  public readonly businessPhone: string;
  public readonly company: string;
  public readonly country: string;
  public readonly annualRevenue: string;
  public readonly isAgency: string;
  public readonly websiteUrl?: string;

  constructor(input: GetInTouchDTO) {
    this.fullName = input.fullName;
    this.businessEmail = input.businessEmail;
    this.businessPhone = input.businessPhone;
    this.company = input.company;
    this.country = input.country;
    this.annualRevenue = input.annualRevenue;
    this.isAgency = input.isAgency;
    this.websiteUrl = input.websiteUrl;
  }
}
