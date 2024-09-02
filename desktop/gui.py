import time
import webview 


def splash_close(window):
  """ Close splash screen after 7 seconds """
  # Start servers and backend processes

  # Close splash screen
  time.sleep(7)
  window.destroy()


# Create splash screen
splash_screen = webview.create_window('Flow Control', html=open('desktop/splash.html', 'r').read(), frameless=True, width=480, height=307)
webview.start(splash_close, (splash_screen,), http_server=False)

# Open main window 
webview.create_window('Flow Control', 'http://localhost:1212/') 
webview.start() 
