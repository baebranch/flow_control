import tkinterweb
import tkinter as tk
from PIL import Image, ImageTk


# Create splash screen
splash = tk.Tk()
splash_width = 546
splash_height = 307
screen_width = splash.winfo_screenwidth()
screen_height = splash.winfo_screenheight()
x_cordinate = int((screen_width/2) - (splash_width/2))
y_cordinate = int((screen_height/2) - (splash_height/2))
splash.geometry("{}x{}+{}+{}".format(splash_width, splash_height, x_cordinate, y_cordinate))
splash.overrideredirect(1) # Remove title bar i.e. frameless
splash.bind("<B1-Motion>", lambda event: splash.geometry(f'+{event.x_root}+{event.y_root}')) # Moving the window

# Add splash image to splash screen
image = ImageTk.PhotoImage(Image.open('./desktop/logo.png').resize((splash_width, splash_height)))
image_label = tk.Label(splash, image=image)
image_label.pack()

 
def main():
  """ Main function to execute tkinter """
  # destroy splash window
  splash.destroy()

  # Create main application window
  root = tk.Tk()
  root.geometry("700x500")
  # root.state('zoomed') # Fullscreen
  root.iconbitmap('./desktop/favicon.ico')

  # Create a webview
  frame = tkinterweb.HtmlFrame(root)
  frame.load_website('https://www.google.com')    
  frame.pack(fill="both", expand=True)


# Set splash screen duration and call main function
splash.after(3000, main)
tk.mainloop()
