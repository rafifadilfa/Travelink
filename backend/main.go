package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// User represents a user in the system
type User struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

// Tour represents a tour package
type Tour struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Location    string   `json:"location"`
	Price       int      `json:"price"`
	Duration    string   `json:"duration"`
	Images      []string `json:"images"`
	Rating      float64  `json:"rating"`
	Reviews     int      `json:"reviews"`
}

// Guide represents a tour guide
type Guide struct {
	ID        string   `json:"id"`
	Name      string   `json:"name"`
	Bio       string   `json:"bio"`
	Languages []string `json:"languages"`
	Avatar    string   `json:"avatar"`
	Rating    float64  `json:"rating"`
	Reviews   int      `json:"reviews"`
}

// Temporary data stores
var tours = []Tour{
	{
		ID:          "1",
		Name:        "Bali Adventure",
		Description: "Experience the magic of Bali with our trusted guides",
		Location:    "Bali",
		Price:       1000000,
		Duration:    "3 days",
		Images:      []string{"/images/bali1.jpg", "/images/bali2.jpg"},
		Rating:      4.9,
		Reviews:     145,
	},
	{
		ID:          "2",
		Name:        "Lombok Escape",
		Description: "Discover pristine beaches and breathtaking landscapes",
		Location:    "Lombok",
		Price:       1200000,
		Duration:    "4 days",
		Images:      []string{"/images/lombok1.jpg", "/images/lombok2.jpg"},
		Rating:      4.8,
		Reviews:     112,
	},
	{
		ID:          "3",
		Name:        "Jakarta City Tour",
		Description: "Explore the vibrant capital city with local experts",
		Location:    "Jakarta",
		Price:       900000,
		Duration:    "2 days",
		Images:      []string{"/images/jakarta1.jpg", "/images/jakarta2.jpg"},
		Rating:      4.7,
		Reviews:     98,
	},
}

var guides = []Guide{
	{
		ID:        "1",
		Name:      "Sarah Johnson",
		Bio:       "10 years of experience guiding tours throughout Indonesia. Expert in local culture and history.",
		Languages: []string{"English", "Indonesian"},
		Avatar:    "/images/guide1.jpg",
		Rating:    4.9,
		Reviews:   156,
	},
	{
		ID:        "2",
		Name:      "Putu Wijaya",
		Bio:       "Born and raised in Bali, passionate about sharing local traditions and hidden gems.",
		Languages: []string{"English", "Indonesian", "Japanese"},
		Avatar:    "/images/guide2.jpg",
		Rating:    4.8,
		Reviews:   123,
	},
	{
		ID:        "3",
		Name:      "Wayan Sudiarta",
		Bio:       "Adventure specialist with deep knowledge of Indonesia's natural wonders.",
		Languages: []string{"English", "Indonesian", "German"},
		Avatar:    "/images/guide3.jpg",
		Rating:    4.9,
		Reviews:   189,
	},
}

func main() {
	r := mux.NewRouter()

	// API routes
	r.HandleFunc("/api/tours", getTours).Methods("GET")
	r.HandleFunc("/api/tours/{id}", getTour).Methods("GET")
	r.HandleFunc("/api/guides", getGuides).Methods("GET")
	r.HandleFunc("/api/guides/{id}", getGuide).Methods("GET")
	r.HandleFunc("/api/auth/login", login).Methods("POST")
	r.HandleFunc("/api/auth/register", register).Methods("POST")
	
	// Set up CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"}, // Frontend URL
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})
	
	// Wrap router with CORS handler
	handler := c.Handler(r)
	
	// Start server
	log.Println("Server starting on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", handler))
}

// API Handlers
func getTours(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tours)
}

func getTour(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	params := mux.Vars(r)
	id := params["id"]
	
	for _, tour := range tours {
		if tour.ID == id {
			json.NewEncoder(w).Encode(tour)
			return
		}
	}
	
	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(map[string]string{"error": "Tour not found"})
}

func getGuides(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(guides)
}

func getGuide(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	params := mux.Vars(r)
	id := params["id"]
	
	for _, guide := range guides {
		if guide.ID == id {
			json.NewEncoder(w).Encode(guide)
			return
		}
	}
	
	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(map[string]string{"error": "Guide not found"})
}

func login(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	// Simple mock login - in a real app, validate credentials
	var credentials map[string]string
	if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request"})
		return
	}
	
	// Mock successful login
	token := "mock-jwt-token"
	user := User{
		ID:        "1",
		Username:  credentials["username"],
		Email:     "user@example.com",
		CreatedAt: time.Now(),
	}
	
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token": token,
		"user":  user,
	})
}

func register(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	// Simple mock registration - in a real app, validate and store user
	var userData map[string]string
	if err := json.NewDecoder(r.Body).Decode(&userData); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request"})
		return
	}
	
	// Mock successful registration
	user := User{
		ID:        "new-user-id",
		Username:  userData["username"],
		Email:     userData["email"],
		CreatedAt: time.Now(),
	}
	
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Registration successful",
		"user":    user,
	})
}