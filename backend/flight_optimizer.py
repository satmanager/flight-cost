import os
import requests
import argparse
from datetime import datetime, timedelta
from haversine import haversine, Unit # Import the library
from dotenv import load_dotenv  

# 1. Load config variables from .env
load_dotenv()

# CONFIGURATION
API_KEY = os.getenv("KIWI_API_KEY")
BASE_URL = "https://tequila-api.kiwi.com"

if not API_KEY:
    raise ValueError("Error: Didn't found variable KIWI_API_KEY in configuration file")

class FlightOptimizer:
    def __init__(self, api_key):
        self.headers = {"apikey": api_key}

    def get_location_details(self, city_name):
        """
        Resolves a city name to an IATA code and coordinates (lat, lon).
        Returns: (code, name, (lat, lon))
        """
        endpoint = f"{BASE_URL}/locations/query"
        params = {
            "term": city_name,
            "location_types": "city",
            "limit": 1
        }
        try:
            response = requests.get(endpoint, headers=self.headers, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data["locations"]:
                location_data = data["locations"][0]
                code = location_data["code"]
                name = location_data["name"]
                
                # Extract coordinates
                lat = location_data["location"]["lat"]
                lon = location_data["location"]["lon"]
                coords = (lat, lon)
                
                return code, name, coords
            
            return None, None, None
        except Exception as e:
            print(f"Error searching for city {city_name}: {e}")
            return None, None, None

    def search_flights(self, origin_code, origin_coords, fly_to_list):
        """
        Searches for flights and finds the best value per km using Haversine distance.
        """
        
        today = datetime.now()
        tomorrow = today + timedelta(days=1)
        date_from = today.strftime("%d/%m/%Y")
        date_to = tomorrow.strftime("%d/%m/%Y")

        best_flight = None
        best_ratio = float('inf')

        for dest_city_name in fly_to_list:
            # Get destination details (Code + Coordinates)
            dest_code, dest_name, dest_coords = self.get_location_details(dest_city_name)
            
            if not dest_code:
                print(f"⚠️ Could not find details for: {dest_city_name}")
                continue

            # --- CALCULATE HAVERSINE DISTANCE ---
            # Calculate distance between Origin and Destination coordinates
            distance_km = haversine(origin_coords, dest_coords, unit=Unit.KILOMETERS)
            
            if distance_km == 0:
                print(f"Skipping {dest_name}: Distance is 0 km.")
                continue

            # Search API
            endpoint = f"{BASE_URL}/v2/search"
            params = {
                "fly_from": origin_code,
                "fly_to": dest_code,
                "date_from": date_from,
                "date_to": date_to,
                "one_for_city": 1, 
                "adults": 1,
                "curr": "USD"
            }

            try:
                response = requests.get(endpoint, headers=self.headers, params=params)
                if response.status_code != 200:
                    continue
                
                data = response.json()
                
                # We only need the price from the API now, we have our own distance
                for flight in data.get("data", []):
                    price = flight["price"]
                    
                    # Calculate ratio using our Haversine distance
                    ratio = price / distance_km
                    
                    if ratio < best_ratio:
                        best_ratio = ratio
                        best_flight = {
                            "destination": dest_name,
                            "price": price,
                            "distance": round(distance_km, 2), # Using our calculated distance
                            "ratio": round(ratio, 4)
                        }
            except Exception as e:
                print(f"Error searching flights to {dest_city_name}: {e}")

        return best_flight

# CLI Execution Logic
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Find the cheapest flight per kilometer (Haversine).')
    parser.add_argument('--from', dest='origin', required=True, help='Departure city name')
    parser.add_argument('--to', dest='destinations', nargs='+', required=True, help='List of destination cities')
    
    args = parser.parse_args()
    
    optimizer = FlightOptimizer(API_KEY)
    
    # 1. Get origin details (Code + Coords)
    origin_code, origin_name, origin_coords = optimizer.get_location_details(args.origin)
    
    if not origin_code:
        print(f"Error: Could not find origin city '{args.origin}'")
        exit(1)

    print(f"🔎 Searching from {origin_name} ({origin_code}) at coords {origin_coords}...")
    
    # 2. Search using coordinates
    result = optimizer.search_flights(origin_code, origin_coords, args.destinations)

    # 3. Output results
    if result:
        print("\n🏆 Best Flight Found!")
        print(f"Destination: {result['destination']}")
        print(f"Total Price: ${result['price']}")
        print(f"Geo Distance: {result['distance']} km")
        print(f"Value: ${result['ratio']:.2f}/km")
    else:
        print("\nNo flights found within the next 24h.")