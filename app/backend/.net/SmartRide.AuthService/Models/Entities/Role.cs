using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartRide.AuthService.Models.Entities;

[Table("roles")]
public class Role
{
    [Key]
    [Column("role_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int RoleId { get; set; }

    [Required]
    [Column("role_value")]
    [StringLength(50)]
    public string RoleValue { get; set; } = string.Empty;

    public Role() { }

    public Role(string roleValue)
    {
        RoleValue = roleValue;
    }

    public Role(int roleId, string roleValue)
    {
        RoleId = roleId;
        RoleValue = roleValue;
    }
}
