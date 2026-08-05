namespace SmartRide.AuthService.Services;

public interface IOtpService
{
    Task SendOtpAsync(string phone);
    bool VerifyOtp(string phone, string inputOtp);
}
