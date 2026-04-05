import logging
import httpx
from typing import Tuple, Optional

logger = logging.getLogger(__name__)

# Bounding Box Jawa (Sama seperti frontend)
BBOX_JAWA = "105.0,-8.8,114.6,-5.8"
DEFAULT_UGM_LAT = -7.7663249
DEFAULT_UGM_LON = 110.3704283

def geocode_photon(query: str) -> Optional[Tuple[float, float]]:
    """
    Mengubah nama tempat menjadi koordinat (lat, lon) menggunakan Photon OSM API.
    Akan mengembalikan (lat, lon) dari hasil pencarian terbaik, atau None jika gagal.
    """
    try:
        url = "https://photon.komoot.io/api/"
        params = {
            "q": query,
            "lat": DEFAULT_UGM_LAT,
            "lon": DEFAULT_UGM_LON,
            "limit": 1,
            "bbox": BBOX_JAWA
        }
        resp = httpx.get(url, params=params, timeout=5.0)
        resp.raise_for_status()
        data = resp.json()
        
        if data.get("features"):
            # GeoJSON coordinates are [lon, lat]
            coords = data["features"][0]["geometry"]["coordinates"]
            lon, lat = coords[0], coords[1]
            return lat, lon
            
    except Exception as e:
        logger.error(f"Error geocoding '{query}' via Photon: {e}")
        
    return None


def get_osrm_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> Optional[float]:
    """
    Mengambil jarak rute berkendara antara dua titik menggunakan OSRM.
    Mengembalikan metrik jarak dalam KM (float) atau None jika gagal.
    """
    try:
        # Format OSRM: lon,lat;lon,lat
        url = f"https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=false"
        resp = httpx.get(url, timeout=5.0)
        resp.raise_for_status()
        data = resp.json()
        
        if data.get("routes") and len(data["routes"]) > 0:
            distance_meters = data["routes"][0]["distance"]
            return distance_meters / 1000.0
            
    except Exception as e:
        logger.error(f"Error OSRM routing: {e}")
        
    return None


def calculate_route_distance(pickup_location: str, dropoff_location: str) -> str:
    """
    Fungsi utama untuk digunakan sebagai Tool oleh LLM.
    Menerima nama titik jemput dan titik antar, lalu mengembalikan string deskripsi hasil.
    """
    logger.info(f"LLM Tool Calling: Calculating distance between '{pickup_location}' and '{dropoff_location}'")
    
    # 1. Geocode Titik Jemput
    pickup_coords = geocode_photon(pickup_location)
    if not pickup_coords:
        return f"Gagal mengecek jarak: Lokasi jemput '{pickup_location}' tidak ditemukan di peta Pulau Jawa."
        
    # 2. Geocode Titik Antar
    dropoff_coords = geocode_photon(dropoff_location)
    if not dropoff_coords:
        return f"Gagal mengecek jarak: Lokasi antar '{dropoff_location}' tidak ditemukan di peta Pulau Jawa."
        
    # 3. Hitung Jarak OSRM
    distance_km = get_osrm_distance(pickup_coords[0], pickup_coords[1], dropoff_coords[0], dropoff_coords[1])
    if distance_km is None:
        return "Gagal menghitung rute perjalanan di peta. Layanan peta mungkin sedang sibuk atau titik tidak dapat dilalui kendaraan."
        
    return f"Sukses! Jarak aspal berkendara dari '{pickup_location}' ke '{dropoff_location}' adalah sekitar {distance_km:.1f} KM."
