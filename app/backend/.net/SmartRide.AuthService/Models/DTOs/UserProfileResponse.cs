namespace SmartRide.AuthService.Models.DTOs;

public class UserProfileResponse
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public DateTime? Dob { get; set; }
    public string? Gender { get; set; }
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ProfileImage { get; set; }
    public string? LicenseNo { get; set; }
    public string? LicensePdfUrl { get; set; }
}
