using SmartRide.ApiGateway.Middleware;
using SmartRide.ApiGateway.Services;

var builder = WebApplication.CreateBuilder(args);

// Add Services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<IJwtUtil, JwtUtil>();

// Add YARP Reverse Proxy
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// Configure CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("GatewayCorsPolicy", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
            origin.StartsWith("http://localhost:") || origin.StartsWith("http://127.0.0.1:"))
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()
              .WithExposedHeaders("Authorization", "X-User-Id", "X-User-Role", "X-User-Email");
    });
});

var app = builder.Build();

// Configure Swagger
if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "SmartRide API Gateway v1");
    });
}

app.UseCors("GatewayCorsPolicy");

// Custom JWT Authentication Filter Middleware
app.UseMiddleware<JwtAuthenticationMiddleware>();

// Map Reverse Proxy Routes
app.MapReverseProxy();

app.Run();
