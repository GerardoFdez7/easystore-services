import { GetInTouchDTO } from '../get-in-touch.dto';
import { GetInTouchHandler } from '../get-in-touch.handler';

jest.mock('@authentication/infrastructure/emails', () => ({
  AuthEmailService: class AuthEmailService {},
}));

describe('GetInTouchHandler', () => {
  const emailService = { sendGetInTouchEmail: jest.fn() };
  const command = new GetInTouchDTO({
    fullName: 'Ada Lovelace',
    businessEmail: 'ada@example.com',
    businessPhone: '+50255555555',
    company: 'Analytical Engines',
    country: 'Guatemala',
    annualRevenue: '1M-5M',
    isAgency: 'no',
    websiteUrl: 'https://example.com',
  });
  let handler: GetInTouchHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new GetInTouchHandler(emailService as never);
  });

  it('sends the complete enquiry and returns the public success response', async () => {
    await expect(handler.execute(command)).resolves.toEqual({
      success: true,
      message: 'Thank you for contacting us. We will get back to you soon!',
    });
    expect(emailService.sendGetInTouchEmail).toHaveBeenCalledWith(command);
    expect(emailService.sendGetInTouchEmail).toHaveBeenCalledTimes(1);
  });

  it('supports an enquiry without the optional website', async () => {
    const withoutWebsite = new GetInTouchDTO({
      ...command,
      websiteUrl: undefined,
    });

    await handler.execute(withoutWebsite);

    expect(emailService.sendGetInTouchEmail).toHaveBeenCalledWith(
      withoutWebsite,
    );
  });

  it('propagates delivery failures instead of reporting a false success', async () => {
    const error = new Error('mail provider unavailable');
    emailService.sendGetInTouchEmail.mockRejectedValueOnce(error);

    await expect(handler.execute(command)).rejects.toBe(error);
  });
});
