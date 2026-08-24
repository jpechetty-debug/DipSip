import zipfile
import os

zip_file = "dipsip-tracker(2).zip"
target_dir = "backend"

os.makedirs(target_dir, exist_ok=True)
with zipfile.ZipFile(zip_file, 'r') as zip_ref:
    zip_ref.extractall(target_dir)
print(f"Extracted {zip_file} to {target_dir}")
