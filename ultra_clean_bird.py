import os
from PIL import Image

def ultra_clean_bird(file_path):
    if not os.path.exists(file_path):
        return
    
    img = Image.open(file_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    # Se a soma de R+G+B for maior que 600 (média de 200 por canal), 
    # e estivermos lidando com um fundo claro, vamos considerar transparente.
    # Mas pássaros costumam ser escuros ou coloridos.
    for item in data:
        # Se for muito claro, tchau
        if item[0] > 200 and item[1] > 200 and item[2] > 200:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    
    # Crop real baseado no alpha
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(file_path, "PNG")
    print(f"Ultra cleaned bird: {file_path} new size: {img.size}")

assets_dir = r"C:\Users\24025958\.gemini\antigravity\scratch\horse-runner\assets"
ultra_clean_bird(os.path.join(assets_dir, "bird.png"))
