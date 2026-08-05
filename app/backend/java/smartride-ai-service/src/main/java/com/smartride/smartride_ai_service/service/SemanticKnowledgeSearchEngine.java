package com.smartride.smartride_ai_service.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Semantic Knowledge Search Engine for SmartRide AI Service.
 *
 * Implements Vector Space Model (TF-IDF + Cosine Similarity) for Retrieval-Augmented Generation (RAG).
 *
 * Features:
 *   1. Tokenization, stop-word filtering, and term frequency (TF) vectorization.
 *   2. Inverse Document Frequency (IDF) weights across knowledge base chunks.
 *   3. Cosine Similarity scoring to retrieve semantically relevant knowledge for ANY query.
 */
@Service
public class SemanticKnowledgeSearchEngine {

    private static final Logger log = LoggerFactory.getLogger(SemanticKnowledgeSearchEngine.class);

    private final List<KnowledgeChunk> knowledgeBase = new ArrayList<>();
    private final Map<String, Double> idfMap = new HashMap<>();

    public SemanticKnowledgeSearchEngine() {
        initKnowledgeBase();
        calculateIdf();
    }

    /**
     * Represents a semantic knowledge chunk.
     */
    public record KnowledgeChunk(
            String id,
            String category,
            String title,
            String content,
            Set<String> keywords,
            Map<String, Double> tfMap
    ) {}

    /**
     * Initializes the SmartRide Knowledge Base chunks.
     */
    private void initKnowledgeBase() {

        // Chunk 1: Ride Booking & Workflow
        addChunk(
                "RIDE_BOOKING",
                "Ride Booking & Trip Workflow",
                "How to Book a Ride on SmartRide",
                """
                To book a ride on SmartRide:
                1. Open the Rider Portal at http://localhost:5175.
                2. Set your Pickup and Dropoff locations on the interactive Leaflet map.
                3. Choose from 3 vehicle categories: Hatchback (Economy), Sedan (Comfort), or SUV (Premium).
                4. Select your preferred payment method (SmartRide Wallet, Cash, Credit/Debit Card, or UPI).
                5. Click 'Book Ride'. Once a driver accepts, you will receive a 4-digit OTP. Share this OTP with your driver upon arrival to start the ride.
                """,
                Set.of("book", "booking", "ride", "request", "trip", "pickup", "dropoff", "otp", "map", "location", "order", "cab", "taxi")
        );      

        // Chunk 2: Fare Calculation & Rates
        addChunk(
                "FARE_CALCULATION",
                "Fare Estimation & Rates",
                "SmartRide Fare Calculation & Vehicle Rates",
                """
                SmartRide fare calculation is based on distance (km) and vehicle category:
                • Hatchback (Economy): Base Fare ₹40 + ₹12 per km (4 passengers)
                • Sedan (Comfort): Base Fare ₹60 + ₹18 per km (4 passengers)
                • SUV (Premium): Base Fare ₹80 + ₹22 per km (6 passengers)  
                Total Fare Formula: Base Fare + (Distance in km × Rate per km)
                Exact fare estimates are displayed on the map before you confirm your booking.
                """,
                Set.of("fare", "price", "cost", "rate", "charge", "estimate", "km", "distance", "bike", "auto", "mini", "suv", "economy", "premium", "rupees")
        );

        // Chunk 3: Driver Onboarding & Registration
        addChunk(
                "DRIVER_ONBOARDING",
                "Driver Onboarding & Registration",
                "How to Register as a SmartRide Driver",
                """
                To become a SmartRide driver:
                1. Register at the Driver Portal (http://localhost:5174).
                2. Upload mandatory documents: Driving License (PDF/Image), Vehicle RC (Registration Certificate), Aadhaar / ID Proof, and Passport Photo.
                3. Your account starts in 'PENDING_APPROVAL' state while Admin verifies your documents via the Admin Dashboard.
                4. Once approved by Admin, toggle your status to 'Online' to start accepting ride requests and earning money.
                """,
                Set.of("driver", "onboarding", "register", "signup", "license", "rc", "aadhaar", "document", "approval", "earn", "work", "join")
        );

        // Chunk 4: Admin Management & Verification
        addChunk(
                "ADMIN_MANAGEMENT",
                "Admin Management & Approvals",
                "SmartRide Admin Dashboard & System Controls",
                """
                The Admin Dashboard is located at http://localhost:5173.
                Admins can:
                • Review pending driver applications and inspect uploaded PDF/Image documents.
                • Approve or reject driver accounts with mandatory feedback.
                • Manage riders and drivers (activate, suspend, delete).
                • Monitor live active rides, completed bookings, and system-wide revenue analytics.
                """,
                Set.of("admin", "dashboard", "approval", "verify", "inspect", "document", "suspend", "analytics", "manage", "monitor")
        );

        // Chunk 5: Payment Methods & Wallet System
        addChunk(
                "PAYMENTS_WALLET",
                "Payments & SmartRide Wallet",
                "SmartRide Payment Methods & Digital Wallet",
                """
                SmartRide supports multiple payment methods:
                • SmartRide Wallet: Add money via UPI, NetBanking, or Cards. Fare is auto-deducted upon trip completion.
                • Cash: Pay the driver directly upon reaching your destination.
                • Credit/Debit Card & UPI: Direct online payments.
                Full transaction logs and wallet balances are accessible on your Rider Dashboard.
                """,
                Set.of("payment", "pay", "wallet", "cash", "upi", "card", "netbanking", "deduct", "transaction", "recharge", "balance", "topup")
        );

        // Chunk 6: Support, Lost & Found & Complaints
        addChunk(
                "SUPPORT_HELP",
                "Support, Complaints & Lost Items",
                "SmartRide Help Center & Emergency SOS",
                """
                For help, lost items, or issues:
                • Lost Items: Go to 'My Bookings' on http://localhost:5175, select the trip, and click 'Report Lost Item'.
                • Complaints & Support: Contact support@smartride.com or use the Contact & Support page.
                • Emergency SOS: Click the in-app Emergency SOS button during an active ride for immediate safety assistance.
                """,
                Set.of("lost", "found", "item", "support", "help", "complaint", "sos", "emergency", "issue", "contact", "safety", "bag", "phone")
        );
    }

    private void addChunk(String id, String category, String title, String content, Set<String> keywords) {
        String fullText = (title + " " + content + " " + String.join(" ", keywords)).toLowerCase();
        Map<String, Double> tfMap = computeTf(fullText);
        knowledgeBase.add(new KnowledgeChunk(id, category, title, content, keywords, tfMap));
    }

    /**
     * Computes Term Frequency (TF) for a text block.
     */
    private Map<String, Double> computeTf(String text) {
        String[] tokens = text.replaceAll("[^a-zA-Z0-9\\s]", " ").toLowerCase().split("\\s+");
        Map<String, Integer> counts = new HashMap<>();
        int total = 0;
        for (String t : tokens) {
            if (t.length() > 2 && !STOP_WORDS.contains(t)) {
                counts.put(t, counts.getOrDefault(t, 0) + 1);
                total++;
            }
        }
        Map<String, Double> tf = new HashMap<>();
        for (Map.Entry<String, Integer> entry : counts.entrySet()) {
            tf.put(entry.getKey(), (double) entry.getValue() / (total == 0 ? 1 : total));
        }
        return tf;
    }

    /**
     * Calculates Inverse Document Frequency (IDF) across all knowledge chunks.
     */
    private void calculateIdf() {
        int N = knowledgeBase.size();
        Map<String, Integer> docCounts = new HashMap<>();

        for (KnowledgeChunk chunk : knowledgeBase) {
            for (String term : chunk.tfMap().keySet()) {
                docCounts.put(term, docCounts.getOrDefault(term, 0) + 1);
            }
        }

        for (Map.Entry<String, Integer> entry : docCounts.entrySet()) {
            double idf = Math.log((double) (N + 1) / (entry.getValue() + 1)) + 1.0;
            idfMap.put(entry.getKey(), idf);
        }
    }

    /**
     * Performs Semantic Similarity Search over the knowledge base using Cosine Similarity.
     *
     * @param query The user's input question
     * @param topK Number of top semantic matches to return
     * @return List of semantically matched KnowledgeChunks ordered by relevance
     */
    public List<KnowledgeChunk> search(String query, int topK) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        Map<String, Double> queryTf = computeTf(query);
        Map<String, Double> queryVector = new HashMap<>();
        for (Map.Entry<String, Double> entry : queryTf.entrySet()) {
            String term = entry.getKey();
            double idf = idfMap.getOrDefault(term, 1.0);
            queryVector.put(term, entry.getValue() * idf);
        }

        List<ScoredChunk> scored = new ArrayList<>();
        for (KnowledgeChunk chunk : knowledgeBase) {
            Map<String, Double> docVector = new HashMap<>();
            for (Map.Entry<String, Double> entry : chunk.tfMap().entrySet()) {
                String term = entry.getKey();
                double idf = idfMap.getOrDefault(term, 1.0);
                docVector.put(term, entry.getValue() * idf);
            }

            double score = cosineSimilarity(queryVector, docVector);

            // Boost score if keyword matches query
            String lowerQuery = query.toLowerCase();
            for (String kw : chunk.keywords()) {
                if (lowerQuery.contains(kw)) {
                    score += 0.35;
                }
            }

            if (score > 0.05) {
                scored.add(new ScoredChunk(chunk, score));
            }
        }

        scored.sort((a, b) -> Double.compare(b.score(), a.score()));

        log.info("Semantic Search for '{}' found {} relevant chunks. Top score: {}",
                query, scored.size(), scored.isEmpty() ? 0 : scored.get(0).score());

        return scored.stream()
                .limit(topK)
                .map(ScoredChunk::chunk)
                .collect(Collectors.toList());
    }

    /**
     * Computes Cosine Similarity between query vector and document vector.
     */
    private double cosineSimilarity(Map<String, Double> v1, Map<String, Double> v2) {
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (Map.Entry<String, Double> entry : v1.entrySet()) {
            String term = entry.getKey();
            double val1 = entry.getValue();
            normA += val1 * val1;
            if (v2.containsKey(term)) {
                dotProduct += val1 * v2.get(term);
            }
        }

        for (double val2 : v2.values()) {
            normB += val2 * val2;
        }

        if (normA == 0.0 || normB == 0.0) return 0.0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private record ScoredChunk(KnowledgeChunk chunk, double score) {}

    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "a", "an", "the", "and", "or", "but", "is", "if", "then", "else", "when",
            "at", "by", "for", "with", "about", "against", "between", "into", "through",
            "during", "before", "after", "above", "below", "to", "from", "up", "down",
            "in", "out", "on", "off", "over", "under", "again", "further", "once",
            "here", "there", "where", "why", "how", "all", "any", "both", "each", "few",
            "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own",
            "same", "so", "than", "too", "very", "can", "will", "just", "should", "now"
    ));
}
