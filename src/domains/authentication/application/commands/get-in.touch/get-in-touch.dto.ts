export class GetInTouchDTO {
  constructor(
    public fullName: string,
    public businessEmail: string,
    public businessPhone: string,
    public company: string,
    public websiteUrl: string,
    public country: string,
    public annualRevenue: string,
    public isAgency: string,
  ) {}
}
