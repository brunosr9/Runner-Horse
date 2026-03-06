import os
from PIL import Image

def make_transparent(file_path):
    if not os.path.exists(file_path):
        print(f"File {file_path} not found.")
        return
    
    img = Image.open(file_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        # Se a cor for próxima de branco (R, G, B > 240), torna transparente
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(file_path, "PNG")
    print(f"Processed {file_path}")

assets_dir = r"C:\Users\24025958\.gemini\antigravity\scratch\horse-runner\assets"
make_transparent(os.path.join(assets_dir, "horse.png"))
make_transparent(os.path.join(assets_dir, "cactus.png"))
make_transparent(os.path.join(assets_dir, "bird.png"))
