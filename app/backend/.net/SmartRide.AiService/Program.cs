using Microsoft.OpenApi;
using SmartRide.AiService.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure Server Port to 8094
builder.WebHost.UseUrls("http://0.0.0.0:8094");

// Add Services to Container
builder.Services.AddControllers();

// Configure HttpClient for Google Gemini API Client
builder.Services.AddHttpClient<GoogleGeminiClient>();

// Register AI & Semantic Search Services
builder.Services.AddSingleton<SemanticKnowledgeSearchEngine>();
builder.Services.AddSingleton<AiSessionService>();
builder.Services.AddScoped<AiChatService>();

// Configure OpenAPI / Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "SmartRide AI Service API (.NET)",
        Version = "v1.0",
        Description = "Microservice virtual assistant for SmartRide platform powered by Google Gemini AI & Semantic Search RAG."
    });
});

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

// Enable Swagger UI in All Environments (Development + Docker)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "SmartRide AI Service API v1");
    c.RoutePrefix = "swagger"; // Available at http://localhost:5084/swagger or http://localhost:8084/swagger
});

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

// Health Check Endpoint
app.MapGet("/", () => Results.Redirect("/swagger"));
app.MapGet("/health", () => Results.Ok(new { status = "UP", service = "SmartRide.AiService (.NET)", timestamp = DateTime.UtcNow }));

app.Run();
