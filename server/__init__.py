import os

from server.db.models import session


# Constants
VERSION = "0.0.1"

# Middleware
def response_handler(func):
  """ Decorator for handling responses """
  def wrapper(*args, **kwargs):
    try:
      data = {
          **{"success": True},
          **func(*args, **kwargs)
        }
      return data
    except Exception as error:
      # Print error in red
      print("\033[91m" + str(error) + "\033[0m")

      # Rollback database session
      try:
        session.rollback()
      except Exception as e:
        pass
      finally:
        pass

      # Return error
      return {
        "success": False,
        "message": str(error)
      }
  return wrapper
