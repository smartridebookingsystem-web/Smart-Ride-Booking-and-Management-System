using Microsoft.EntityFrameworkCore;
using SmartRide.RideService.Models.Entities;

namespace SmartRide.RideService.Data;

public class RideDbContext : DbContext
{
    public RideDbContext(DbContextOptions<RideDbContext> options) : base(options) { }

    public DbSet<Ride> Rides { get; set; } = null!;
    public DbSet<DriverRide> DriverRides { get; set; } = null!;
    public DbSet<OtpVerification> OtpVerifications { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Ride>(entity =>
        {
            entity.ToTable("ride");
            entity.HasKey(e => e.RideId);
        });

        modelBuilder.Entity<DriverRide>(entity =>
        {
            entity.ToTable("driver_ride");
            entity.HasKey(e => e.DriverRideId);
        });

        modelBuilder.Entity<OtpVerification>(entity =>
        {
            entity.ToTable("otp_verification");
            entity.HasKey(e => e.Id);
        });
    }
}
