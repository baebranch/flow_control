from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
  pass


engine = create_engine('sqlite:///data/application.db')


def schema_update_handler(func, *args):
  try:
    func(*args)
    print("Schema updated")
  except Exception as error:
    pass
