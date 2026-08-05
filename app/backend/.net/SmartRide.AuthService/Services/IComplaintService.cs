using SmartRide.AuthService.Models.Entities;

namespace SmartRide.AuthService.Services;

public interface IComplaintService
{
    Task<List<Complaint>> GetAllComplaintsAsync();
    Task<Complaint?> GetComplaintByIdAsync(int id);
    Task<List<Complaint>> GetComplaintsByUserIdAsync(int userId);
    Task<Complaint> CreateComplaintAsync(Complaint complaint);
    Task<Complaint> UpdateComplaintStatusAsync(int id, string? status, string? resolutionNotes);
    Task DeleteComplaintAsync(int id);
}
