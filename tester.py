import dearpygui.dearpygui as dpg

dpg.create_context()

with dpg.window(label="Celestial", width=400, height=300):
    dpg.add_text("Hello from Celestial AI!")

dpg.create_viewport(title='Celestial Explorer', width=600, height=400)
dpg.setup_dearpygui()
dpg.show_viewport()
dpg.start_dearpygui()
dpg.destroy_context()
