using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartRide.RideService.Models.Entities;

[Table("driver_ride")]
public class DriverRide
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("driver_ride_id")]
    public int DriverRideId { get; set; }

    [Column("ride_id")]
    public int RideId { get; set; }

    [Column("driver_id")]
    public int DriverId { get; set; }

    public DriverRide() { }

    public DriverRide(int rideId, int driverId)
    {
        RideId = rideId;
        DriverId = driverId;
    }
}
