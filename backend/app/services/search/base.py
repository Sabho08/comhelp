from abc import ABC, abstractmethod
from typing import Optional
from ...schemas.search import SearchResponse

class SearchProvider(ABC):
    """
    Abstract search provider interface allowing seamless swapping of
    geocoding & autocomplete backends (Geoapify, Nominatim, Photon, etc.)
    without modifying API routers or frontend logic.
    """

    @abstractmethod
    async def suggest(
        self,
        text: str,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        limit: int = 8
    ) -> SearchResponse:
        """
        Execute location autocomplete with optional proximity bias.
        """
        pass
