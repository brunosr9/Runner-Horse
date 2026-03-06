from PIL import Image
import os

for p in ['assets/horse.png', 'assets/cactus.png', 'assets/bird.png']:
    if os.path.exists(p):
        img = Image.open(p)
        print(f"{p}: mode={img.mode}, size={img.size}")
    else:
        print(f"{p} not found")
