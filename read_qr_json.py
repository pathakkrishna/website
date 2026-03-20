import requests
import json
import sys

def read_qr(image_path):
    url = "https://api.qrserver.com/v1/read-qr-code/"
    with open(image_path, "rb") as f:
        files = {"file": f}
        r = requests.post(url, files=files)
        data = r.json()[0]['symbol'][0]['data']
        return data

try:
    results = {
        "Java": read_qr(r"d:\website\public\images\certificates\Java.png"),
        "OOPS": read_qr(r"d:\website\public\images\certificates\OOPS.png")
    }
    with open(r"d:\website\qr_results.json", "w") as f:
        json.dump(results, f)
except Exception as e:
    with open(r"d:\website\qr_results.json", "w") as f:
        json.dump({"error": str(e)}, f)
