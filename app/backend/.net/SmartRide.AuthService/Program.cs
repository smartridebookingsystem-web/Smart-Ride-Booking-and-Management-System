using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using SmartRide.AuthService.Data;
using SmartRide.AuthService.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure Server Port to 8091
builder.WebHost.UseUrls("http://0.0.0.0:8091");

// Add Services to DI container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddHttpClient();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure MySQL Database Connection String
string connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "server=localhost;port=3307;database=p03_srbms;user=root;password=system;SSL Mode=None;";

bool isContainer = Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true";
if (!isContainer && connectionString.Contains("mysql-db"))
{
    connectionString = connectionString.Replace("mysql-db", "127.0.0.1").Replace("3306", "3307");
}

string? springPassword = Environment.GetEnvironmentVariable("SPRING_DATASOURCE_PASSWORD")
    ?? Environment.GetEnvironmentVariable("MYSQL_ROOT_PASSWORD");
if (!string.IsNullOrWhiteSpace(springPassword))
{
    connectionString = System.Text.RegularExpressions.Regex.Replace(
        connectionString,
        @"password=[^;]*",
        $"password={springPassword}");
}

var serverVersion = new MySqlServerVersion(new Version(8, 0, 30));

builder.Services.AddDbContext<AuthDbContext>(options =>
{
    options.UseMySql(connectionString, serverVersion, mySqlOptions =>
    {
        mySqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null);
    });
});

// Register Domain Services
builder.Services.AddSingleton<IJwtService, JwtService>();
builder.Services.AddSingleton<IOtpService, OtpService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IComplaintService, ComplaintService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure Middleware Pipeline
if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "SmartRide Auth Service API v1");
    });
}

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();
