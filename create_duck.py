from PIL import Image
import os

def create_duck_sprite(horse_path, output_path):
    if not os.path.exists(horse_path):
        print(f"Horse sprite not found at {horse_path}")
        return
    
    img = Image.open(horse_path).convert("RGBA")
    # Comprime a imagem verticalmente para 60% do tamanho para simular o cavalo se abaixando
    w, h = img.size
    duck_img = img.resize((w, int(h * 0.6)), Image.Resampling.LANCZOS)
    
    # Salva o novo sprite
    duck_img.save(output_path, "PNG")
    print(f"Duck sprite created at {output_path}")

assets_dir = r"C:\Users\24025958\.gemini\antigravity\scratch\horse-runner\assets"
create_duck_sprite(os.path.join(assets_dir, "horse.png"), os.path.join(assets_dir, "horse_duck.png"))
