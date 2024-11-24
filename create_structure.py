import os

# Define the folder and file structure
structure = {
    "src": {
        "core": ["__init__.py", "area_manager.py", "risk_analyzer.py", "config.py"],
        "satellite": ["__init__.py", "sentinel_client.py", "data_processor.py"],
        "flz_drones": ["__init__.py", "fleet_manager.py", "mission_planner.py", "telemetry.py"],
        "api": ["__init__.py", "routes.py", "websocket.py"],
        "frontend": {
            "public": ["favicon.ico", "logo.svg", "index.html"],
            "src": {
                "components": {
                    "Map": [],
                    "Alerts": [],
                    "Dashboard": []
                },
                "pages": [],
                "utils": [],
                "App.tsx": ""
            },
            "package.json": "",
            "tsconfig.json": ""
        },
    },
    "tests": ["test_area_manager.py", "test_risk_analyzer.py"],
    "data": {
        "mock": {
            "sentinel_samples": [],
            "drone_samples": []
        },
        "processed": []
    },
    "docs": ["api.md", "setup.md", "architecture.md"],
    "requirements.txt": "",
    ".env.example": "",
    ".gitignore": "",
    "docker-compose.yml": "",
    "Dockerfile": "",
    "README.md": ""
}

# Function to create the structure
def create_structure(base_path, structure):
    for name, content in structure.items():
        path = os.path.join(base_path, name)
        if isinstance(content, dict):
            # Create directory and recurse
            os.makedirs(path, exist_ok=True)
            create_structure(path, content)
        elif isinstance(content, list):
            # Create directory and its files
            os.makedirs(path, exist_ok=True)
            for file in content:
                file_path = os.path.join(path, file)
                open(file_path, 'w').close()
        else:
            # Create file
            with open(path, 'w') as f:
                f.write(content)

# Run the script
base_dir = "front-line-zero"
os.makedirs(base_dir, exist_ok=True)
create_structure(base_dir, structure)

print(f"Project structure created at {os.path.abspath(base_dir)}")
