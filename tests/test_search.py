import unittest
from fastapi.testclient import TestClient
from backend.app.main import app

class TestLocationSearchAndAccessibility(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_search_suggest_short_query_returns_empty(self):
        # Queries with fewer than 2 characters must return empty list without error
        response = self.client.get("/api/search/suggest?text=h")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["results"], [])
        self.assertEqual(data["count"], 0)

    def test_search_suggest_with_proximity_bias(self):
        # Autocomplete with lat/lon proximity bias (Mumbai context)
        response = self.client.get("/api/search/suggest?text=hospital&lat=19.0760&lon=72.8777&limit=5")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("results", data)
        self.assertIn("count", data)
        if data["results"]:
            first = data["results"][0]
            self.assertIn("name", first)
            self.assertIn("address", first)
            self.assertIn("latitude", first)
            self.assertIn("longitude", first)
            self.assertIn("type", first)

    def test_search_suggest_global_query(self):
        # Global query without restricting to user's city
        response = self.client.get("/api/search/suggest?text=London&limit=3")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("results", data)

    def test_accessibility_lookup_verified_place(self):
        # Connaught Place coordinates (delhi-1: 28.6328, 77.2197)
        response = self.client.get("/api/search/accessibility?lat=28.6328&lon=77.2197&name=Connaught%20Place")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["has_data"])
        self.assertTrue(data["verified"])
        self.assertIsNotNone(data["accessibility"])
        self.assertTrue(data["accessibility"]["has_ramp"])

    def test_accessibility_lookup_unverified_place(self):
        # Unknown/unverified coordinates
        response = self.client.get("/api/search/accessibility?lat=12.3456&lon=78.9101&name=Random%20Address")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertFalse(data["has_data"])
        self.assertFalse(data["verified"])
        self.assertIsNone(data["accessibility"])
        self.assertIn("unavailable", data["message"].lower())

if __name__ == "__main__":
    unittest.main()
