namespace SmartRide.AuthService.Models.DTOs;

public class RegisterRequest
{
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? Password { get; set; }
    public string? Phone { get; set; }
    public DateTime? Dob { get; set; }
    public string? Gender { get; set; }
    public string? Role { get; set; }
    public string? ProfileImage { get; set; }
    public string? LicenseNo { get; set; }
    public string? LicensePdfUrl { get; set; }
}
