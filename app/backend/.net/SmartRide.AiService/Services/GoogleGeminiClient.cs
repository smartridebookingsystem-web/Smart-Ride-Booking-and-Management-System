using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SmartRide.AiService.Services;

public class GoogleGeminiClient
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GoogleGeminiClient> _logger;

    public GoogleGeminiClient(HttpClient httpClient, IConfiguration configuration, ILogger<GoogleGeminiClient> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<string?> GenerateContentAsync(string systemPrompt, string userPrompt)
    {
        string? apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY") 
                         ?? _configuration["Gemini:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey) || apiKey.StartsWith("AQ."))
        {
            _logger.LogWarning("Gemini API key is invalid or dummy. Skipping Google Gemini API call.");
            return null;
        }

        string model = _configuration["Gemini:Model"] ?? "gemini-2.0-flash";
        string endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

        var requestBody = new
        {
            system_instruction = new
            {
                parts = new[] { new { text = systemPrompt } }
            },
            contents = new[]
            {
                new { parts = new[] { new { text = userPrompt } } }
            }
        };

        try
        {
            string json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(endpoint, content);
            if (!response.IsSuccessStatusCode)
            {
                string errText = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Google Gemini API call failed with status {Code}: {Err}", response.StatusCode, errText);
                return null;
            }

            string responseJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseJson);
            
            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return text;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while calling Google Gemini API.");
            return null;
        }
    }
}
