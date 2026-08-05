using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartRide.AuthService.Models.Entities;

[Table("driver")]
public class Driver
{
    [Key]
    [Column("driver_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int DriverId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    [Required]
    [Column("license_no")]
    [StringLength(50)]
    public string LicenseNo { get; set; } = string.Empty;

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = "unverified";

    [Column("license_pdf_url", TypeName = "LONGTEXT")]
    public string? LicensePdfUrl { get; set; }

    public Driver() { }

    public Driver(User user, string licenseNo, string status)
    {
        User = user;
        UserId = user.UserId;
        LicenseNo = licenseNo;
        Status = status;
    }

    public Driver(User user, string licenseNo, string status, string? licensePdfUrl)
    {
        User = user;
        UserId = user.UserId;
        LicenseNo = licenseNo;
        Status = status;
        LicensePdfUrl = licensePdfUrl;
    }
}
