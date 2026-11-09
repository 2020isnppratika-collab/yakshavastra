import os
import sys

root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, "backend")

# If user runs 'py main.py' or 'python main.py' with global python,
# auto-switch to backend/venv where all packages are installed
venv_python = os.path.join(backend_dir, "venv", "Scripts", "python.exe")
if os.path.exists(venv_python) and os.path.normcase(sys.executable) != os.path.normcase(venv_python):
    import subprocess
    sys.exit(subprocess.call([venv_python] + sys.argv))

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.chdir(backend_dir)

if __name__ == "__main__":
    import uvicorn
    print("============================================================")
    print("  YakshaVastra — Yakshagana Costume Rental Backend API")
    print("============================================================")
    print("  API Server:        http://localhost:8000")
    print("  Swagger Docs:      http://localhost:8000/docs")
    print("  Health Check:      http://localhost:8000/health")
    print("============================================================")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
