using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartRide.RideService.Models.Entities;

[Table("ride")]
public class Ride
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("ride_id")]
    public int RideId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("vehicle_id")]
    public int VehicleId { get; set; }

    [Column("source")]
    public string Source { get; set; } = string.Empty;

    [Column("destination")]
    public string Destination { get; set; } = string.Empty;

    [Column("status")]
    public int Status { get; set; } // 0 = Requested, 1 = Completed, 2 = InProgress, 3 = Accepted

    [Column("fare")]
    public decimal? Fare { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    public Ride() { }

    public Ride(int userId, int vehicleId, string source, string destination, int status, decimal? fare = null)
    {
        UserId = userId;
        VehicleId = vehicleId;
        Source = source;
        Destination = destination;
        Status = status;
        Fare = fare;
    }
}
