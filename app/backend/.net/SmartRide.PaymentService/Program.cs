using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using SmartRide.PaymentService.Data;
using SmartRide.PaymentService.Exceptions;
using SmartRide.PaymentService.Models.DTOs;
using SmartRide.PaymentService.Services;
using SmartRide.PaymentService.Strategies;

using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Configure Server Port to 8093
builder.WebHost.UseUrls("http://0.0.0.0:8093");

// Add Controllers & OpenAPI/Swagger
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure MySQL DbContext
var isDocker = Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true" || File.Exists("/.dockerenv");
var dbPassword = Environment.GetEnvironmentVariable("SPRING_DATASOURCE_PASSWORD") 
    ?? Environment.GetEnvironmentVariable("MYSQL_ROOT_PASSWORD") 
    ?? "system";

var defaultConnectionString = isDocker
    ? $"Server=mysql-db;Port=3306;Database=p03_srbms;User=root;Password={dbPassword};"
    : $"Server=127.0.0.1;Port=3307;Database=p03_srbms;User=root;Password={dbPassword};";

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString) || (!isDocker && connectionString.Contains("mysql-db")))
{
    connectionString = defaultConnectionString;
}

builder.Services.AddDbContext<PaymentDbContext>(options =>
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 30)),
        mySqlOptions => mySqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorNumbersToAdd: null)));

// Register Payment Strategies
builder.Services.AddScoped<IPaymentProcessorStrategy, CardPaymentProcessor>();
builder.Services.AddScoped<IPaymentProcessorStrategy, CashPaymentProcessor>();
builder.Services.AddScoped<IPaymentProcessorStrategy, UpiPaymentProcessor>();
builder.Services.AddScoped<IPaymentProcessorStrategy, WalletPaymentProcessor>();
builder.Services.AddScoped<PaymentProcessorFactory>();

// Register Application Services
builder.Services.AddScoped<IWalletService, WalletService>();
builder.Services.AddScoped<IPaymentService, SmartRide.PaymentService.Services.PaymentService>();

var app = builder.Build();

// Configure Swagger in Development or Container
if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Global Exception Handling Middleware
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exceptionHandlerPathFeature = context.Features.Get<IExceptionHandlerPathFeature>();
        var exception = exceptionHandlerPathFeature?.Error;

        int statusCode = StatusCodes.Status500InternalServerError;
        string message = "Internal Server Error";

        switch (exception)
        {
            case PaymentNotFoundException ex:
                statusCode = StatusCodes.Status404NotFound;
                message = ex.Message;
                break;
            case DuplicateTransactionException ex:
                statusCode = StatusCodes.Status409Conflict;
                message = ex.Message;
                break;
            case InsufficientFundsException ex:
                statusCode = StatusCodes.Status400BadRequest;
                message = ex.Message;
                break;
            case PaymentException ex:
                statusCode = StatusCodes.Status500InternalServerError;
                message = ex.Message;
                break;
            case Exception ex:
                statusCode = StatusCodes.Status500InternalServerError;
                message = "Internal Server Error: " + ex.Message;
                break;
        }

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var response = ApiResponse<object>.ErrorResponse(message);
        await context.Response.WriteAsJsonAsync(response);
    });
});

app.MapControllers();

app.Run();
