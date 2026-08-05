using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartRide.AuthService.Models.Entities;

[Table("users")]
public class User
{
    [Key]
    [Column("user_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int UserId { get; set; }

    [Column("role_id")]
    public int RoleId { get; set; }

    [ForeignKey(nameof(RoleId))]
    public Role? Role { get; set; }

    [Required]
    [Column("username")]
    [StringLength(100)]
    public string Username { get; set; } = string.Empty;

    [Column("email")]
    [StringLength(150)]
    public string? Email { get; set; }

    [Required]
    [Column("password")]
    [StringLength(255)]
    public string Password { get; set; } = string.Empty;

    [Column("phone")]
    [StringLength(20)]
    public string? Phone { get; set; }

    [Column("dob")]
    public DateTime? Dob { get; set; }

    [Column("profile_image", TypeName = "LONGTEXT")]
    public string? ProfileImage { get; set; }

    [Column("gender")]
    [StringLength(20)]
    public string? Gender { get; set; }

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = "active";

    [Column("created_at")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
