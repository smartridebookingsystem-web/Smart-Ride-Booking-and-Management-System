using Microsoft.AspNetCore.Mvc;
using SmartRide.AuthService.Models.Entities;
using SmartRide.AuthService.Services;

namespace SmartRide.AuthService.Controllers;

[ApiController]
[Route("api/complaints")]
public class ComplaintController : ControllerBase
{
    private readonly IComplaintService _complaintService;

    public ComplaintController(IComplaintService complaintService)
    {
        _complaintService = complaintService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Complaint>>> GetAllComplaints()
    {
        var complaints = await _complaintService.GetAllComplaintsAsync();
        return Ok(complaints);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetComplaintById([FromRoute] int id)
    {
        var complaint = await _complaintService.GetComplaintByIdAsync(id);
        if (complaint == null)
        {
            return NotFound();
        }
        return Ok(complaint);
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<List<Complaint>>> GetComplaintsByUserId([FromRoute] int userId)
    {
        var complaints = await _complaintService.GetComplaintsByUserIdAsync(userId);
        return Ok(complaints);
    }

    [HttpPost]
    public async Task<IActionResult> CreateComplaint([FromBody] Complaint complaint)
    {
        var savedComplaint = await _complaintService.CreateComplaintAsync(complaint);
        return CreatedAtAction(nameof(GetComplaintById), new { id = savedComplaint.ComplaintId }, savedComplaint);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateComplaintStatus([FromRoute] int id, [FromBody] Dictionary<string, string> payload)
    {
        try
        {
            payload.TryGetValue("status", out var status);
            payload.TryGetValue("resolutionNotes", out var resolutionNotes);

            var updatedComplaint = await _complaintService.UpdateComplaintStatusAsync(id, status, resolutionNotes);
            return Ok(updatedComplaint);
        }
        catch (Exception ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteComplaint([FromRoute] int id)
    {
        try
        {
            await _complaintService.DeleteComplaintAsync(id);
            return Ok(new { message = "Complaint deleted successfully" });
        }
        catch (Exception ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }
}
