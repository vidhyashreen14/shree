
import sys
from PIL import Image, ImageDraw

def flood_fill_bg(img_path, output_path):
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    
    # We will do a flood fill from the four corners to identify background pixels
    # We use a color tolerance since compression might make background not perfectly white
    pixels = img.load()
    
    # Visited set for flood fill
    visited = set()
    bg_mask = Image.new("1", img.size, 0)
    
    # Tolerance for off-white
    tolerance = 15
    
    def is_bg_color(color):
        r, g, b, a = color
        # Background is white/light grey (r, g, b close to 255)
        return r >= (255 - tolerance) and g >= (255 - tolerance) and b >= (255 - tolerance)

    # Queue for BFS flood fill
    queue = []
    # Add corners
    corners = [(0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)]
    for x, y in corners:
        if is_bg_color(pixels[x, y]):
            queue.append((x, y))
            visited.add((x, y))
            bg_mask.putpixel((x, y), 1)

    while queue:
        cx, cy = queue.pop(0)
        # Check neighbors
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) not in visited:
                    if is_bg_color(pixels[nx, ny]):
                        queue.append((nx, ny))
                        visited.add((nx, ny))
                        bg_mask.putpixel((nx, ny), 1)

    # Apply mask: make mask pixels fully transparent
    for x in range(width):
        for y in range(height):
            if bg_mask.getpixel((x, y)):
                pixels[x, y] = (0, 0, 0, 0)

    img.save(output_path, "PNG")
    print("Background flood fill complete!")

if __name__ == "__main__":
    flood_fill_bg(
        "C:\\Users\\vinay\\.gemini\\antigravity-ide\\brain\\c4758d27-9965-4e0a-acc0-9aec58198490\\media__1784358803053.png",
        "c:\\Files_here\\Team-Doc-Files\\Love-DOC-Team\\NextJS-Frontend-Web\\frontend\\web\\public\\login-illustration.png"
    )
