using Microsoft.EntityFrameworkCore;
using SmartRide.RideService.Data;
using SmartRide.RideService.Services;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Configure Server Port to 8092
builder.WebHost.UseUrls("http://0.0.0.0:8092");

// Add Services to Container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure MySQL Database Connection String
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

builder.Services.AddDbContext<RideDbContext>(options =>
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 30)),
        mySqlOptions => mySqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorNumbersToAdd: null)));

builder.Services.AddScoped<IRideService, SmartRide.RideService.Services.RideService>();

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

if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "SmartRide Ride Service API v1");
    });
}

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();
