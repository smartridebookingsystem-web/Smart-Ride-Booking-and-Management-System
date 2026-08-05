namespace SmartRide.PaymentService.Models.DTOs;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public ApiResponse()
    {
        Timestamp = DateTime.UtcNow;
    }

    public ApiResponse(bool success, string message, T? data)
    {
        Success = success;
        Message = message;
        Data = data;
        Timestamp = DateTime.UtcNow;
    }

    public static ApiResponse<T> SuccessResponse(string message, T? data)
    {
        return new ApiResponse<T>(true, message, data);
    }

    public static ApiResponse<T> ErrorResponse(string message)
    {
        return new ApiResponse<T>(false, message, default);
    }
}
