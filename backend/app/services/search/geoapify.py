import os
import logging
from typing import Optional, List, Dict, Any
import httpx
from dotenv import load_dotenv

from .base import SearchProvider
from ...schemas.search import SearchResult, SearchResponse

load_dotenv()
logger = logging.getLogger("accessroute.search.geoapify")

class GeoapifySearchProvider(SearchProvider):
    """
    Production-ready Geoapify Address Autocomplete provider with:
    - Proximity bias (lat/lon) without hard city restriction
    - Result normalization into AccessRoute internal schema
    - Resilient error & timeout handling
    - Zero client-side API key leakage
    """

    AUTOCOMPLETE_URL = "https://api.geoapify.com/v1/geocode/autocomplete"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key

    def _get_api_key(self) -> str:
        if self.api_key:
            return self.api_key.strip()
        key = os.getenv("GEOAPIFY_API_KEY", "").strip()
        if not key:
            # Fallback direct read from .env if running from different cwd
            try:
                env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), ".env")
                if os.path.exists(env_path):
                    with open(env_path, "r", encoding="utf-8") as f:
                        for line in f:
                            if line.startswith("GEOAPIFY_API_KEY="):
                                key = line.split("=", 1)[1].strip().strip('"').strip("'")
                                break
            except Exception:
                pass
        return key

    async def suggest(
        self,
        text: str,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        limit: int = 8
    ) -> SearchResponse:
        cleaned_query = (text or "").strip()
        if len(cleaned_query) < 2:
            return SearchResponse(results=[], count=0, query=cleaned_query)

        safe_limit = max(1, min(limit, 8))
        api_key = self._get_api_key()

        if not api_key:
            logger.error("Cannot perform autocomplete: GEOAPIFY_API_KEY missing.")
            return SearchResponse(results=[], count=0, query=cleaned_query)

        params: Dict[str, Any] = {
            "text": cleaned_query,
            "apiKey": api_key,
            "limit": safe_limit,
            "format": "json"
        }

        # Proximity bias: Geoapify expects bias=proximity:lon,lat
        if lat is not None and lon is not None:
            if -90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0:
                params["bias"] = f"proximity:{lon:.6f},{lat:.6f}"

        try:
            async with httpx.AsyncClient(timeout=4.5) as client:
                response = await client.get(self.AUTOCOMPLETE_URL, params=params)

                if response.status_code != 200:
                    logger.error(
                        f"Geoapify API returned error {response.status_code}: {response.text[:200]}"
                    )
                    return SearchResponse(results=[], count=0, query=cleaned_query)

                data = response.json()
                results = self._normalize_results(data)
                return SearchResponse(
                    results=results,
                    count=len(results),
                    query=cleaned_query
                )

        except httpx.TimeoutException:
            logger.warning(f"Geoapify autocomplete timed out for query: '{cleaned_query}'")
            return SearchResponse(results=[], count=0, query=cleaned_query)
        except Exception as e:
            logger.error(f"Geoapify autocomplete request failed: {e}", exc_info=True)
            return SearchResponse(results=[], count=0, query=cleaned_query)

    def _normalize_results(self, data: Dict[str, Any]) -> List[SearchResult]:
        normalized: List[SearchResult] = []

        # Handle 'results' array (format=json)
        raw_items = data.get("results")
        if raw_items is not None and isinstance(raw_items, list):
            for item in raw_items:
                res = self._parse_single_item(item)
                if res:
                    normalized.append(res)
            return normalized

        # Handle 'features' array (GeoJSON standard fallback)
        features = data.get("features", [])
        if isinstance(features, list):
            for feat in features:
                props = feat.get("properties", {})
                geom = feat.get("geometry", {})
                coords = geom.get("coordinates", [])
                if len(coords) >= 2 and "lon" not in props:
                    props["lon"] = coords[0]
                    props["lat"] = coords[1]
                res = self._parse_single_item(props)
                if res:
                    normalized.append(res)

        return normalized

    def _parse_single_item(self, item: Dict[str, Any]) -> Optional[SearchResult]:
        try:
            lat = item.get("lat")
            lon = item.get("lon")
            if lat is None or lon is None:
                return None

            place_id = str(item.get("place_id") or f"geo-{lat}-{lon}")
            
            # Extract primary name
            name = (
                item.get("name")
                or item.get("address_line1")
                or item.get("street")
                or item.get("formatted", "").split(",")[0]
                or "Unknown Location"
            ).strip()

            # Readable secondary address
            formatted = item.get("formatted")
            address_line2 = item.get("address_line2")
            if address_line2 and address_line2.strip():
                address = address_line2.strip()
            elif formatted and formatted.strip():
                address = formatted.strip()
            else:
                parts = [
                    item.get("suburb"),
                    item.get("city") or item.get("county"),
                    item.get("state"),
                    item.get("country")
                ]
                address = ", ".join([p for p in parts if p]) or name

            city = item.get("city") or item.get("county") or item.get("state_district") or ""
            state = item.get("state") or ""
            country = item.get("country") or ""
            result_type = item.get("result_type") or item.get("category") or "place"
            category = item.get("category")
            distance = item.get("distance")

            return SearchResult(
                id=place_id,
                name=name,
                address=address,
                city=city,
                state=state,
                country=country,
                latitude=float(lat),
                longitude=float(lon),
                type=result_type,
                category=category,
                distance_meters=float(distance) if distance is not None else None
            )
        except Exception as e:
            logger.debug(f"Failed parsing item from Geoapify: {e}")
            return None
