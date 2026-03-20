import cv2

def read_qr_cv2(image_path):
    img = cv2.imread(image_path)
    if img is None:
        print(f"Failed to load image: {image_path}")
        return
        
    detector = cv2.QRCodeDetector()
    data, bbox, straight_qrcode = detector.detectAndDecode(img)
    
    if data:
        print(f"QR Code data for {image_path}: {data}")
    else:
        print(f"No QR code found or could not decode for {image_path}")

read_qr_cv2(r"d:\website\public\images\certificates\Java.png")
read_qr_cv2(r"d:\website\public\images\certificates\OOPS.png")
