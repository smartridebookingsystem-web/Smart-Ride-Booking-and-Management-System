using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartRide.RideService.Models.Entities;

[Table("otp_verification")]
public class OtpVerification
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("ride_id")]
    public int? RideId { get; set; }

    [Column("phone_number")]
    public string? PhoneNumber { get; set; }

    [Column("otp_code")]
    public string OtpCode { get; set; } = string.Empty;

    [Column("status")]
    public string Status { get; set; } = "PENDING";

    [Column("expires_at")]
    public DateTime? ExpiresAt { get; set; }

    public OtpVerification() { }

    public OtpVerification(int? rideId, string? phoneNumber, string otpCode, string status, DateTime? expiresAt)
    {
        RideId = rideId;
        PhoneNumber = phoneNumber;
        OtpCode = otpCode;
        Status = status;
        ExpiresAt = expiresAt;
    }
}
