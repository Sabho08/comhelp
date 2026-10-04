import unittest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.scoring_engine import calculate_accessibility_score
from backend.app.services.routing_engine import generate_multi_routes
from backend.app.models.schemas import RouteRequest

class TestAccessRouteLive(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "online")
        self.assertIn("wheelchair", data["modes_supported"])
        self.assertIn("vision", data["modes_supported"])
        self.assertIn("pram_elderly", data["modes_supported"])

    def test_places_search(self):
        response = self.client.get("/api/places?city=New%20Delhi")
        self.assertEqual(response.status_code, 200)
        places = response.json()
        self.assertGreater(len(places), 0)
        first_place = places[0]
        self.assertIn("accessibility", first_place)
        self.assertIn("has_ramp", first_place["accessibility"])

    def test_wheelchair_step_free_routing(self):
        req_payload = {
            "origin": [28.6340, 77.2160],
            "destination": [28.6328, 77.2197],
            "profile": "wheelchair",
            "origin_name": "Connaught Outer",
            "destination_name": "Central Park Metro"
        }
        response = self.client.post("/api/routes", json=req_payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("routes", data)
        routes = data["routes"]
        self.assertGreaterEqual(len(routes), 2)
        
        # Verify recommended route has step-free assurance
        rec_route = routes[0]
        self.assertTrue(rec_route["is_recommended"])
        self.assertTrue(rec_route["is_step_free"])
        self.assertEqual(rec_route["accessibility_breakdown"]["stairs_count"], 0)
        self.assertGreaterEqual(rec_route["accessibility_breakdown"]["ramps_count"], 1)
        self.assertEqual(rec_route["accessibility_breakdown"]["confidence_level"], "HIGH")

    def test_slope_and_stair_penalties(self):
        # Test wheelchair score when stairs are present
        score_stairs, step_free, warning = calculate_accessibility_score(
            profile="wheelchair",
            distance_meters=1000,
            duration_seconds=900,
            stairs_count=2,
            ramps_count=0,
            max_slope_pct=3.0,
            barriers_count=0,
            tactile_pct=0
        )
        self.assertFalse(step_free)
        self.assertLess(score_stairs, 60.0)
        self.assertIn("stairs", warning.lower())

    def test_community_hazard_report_and_voting(self):
        # Create report
        report_data = {
            "category": "broken_ramp",
            "title": "Test Damaged Ramp on Footpath",
            "description": "Cracked concrete step trap",
            "severity": "severe",
            "latitude": 28.6310,
            "longitude": 77.2180,
            "reporter_name": "Test QA User"
        }
        create_res = self.client.post("/api/reports", json=report_data)
        self.assertEqual(create_res.status_code, 201)
        report = create_res.json()
        self.assertEqual(report["status"], "UNVERIFIED")
        report_id = report["id"]

        # Upvote to confirm
        vote_res = self.client.post(f"/api/reports/{report_id}/vote", json={"vote_type": "upvote"})
        self.assertEqual(vote_res.status_code, 200)
        updated_report = vote_res.json()
        self.assertEqual(updated_report["upvotes"], 2)

    def test_event_zones_retrieval(self):
        response = self.client.get("/api/events")
        self.assertEqual(response.status_code, 200)
        events = response.json()
        self.assertGreater(len(events), 0)
        self.assertIn("polygon", events[0])

if __name__ == "__main__":
    unittest.main()
