import sys
import os
import uvicorn

# Ensure the root directory is on the Python path
root_dir = os.path.dirname(os.path.abspath(__file__))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

if __name__ == "__main__":
    print(f"Starting AccessRoute Live Backend from {root_dir}...")
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
