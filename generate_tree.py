from PIL import Image, ImageDraw
import os

def create_pixel_tree(path):
    # Criar uma imagem 64x64 transparente (RGBA)
    img = Image.new("RGBA", (64, 64), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    # Tronco (Marrom)
    draw.rectangle([28, 40, 36, 60], fill=(101, 67, 33, 255))
    
    # Folhagens (Verdes) - Círculos sobrepostos para parecer nuvem de folhas
    # Base
    draw.ellipse([10, 20, 54, 45], fill=(34, 139, 34, 255))
    # Topo
    draw.ellipse([20, 10, 44, 30], fill=(50, 205, 50, 255))
    # Detalhes claros em cima
    draw.ellipse([25, 12, 35, 20], fill=(144, 238, 144, 255))

    img.save(path, "PNG")
    print(f"Created: {path}")

assets_dir = r"C:\Users\24025958\.gemini\antigravity\scratch\horse-runner\assets"
create_pixel_tree(os.path.join(assets_dir, "tree.png"))
