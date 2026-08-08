using Microsoft.EntityFrameworkCore;
using SmartRide.RideService.Data;
using SmartRide.RideService.Models.DTOs;
using SmartRide.RideService.Models.Entities;

namespace SmartRide.RideService.Services;

public class RideService : IRideService
{
    private readonly RideDbContext _context;

    public RideService(RideDbContext context)
    {
        _context = context;
    }

    public async Task<List<RideDto>> GetAllRidesAsync()
    {
        var rides = await _context.Rides.ToListAsync();
        var dtos = new List<RideDto>();
        foreach (var ride in rides)
        {
            dtos.Add(await ConvertToDtoAsync(ride));
        }
        return dtos;
    }

    public async Task<RideDto> GetRideByIdAsync(int rideId)
    {
        var ride = await _context.Rides.FindAsync(rideId)
            ?? throw new KeyNotFoundException($"Ride not found with ID: {rideId}");
        return await ConvertToDtoAsync(ride);
    }

    public async Task<List<RideDto>> GetRidesByUserIdAsync(int userId)
    {
        var rides = await _context.Rides.Where(r => r.UserId == userId).ToListAsync();
        var dtos = new List<RideDto>();
        foreach (var ride in rides)
        {
            dtos.Add(await ConvertToDtoAsync(ride));
        }
        return dtos;
    }

    public async Task<List<RideDto>> GetRidesByDriverIdAsync(int driverId)
    {
        var driverRides = await _context.DriverRides.Where(dr => dr.DriverId == driverId).ToListAsync();
        var rideIds = driverRides.Select(dr => dr.RideId).ToList();

        var rides = await _context.Rides.Where(r => rideIds.Contains(r.RideId)).ToListAsync();
        var dtos = new List<RideDto>();
        foreach (var ride in rides)
        {
            dtos.Add(await ConvertToDtoAsync(ride));
        }
        return dtos;
    }

    public static decimal CalculateFare(string? source, string? destination, int? vehicleId)
    {
        if (string.IsNullOrWhiteSpace(source) || string.IsNullOrWhiteSpace(destination)) return 150.00m;
        string combined = (source + destination).ToLowerInvariant().Trim();
        int hash = 0;
        for (int i = 0; i < combined.Length; i++)
        {
            hash = (hash << 5) - hash + combined[i];
        }
        double distKm = 2.2 + (Math.Abs(hash) % 143) / 10.0;
        decimal baseFare = 50.00m;
        decimal perKm = 12.00m;
        if (vehicleId.HasValue)
        {
            if (vehicleId == 3 || vehicleId == 6)
            {
                baseFare = 120.00m;
                perKm = 22.00m;
            }
            else if (vehicleId == 2 || vehicleId == 5)
            {
                baseFare = 80.00m;
                perKm = 16.00m;
            }
        }
        return Math.Round(baseFare + (decimal)distKm * perKm);
    }

    public async Task<RideDto> CreateRideAsync(CreateRideRequest request)
    {
        if (request == null) throw new ArgumentNullException(nameof(request));
        if (request.UserId == null) throw new ArgumentException("User ID is required.");
        if (request.VehicleId == null) throw new ArgumentException("Vehicle ID is required.");
        if (string.IsNullOrWhiteSpace(request.Source)) throw new ArgumentException("Source location is required.");
        if (string.IsNullOrWhiteSpace(request.Destination)) throw new ArgumentException("Destination location is required.");

        int targetVehicleId = request.VehicleId.Value > 0 ? request.VehicleId.Value : 1;
        decimal rideFare = request.Fare.HasValue && request.Fare.Value > 0
            ? request.Fare.Value
            : CalculateFare(request.Source, request.Destination, targetVehicleId);

        var ride = new Ride(
            request.UserId.Value,
            targetVehicleId,
            request.Source.Trim(),
            request.Destination.Trim(),
            0,
            rideFare
        );

        _context.Rides.Add(ride);
        await _context.SaveChangesAsync();

        string generatedOtp = string.Format("{0:D4}", (1000 + (ride.RideId * 73) % 9000));
        try
        {
            var otpRecord = new OtpVerification(
                ride.RideId,
                null,
                generatedOtp,
                "PENDING",
                DateTime.UtcNow.AddMinutes(30)
            );
            _context.OtpVerifications.Add(otpRecord);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[RideService] OTP record save notice: {ex.Message}");
        }

        return await ConvertToDtoAsync(ride);
    }

    public async Task<RideDto> UpdateRideStatusAsync(int rideId, int status)
    {
        var ride = await _context.Rides.FindAsync(rideId)
            ?? throw new KeyNotFoundException($"Ride not found with ID: {rideId}");

        ride.Status = status;
        await _context.SaveChangesAsync();
        return await ConvertToDtoAsync(ride);
    }

    public async Task<RideDto> AcceptRideAsync(int rideId, int driverId)
    {
        var ride = await _context.Rides.FindAsync(rideId)
            ?? throw new KeyNotFoundException($"Ride not found with ID: {rideId}");

        if (ride.Status != 0)
        {
            throw new InvalidOperationException($"Ride #{rideId} is no longer available. Current status: {ride.Status}");
        }

        ride.Status = 3; // 3 = Accepted
        await _context.SaveChangesAsync();

        var existingAssignment = await _context.DriverRides.FirstOrDefaultAsync(dr => dr.RideId == rideId);
        if (existingAssignment != null)
        {
            existingAssignment.DriverId = driverId;
        }
        else
        {
            _context.DriverRides.Add(new DriverRide(rideId, driverId));
        }
        await _context.SaveChangesAsync();

        return await ConvertToDtoAsync(ride);
    }

    public async Task<RideDto> StartTripAsync(int rideId)
    {
        var ride = await _context.Rides.FindAsync(rideId)
            ?? throw new KeyNotFoundException($"Ride not found with ID: {rideId}");

        ride.Status = 2; // 2 = InProgress
        await _context.SaveChangesAsync();
        return await ConvertToDtoAsync(ride);
    }

    public async Task<RideDto> CompleteTripAsync(int rideId)
    {
        var ride = await _context.Rides.FindAsync(rideId)
            ?? throw new KeyNotFoundException($"Ride not found with ID: {rideId}");

        ride.Status = 1; // 1 = Completed
        await _context.SaveChangesAsync();
        return await ConvertToDtoAsync(ride);
    }

    public async Task<RideDto> ConfirmPaymentAsync(int rideId, ConfirmPaymentRequest request)
    {
        var ride = await _context.Rides.FindAsync(rideId)
            ?? throw new KeyNotFoundException($"Ride not found with ID: {rideId}");

        ride.Status = 1; // 1 = Completed / Paid
        await _context.SaveChangesAsync();
        return await ConvertToDtoAsync(ride);
    }

    public async Task<string> GetRideOtpFromDbAsync(int rideId)
    {
        var record = await _context.OtpVerifications
            .Where(o => o.RideId == rideId)
            .OrderByDescending(o => o.Id)
            .FirstOrDefaultAsync();

        if (record != null)
        {
            return record.OtpCode;
        }

        string fallbackCode = string.Format("{0:D4}", (1000 + (rideId * 73) % 9000));
        try
        {
            _context.OtpVerifications.Add(new OtpVerification(rideId, null, fallbackCode, "PENDING", DateTime.UtcNow.AddMinutes(30)));
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[RideService] OTP record save notice: {ex.Message}");
        }

        return fallbackCode;
    }

    private async Task<RideDto> ConvertToDtoAsync(Ride ride)
    {
        var driverRide = await _context.DriverRides.FirstOrDefaultAsync(dr => dr.RideId == ride.RideId);
        int? driverId = driverRide?.DriverId;
        string? createdAtStr = ride.CreatedAt?.ToString("o");
        decimal fareVal = ride.Fare.HasValue && ride.Fare.Value > 0
            ? ride.Fare.Value
            : CalculateFare(ride.Source, ride.Destination, ride.VehicleId);

        return new RideDto(
            ride.RideId,
            ride.UserId,
            ride.VehicleId,
            ride.Source,
            ride.Destination,
            ride.Status,
            driverId,
            createdAtStr,
            fareVal
        );
    }
}
