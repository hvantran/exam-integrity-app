import cv2
import numpy as np
from paddleocr import PaddleOCR

_ocr_engine = None

def _get_engine() -> PaddleOCR:
    global _ocr_engine
    if _ocr_engine is None:
        _ocr_engine = PaddleOCR(use_angle_cls=True, lang="vi", show_log=False)
    return _ocr_engine

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    img = cv2.fastNlMeansDenoising(img, h=10)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img = clahe.apply(img)
    _, img = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return img

def run_ocr_pipeline(pdf_or_image_bytes: bytes, is_image: bool = False) -> str:
    engine = _get_engine()
    preprocessed = preprocess_image(pdf_or_image_bytes)
    img_bgr = cv2.cvtColor(preprocessed, cv2.COLOR_GRAY2BGR)
    result = engine.ocr(img_bgr, cls=True)
    lines = []
    if result:
        for page_result in result:
            if page_result:
                for line in page_result:
                    text, confidence = line[1]
                    if confidence > 0.6:
                        lines.append(text)
    return "\n".join(lines)
