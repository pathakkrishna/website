import requests
import json
import sys

def read_qr(image_path):
    url = "https://api.qrserver.com/v1/read-qr-code/"
    with open(image_path, "rb") as f:
        files = {"file": f}
        r = requests.post(url, files=files)
        data = r.json()[0]['symbol'][0]['data']
        print(f"QR link for {image_path}: {data}")

try:
    read_qr(r"d:\website\public\images\certificates\Java.png")
    read_qr(r"d:\website\public\images\certificates\OOPS.png")
except Exception as e:
    print("Error:", str(e))
