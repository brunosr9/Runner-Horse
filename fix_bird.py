import os
from PIL import Image

def process_bird(file_path):
    if not os.path.exists(file_path):
        print(f"File {file_path} not found.")
        return
    
    img = Image.open(file_path).convert("RGBA")
    # Inverter o pássaro para olhar para a esquerda
    img = img.transpose(Image.FLIP_LEFT_RIGHT)
    img.save(file_path, "PNG")
    print(f"Flipped bird: {file_path}")

assets_dir = r"C:\Users\24025958\.gemini\antigravity\scratch\horse-runner\assets"
process_bird(os.path.join(assets_dir, "bird.png"))

# Deletar o cacto para limpar o projeto
cactus_path = os.path.join(assets_dir, "cactus.png")
if os.path.exists(cactus_path):
    os.remove(cactus_path)
    print("Removed cactus.png")
