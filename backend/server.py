from flask import Flask, request, jsonify
from flask_cors import CORS
from flight_optimizer import FlightOptimizer, API_KEY

app = Flask(__name__)
CORS(app)

optimizer = FlightOptimizer(API_KEY)

@app.route('/api/optimize', methods=['POST'])
def optimize_flight():
    data = request.json
    origin_city = data.get('origin')
    destinations = data.get('destinations', [])

    if not origin_city or not destinations:
        return jsonify({"error": "Missing data (origin or destinations required)"}), 400

    # 1. Resolve origin (Now expecting 3 return values)
    origin_code, origin_name, origin_coords = optimizer.get_location_details(origin_city)
    
    if not origin_code:
        return jsonify({"error": f"Invalid origin city: {origin_city}"}), 404

    # 2. Execute logic (Now passing origin_coords)
    best_flight = optimizer.search_flights(origin_code, origin_coords, destinations)

    if best_flight:
        return jsonify(best_flight)
    else:
        return jsonify({"message": "No flights found"}), 404

if __name__ == '__main__':
    print("🚀 Server running at http://localhost:5000")
    app.run(port=5000, debug=True)