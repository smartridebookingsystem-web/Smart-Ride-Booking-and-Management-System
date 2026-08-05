using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartRide.AuthService.Models.Entities;

[Table("complaint")]
public class Complaint
{
    [Key]
    [Column("complaint_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ComplaintId { get; set; }

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [Column("ride_id")]
    public int? RideId { get; set; }

    [Required]
    [Column("subject")]
    [StringLength(150)]
    public string Subject { get; set; } = string.Empty;

    [Required]
    [Column("description", TypeName = "TEXT")]
    public string Description { get; set; } = string.Empty;

    [Column("category")]
    [StringLength(50)]
    public string Category { get; set; } = "General";

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = "Open";

    [Column("resolution_notes", TypeName = "TEXT")]
    public string? ResolutionNotes { get; set; }

    [Column("created_at")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Complaint() { }

    public Complaint(int userId, int? rideId, string subject, string description, string category)
    {
        UserId = userId;
        RideId = rideId;
        Subject = subject;
        Description = description;
        Category = category;
        Status = "Open";
    }
}
