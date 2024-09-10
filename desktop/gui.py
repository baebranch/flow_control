import os
import time
import webview
import pickle as pk
from threading import Thread

from server.db import seed_types
from server.server import run_app


def splash_close(window):
  """ Start servers and close splash screen after 7 seconds """
  server = Thread(target=run_app, daemon=True)
  server.start()

  # Seed the database with node and edge types on first run
  if (os.path.exists('settings.p')):
    settings = pk.load(open('settings.p', 'rb'))

    if not settings.get('seed_db', False):
      seed_types.seed()
      settings['seed_db'] = True
      pk.dump(settings, open('settings.p', 'wb'))
  
  else:
    seed_types.seed()
    pk.dump({'seed_db': True}, open('settings.p', 'wb'))

  # Close splash screen
  time.sleep(7)
  window.destroy()


# Create splash screen
if os.path.exists('splash.html'):
  splash_screen = webview.create_window('Flow Control', html=(open('splash.html', 'r').read()), frameless=True, width=480, height=307)
else:
  splash_screen = webview.create_window('Flow Control', html=(open('desktop\splash.html', 'r').read()), frameless=True, width=480, height=307)
webview.start(splash_close, (splash_screen,), http_server=False)

# Open main window 
window = webview.create_window('Flow Control', 'http://flow.localhost:1212/') 

webview.start() 
