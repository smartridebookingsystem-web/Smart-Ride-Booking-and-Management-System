using SmartRide.RideService.Models.DTOs;

namespace SmartRide.RideService.Services;

public interface IRideService
{
    Task<List<RideDto>> GetAllRidesAsync();
    Task<RideDto> GetRideByIdAsync(int rideId);
    Task<List<RideDto>> GetRidesByUserIdAsync(int userId);
    Task<List<RideDto>> GetRidesByDriverIdAsync(int driverId);
    Task<RideDto> CreateRideAsync(CreateRideRequest request);
    Task<RideDto> UpdateRideStatusAsync(int rideId, int status);
    Task<RideDto> AcceptRideAsync(int rideId, int driverId);
    Task<RideDto> StartTripAsync(int rideId);
    Task<RideDto> CompleteTripAsync(int rideId);
    Task<RideDto> ConfirmPaymentAsync(int rideId, ConfirmPaymentRequest request);
    Task<string> GetRideOtpFromDbAsync(int rideId);
}
