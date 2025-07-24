#gui.py

from dearpygui.dearpygui import *

def start_gui():
    create_context()

    with texture_registry():
        result = load_image("placeholder.png")
        if result:
            width, height, channels, data = result
            add_static_texture(width, height, data, tag="placeholder_texture")
        else:
            print("Could not load placeholder.png")
            return

    with window(label="Live Feed"):
        add_image("placeholder_texture", width=640, height=480)

    create_viewport(title="Space Explorer", width=800, height=600)
    setup_dearpygui()
    show_viewport()
    start_dearpygui()
    destroy_context()
