import time
import webview
from threading import Thread

from server.server import run_app


def splash_close(window):
  """ Start servers and close splash screen after 7 seconds """
  server = Thread(target=run_app, daemon=True)
  server.start()

  # Close splash screen
  time.sleep(7)
  window.destroy()


# Create splash screen
splash_screen = webview.create_window('Flow Control', html=(open('splash.html', 'r').read()), frameless=True, width=480, height=307)
webview.start(splash_close, (splash_screen,), http_server=False)

# Open main window 
window = webview.create_window('Flow Control', 'http://flow.localhost:1212/') 

webview.start() 
