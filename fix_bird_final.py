import os
from PIL import Image

def fix_bird_transparency(file_path):
    if not os.path.exists(file_path):
        print(f"File {file_path} not found.")
        return
    
    img = Image.open(file_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    min_x, min_y = img.width, img.height
    max_x, max_y = 0, 0
    
    # Threshold agressivo para branco (se R+G+B > 720, considerando 255+255+255=765)
    # Vamos usar um valor mais seguro: se a média for > 240
    for y in range(img.height):
        for x in range(img.width):
            item = datas[y * img.width + x]
            if item[0] > 235 and item[1] > 235 and item[2] > 235:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)

    img.putdata(new_data)
    
    # Auto-crop
    if max_x > min_x and max_y > min_y:
        img = img.crop((min_x, min_y, max_x + 1, max_y + 1))
        
    img.save(file_path, "PNG")
    print(f"Bird fixed and cropped to {img.size}")

assets_dir = r"C:\Users\24025958\.gemini\antigravity\scratch\horse-runner\assets"
fix_bird_transparency(os.path.join(assets_dir, "bird.png"))
