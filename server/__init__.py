import os
import logging
import traceback

from server.db.models import session


# Constants
VERSION = "0.0.1"
logger = logging.getLogger("control")

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
      logger.error("\033[91m" + str(error) + "\033[0m")
      logger.error(traceback.format_exc())

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
