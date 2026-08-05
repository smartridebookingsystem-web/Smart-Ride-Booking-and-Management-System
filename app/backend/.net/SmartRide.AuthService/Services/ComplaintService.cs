using Microsoft.EntityFrameworkCore;
using SmartRide.AuthService.Data;
using SmartRide.AuthService.Models.Entities;

namespace SmartRide.AuthService.Services;

public class ComplaintService : IComplaintService
{
    private readonly AuthDbContext _context;

    public ComplaintService(AuthDbContext context)
    {
        _context = context;
    }

    public async Task<List<Complaint>> GetAllComplaintsAsync()
    {
        return await _context.Complaints.ToListAsync();
    }

    public async Task<Complaint?> GetComplaintByIdAsync(int id)
    {
        return await _context.Complaints.FirstOrDefaultAsync(c => c.ComplaintId == id);
    }

    public async Task<List<Complaint>> GetComplaintsByUserIdAsync(int userId)
    {
        return await _context.Complaints.Where(c => c.UserId == userId).ToListAsync();
    }

    public async Task<Complaint> CreateComplaintAsync(Complaint complaint)
    {
        if (string.IsNullOrWhiteSpace(complaint.Status))
        {
            complaint.Status = "Open";
        }
        _context.Complaints.Add(complaint);
        await _context.SaveChangesAsync();
        return complaint;
    }

    public async Task<Complaint> UpdateComplaintStatusAsync(int id, string? status, string? resolutionNotes)
    {
        var complaint = await _context.Complaints.FirstOrDefaultAsync(c => c.ComplaintId == id)
            ?? throw new InvalidOperationException($"Complaint not found with ID: {id}");

        if (!string.IsNullOrWhiteSpace(status))
        {
            complaint.Status = status;
        }

        if (resolutionNotes != null)
        {
            complaint.ResolutionNotes = resolutionNotes;
        }

        await _context.SaveChangesAsync();
        return complaint;
    }

    public async Task DeleteComplaintAsync(int id)
    {
        var complaint = await _context.Complaints.FirstOrDefaultAsync(c => c.ComplaintId == id)
            ?? throw new InvalidOperationException($"Complaint not found with ID: {id}");

        _context.Complaints.Remove(complaint);
        await _context.SaveChangesAsync();
    }
}
