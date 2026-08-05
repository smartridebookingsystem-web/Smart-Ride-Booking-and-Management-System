using System.Text.RegularExpressions;

namespace SmartRide.AiService.Services;

public record KnowledgeChunk(
    string Id,
    string Category,
    string Title,
    string Content,
    HashSet<string> Keywords,
    Dictionary<string, double> TfMap
);

public class SemanticKnowledgeSearchEngine
{
    private readonly List<KnowledgeChunk> _knowledgeBase = new();
    private readonly Dictionary<string, double> _idfMap = new();
    private readonly ILogger<SemanticKnowledgeSearchEngine> _logger;

    private static readonly HashSet<string> StopWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "a", "an", "the", "and", "or", "but", "is", "if", "then", "else", "when",
        "at", "by", "for", "with", "about", "against", "between", "into", "through",
        "during", "before", "after", "above", "below", "to", "from", "up", "down",
        "in", "out", "on", "off", "over", "under", "again", "further", "once",
        "here", "there", "where", "why", "how", "all", "any", "both", "each", "few",
        "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own",
        "same", "so", "than", "too", "very", "can", "will", "just", "should", "now"
    };

    public SemanticKnowledgeSearchEngine(ILogger<SemanticKnowledgeSearchEngine> logger)
    {
        _logger = logger;
        InitKnowledgeBase();
        CalculateIdf();
    }

    private void InitKnowledgeBase()
    {
        // Chunk 0: Platform Overview & Identity
        AddChunk(
            "PLATFORM_OVERVIEW",
            "About SmartRide",
            "SmartRide Platform Overview",
            """
            SmartRide is a modern, enterprise-grade ride-booking and urban mobility management platform. 
            It connects Riders, Drivers, and Administrators through real-time interactive mapping, dynamic vehicle fare calculation, secure digital wallet payments, 4-digit OTP trip security, and AI-powered virtual assistance.
            """,
            new() { "smartride", "what is smartride", "about smartride", "overview", "platform", "system", "app", "application", "service", "company", "who are you", "who are u", "identity", "assistant" }
        );

        // Chunk 1: Ride Booking & Trip Workflow
        AddChunk(
            "RIDE_BOOKING",
            "Ride Booking Workflow",
            "How to Book a Ride on SmartRide",
            """
            To book a ride on SmartRide:
            1. Open the Rider Portal at http://localhost:5175.
            2. Set your Pickup and Dropoff locations on the interactive map.
            3. Choose from 3 vehicle categories: Hatchback (Economy), Sedan (Comfort), or SUV (Premium).
            4. Select payment method: Cash, SmartRide Wallet, Credit/Debit Card, or UPI.
            5. Click 'Book Ride'. Once a driver accepts, you will receive a 4-digit OTP. Share this OTP with your driver upon pickup to start your trip!
            """,
            new() { "book", "booking", "how to book", "order ride", "pickup", "dropoff", "otp", "map", "location", "cab", "taxi" }
        );

        // Chunk 2: Fare Calculation & Rates
        AddChunk(
            "FARE_CALCULATION",
            "Fare Rates & Estimation",
            "SmartRide Fare Calculation & Vehicle Rates",
            """
            SmartRide fare calculation is based on trip distance (km) and vehicle category:
            • Hatchback (Economy): Base Fare ₹50 + ₹12 per km (4 passengers)
            • Sedan (Comfort): Base Fare ₹80 + ₹16 per km (4 passengers)
            • SUV (Premium): Base Fare ₹120 + ₹22 per km (6 passengers)

            Total Fare Formula: Base Fare + (Distance in km × Rate per km).
            Exact fare estimates are displayed on the map before you confirm your booking.
            """,
            new() { "fare", "fares", "price", "pricing", "cost", "rate", "rates", "charge", "estimate", "km", "distance", "hatchback", "sedan", "suv", "economy", "comfort", "premium", "rupees", "how much" }
        );

        // Chunk 3: Driver Onboarding & Registration
        AddChunk(
            "DRIVER_ONBOARDING",
            "Driver Onboarding & Verification",
            "How to Register as a SmartRide Driver",
            """
            To become a SmartRide driver:
            1. Register at the Driver Portal (http://localhost:5174).
            2. Upload mandatory documents: Driving License, Vehicle RC (Registration Certificate), Aadhaar Card, and Photo.
            3. Your account starts in 'PENDING_APPROVAL' state while Admin verifies your documents via the Admin Dashboard.
            4. Once approved by Admin, toggle your status to 'Online' to accept incoming ride requests and start earning.
            """,
            new() { "driver", "onboarding", "become a driver", "license", "rc", "aadhaar", "document", "driver approval", "earn", "join as driver" }
        );

        // Chunk 4: Admin Dashboard & Management
        AddChunk(
            "ADMIN_MANAGEMENT",
            "Admin Management & Approvals",
            "SmartRide Admin Dashboard & System Controls",
            """
            The Admin Dashboard is located at http://localhost:5173.
            Admins can:
            • Review pending driver applications and inspect uploaded PDF/Image documents.
            • Approve or reject driver accounts with feedback.
            • Manage riders and drivers (activate, suspend, delete).
            • Monitor live active rides, completed bookings, and system-wide revenue analytics.
            """,
            new() { "admin", "dashboard", "approve driver", "verify driver", "inspect document", "suspend user", "revenue analytics" }
        );

        // Chunk 5: Payments & Wallet System
        AddChunk(
            "PAYMENTS_WALLET",
            "Payments & SmartRide Wallet",
            "SmartRide Payment Options & Digital Wallet",
            """
            SmartRide supports multiple payment methods:
            • SmartRide Wallet: Top up funds instantly via UPI or Cards. Fares are auto-deducted seamlessly upon trip completion.
            • Cash: Pay the driver directly upon reaching your destination.
            • Credit/Debit Card & UPI: Direct online payments.
            Full transaction logs and wallet balances are accessible on your Rider Dashboard.
            """,
            new() { "payment", "pay", "wallet", "cash", "upi", "card", "netbanking", "deduct", "transaction", "recharge", "balance", "topup" }
        );

        // Chunk 6: Support, Lost & Found & Emergency
        AddChunk(
            "SUPPORT_HELP",
            "Support, Complaints & Safety",
            "SmartRide Help Center & Emergency Support",
            """
            For help, lost items, or safety issues:
            • Lost Items: Go to 'My Bookings' on http://localhost:5175, select the trip, and click 'Report Lost Item'.
            • Complaints & Support: Contact support@smartride.com or use the Contact & Support page.
            • Emergency SOS: Click the in-app Emergency SOS button during an active ride for immediate assistance.
            """,
            new() { "lost", "found", "item", "bag", "phone", "support", "help", "complaint", "sos", "emergency", "contact", "safety", "forgot" }
        );
    }

    private void AddChunk(string id, string category, string title, string content, HashSet<string> keywords)
    {
        string fullText = (title + " " + content + " " + string.Join(" ", keywords)).ToLower();
        var tfMap = ComputeTf(fullText);
        _knowledgeBase.Add(new KnowledgeChunk(id, category, title, content, keywords, tfMap));
    }

    private Dictionary<string, double> ComputeTf(string text)
    {
        var tokens = Regex.Replace(text, @"[^a-zA-Z0-9\s]", " ").ToLower().Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries);
        var counts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        int total = 0;

        foreach (var t in tokens)
        {
            if (t.Length >= 2 && !StopWords.Contains(t))
            {
                counts[t] = counts.GetValueOrDefault(t, 0) + 1;
                total++;
            }
        }

        var tf = new Dictionary<string, double>(StringComparer.OrdinalIgnoreCase);
        foreach (var (term, count) in counts)
        {
            tf[term] = (double)count / (total == 0 ? 1 : total);
        }
        return tf;
    }

    private void CalculateIdf()
    {
        int N = _knowledgeBase.Count;
        var docCounts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        foreach (var chunk in _knowledgeBase)
        {
            foreach (var term in chunk.TfMap.Keys)
            {
                docCounts[term] = docCounts.GetValueOrDefault(term, 0) + 1;
            }
        }

        foreach (var (term, count) in docCounts)
        {
            double idf = Math.Log((double)(N + 1) / (count + 1)) + 1.0;
            _idfMap[term] = idf;
        }
    }

    public List<KnowledgeChunk> Search(string query, int topK = 2)
    {
        if (string.IsNullOrWhiteSpace(query)) return new();

        var queryTf = ComputeTf(query);
        var queryVector = new Dictionary<string, double>(StringComparer.OrdinalIgnoreCase);

        foreach (var (term, tf) in queryTf)
        {
            double idf = _idfMap.GetValueOrDefault(term, 1.0);
            queryVector[term] = tf * idf;
        }

        var scored = new List<(KnowledgeChunk Chunk, double Score)>();
        string lowerQuery = query.ToLower();

        foreach (var chunk in _knowledgeBase)
        {
            var docVector = new Dictionary<string, double>(StringComparer.OrdinalIgnoreCase);
            foreach (var (term, tf) in chunk.TfMap)
            {
                double idf = _idfMap.GetValueOrDefault(term, 1.0);
                docVector[term] = tf * idf;
            }

            double score = CosineSimilarity(queryVector, docVector);

            foreach (var kw in chunk.Keywords)
            {
                if (Regex.IsMatch(lowerQuery, @"\b" + Regex.Escape(kw) + @"\b", RegexOptions.IgnoreCase))
                {
                    score += 0.45;
                }
            }

            if (score > 0.05)
            {
                scored.Add((chunk, score));
            }
        }

        var results = scored
            .OrderByDescending(s => s.Score)
            .Take(topK)
            .Select(s => s.Chunk)
            .ToList();

        _logger.LogInformation("Semantic Search for '{Query}' found {Count} relevant chunks. Top chunk: {Title}",
            query, results.Count, results.FirstOrDefault()?.Title ?? "None");

        return results;
    }

    private double CosineSimilarity(Dictionary<string, double> v1, Dictionary<string, double> v2)
    {
        double dotProduct = 0.0, normA = 0.0, normB = 0.0;

        foreach (var (term, val1) in v1)
        {
            normA += val1 * val1;
            if (v2.TryGetValue(term, out double val2))
            {
                dotProduct += val1 * val2;
            }
        }

        foreach (var val2 in v2.Values)
        {
            normB += val2 * val2;
        }

        if (normA == 0.0 || normB == 0.0) return 0.0;
        return dotProduct / (Math.Sqrt(normA) * Math.Sqrt(normB));
    }
}
