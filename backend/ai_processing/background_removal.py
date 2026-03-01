from io import BytesIO

from PIL import Image

try:
    from rembg import remove
except Exception:  # graceful fallback if rembg backend missing
    remove = None


def remove_background(image_bytes: bytes) -> Image.Image:
    if remove is not None:
        output = remove(image_bytes)
        return Image.open(BytesIO(output)).convert("RGBA")

    # fallback simple alpha conversion (keeps app functional without model download)
    image = Image.open(BytesIO(image_bytes)).convert("RGBA")
    datas = image.getdata()
    new_data = []
    for item in datas:
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    image.putdata(new_data)
    return image
