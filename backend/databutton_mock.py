"""
Mock implementation of Databutton module for local development.
This allows the backend to run without the actual Databutton platform.
"""
import json
import os
import tempfile
from typing import Any, Dict, Optional
from pathlib import Path


class MockStorage:
    """Mock implementation of Databutton storage."""
    
    def __init__(self):
        self._storage_dir = Path(tempfile.gettempdir()) / "databutton_mock_storage"
        self._storage_dir.mkdir(exist_ok=True)
    
    class Json:
        def __init__(self, storage_dir: Path):
            self.storage_dir = storage_dir
            
        def get(self, key: str, default: Any = None) -> Any:
            """Get JSON data from mock storage."""
            file_path = self.storage_dir / f"{key}.json"
            if file_path.exists():
                try:
                    with open(file_path, 'r') as f:
                        return json.load(f)
                except (json.JSONDecodeError, IOError):
                    return default
            return default
        
        def put(self, key: str, value: Any) -> None:
            """Store JSON data in mock storage."""
            file_path = self.storage_dir / f"{key}.json"
            try:
                with open(file_path, 'w') as f:
                    json.dump(value, f, indent=2, default=str)
            except (TypeError, IOError) as e:
                print(f"Warning: Failed to store {key}: {e}")
        
        def delete(self, key: str) -> bool:
            """Delete JSON data from mock storage."""
            file_path = self.storage_dir / f"{key}.json"
            if file_path.exists():
                try:
                    file_path.unlink()
                    return True
                except IOError:
                    return False
            return False
    
    @property
    def json(self) -> Json:
        return self.Json(self._storage_dir)


class MockDatabutton:
    """Mock implementation of the main Databutton module."""
    
    def __init__(self):
        self.storage = MockStorage()
    
    def run_sql(self, query: str, params: Optional[Dict] = None) -> list:
        """Mock SQL execution - returns empty list."""
        print(f"Mock SQL query: {query}")
        if params:
            print(f"Mock SQL params: {params}")
        return []
    
    def get_secret(self, key: str) -> Optional[str]:
        """Get secret from environment variables."""
        return os.getenv(key)


# Create the mock instance
storage = MockStorage()
json_storage = storage.json

# Backwards compatibility
get = json_storage.get
put = json_storage.put
delete = json_storage.delete

# Create main module mock
mock_db = MockDatabutton()

# Export the interface that matches the real databutton module
__all__ = ['storage', 'json_storage', 'get', 'put', 'delete', 'mock_db']