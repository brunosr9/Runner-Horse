import os
from PIL import Image, ImageOps

def process_sprite(file_path, flip=False, rename_to=None):
    if not os.path.exists(file_path):
        print(f"File {file_path} not found.")
        return
    
    img = Image.open(file_path).convert("RGBA")
    
    # Encontrar a bounding box do conteúdo (não-branco)
    # Primeiro converter para escala de cinza e inverter para que o fundo seja preto (0)
    bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
    diff = Image.new("RGBA", img.size, (0,0,0,0))
    
    # Criar máscara para o que NÃO é branco
    datas = img.getdata()
    new_data = []
    min_x, min_y = img.width, img.height
    max_x, max_y = 0, 0
    
    for y in range(img.height):
        for x in range(img.width):
            item = datas[y * img.width + x]
            # Se a cor for clara (> 230), vira transparente
            if item[0] > 230 and item[1] > 230 and item[2] > 230:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
                # Atualiza bounding box
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)

    img.putdata(new_data)
    
    # Cortar se houver conteúdo
    if max_x > min_x and max_y > min_y:
        img = img.crop((min_x, min_y, max_x + 1, max_y + 1))
    
    if flip:
        img = img.transpose(Image.FLIP_LEFT_RIGHT)
        
    final_path = os.path.join(os.path.dirname(file_path), rename_to if rename_to else os.path.basename(file_path))
    img.save(final_path, "PNG")
    print(f"Saved: {final_path} (Size: {img.size})")

assets_dir = r"C:\Users\24025958\.gemini\antigravity\scratch\horse-runner\assets"
# O cavalo precisa de Flip para olhar para a direita
process_sprite(os.path.join(assets_dir, "horse.png"), flip=True)
process_sprite(os.path.join(assets_dir, "cactus.png"), rename_to="tree.png")
process_sprite(os.path.join(assets_dir, "bird.png"))
